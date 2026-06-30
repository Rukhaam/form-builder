import Redis from "ioredis";
import "./loadEnv.js";

const redisUrl = process.env.REDIS_URL;
export const redis = new Redis(redisUrl);

/**
 * Extracts the client IP address from an Express/tRPC request object.
 * Handles proxied requests (x-forwarded-for), direct connections, and Express's req.ip.
 * @param {object} req - The incoming HTTP request object.
 * @returns {string} The client's IP address.
 */
export const getClientIp = (req) => {
  const forwarded = req?.headers?.["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; the first entry is the real client
    return forwarded.split(",")[0].trim();
  }

  return (
    req?.socket?.remoteAddress ||
    req?.connection?.remoteAddress ||
    req?.ip ||
    "unknown-ip"
  );
};

/**
 * IP-based rate limiter backed by Redis.
 *
 * Uses a sliding-window counter per (namespace + client IP) pair.
 * The identifier is always the client's IP address, extracted automatically
 * from the request object.
 *
 * @param {object}  req                - The incoming HTTP request (used to extract the client IP).
 * @param {object}  [options]          - Rate-limit configuration.
 * @param {string}  [options.namespace='global'] - A namespace prefix to isolate different rate-limit buckets
 *                                                 (e.g. 'auth', 'form-response', 'standard').
 * @param {number}  [options.limit=5]            - Maximum number of allowed requests in the window.
 * @param {number}  [options.windowSeconds=900]  - Length of the sliding window in seconds (default 15 min).
 * @returns {Promise<{allowed: boolean, remaining: number, ip: string, retryAfter: number|null}>}
 */
export const checkRateLimit = async (
  req,
  { namespace = "global", limit = 5, windowSeconds = 900 } = {},
) => {
  const clientIp = getClientIp(req);
  const key = `ratelimit:${namespace}:${clientIp}`;

  try {
    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (currentCount > limit) {
      // Fetch remaining TTL so callers can surface a Retry-After header/message
      const ttl = await redis.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        ip: clientIp,
        retryAfter: ttl > 0 ? ttl : windowSeconds,
      };
    }

    return {
      allowed: true,
      remaining: limit - currentCount,
      ip: clientIp,
      retryAfter: null,
    };
  } catch (error) {
    console.error("Redis Rate Limiting Error:", error);
    // Fail open — if Redis is down, don't block legitimate users
    return { allowed: true, remaining: 1, ip: clientIp, retryAfter: null };
  }
};

/**
 * Checks if an IP has already submitted a response to a specific form.
 * Uses a Redis SET per form to store all IPs that have submitted.
 * Unlike the sliding-window `checkRateLimit`, this is a permanent record
 * (no expiry) so the same IP can never submit twice.
 *
 * @param {object} req    - The incoming HTTP request (used to extract the client IP).
 * @param {string} formId - The form UUID to scope the check to.
 * @returns {Promise<{allowed: boolean, ip: string}>}
 */
export const checkOneResponsePerIp = async (req, formId) => {
  const clientIp = getClientIp(req);
  const key = `one-response:${formId}`;

  try {
    // SADD returns 1 if the member was newly added, 0 if it already existed
    const added = await redis.sadd(key, clientIp);
    return { allowed: added === 1, ip: clientIp };
  } catch (error) {
    console.error("Redis One-Response-Per-IP Error:", error);
    // Fail open — if Redis is down, don't block legitimate users
    return { allowed: true, ip: clientIp };
  }
};
