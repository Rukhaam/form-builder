import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Connect to your Redis instance (e.g., Upstash, AWS ElastiCache, or local)
// Make sure to add REDIS_URL to your .env file
const redisUrl = process.env.REDIS_URL;
export const redis = new Redis(redisUrl);

/**
 * Distributed Rate Limiter using Redis
 * @param {string} identifier - Unique key (e.g., IP address or User ID)
 * @param {number} limit - Max requests allowed in the window
 * @param {number} windowSeconds - Time window in seconds
 */
export const checkRateLimit = async (identifier, limit = 5, windowSeconds = 900) => {
  const key = `ratelimit:${identifier}`;

  try {
    const currentCount = await redis.incr(key);
    if (currentCount === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (currentCount > limit) {
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: limit - currentCount };
  } catch (error) {
    console.error('Redis Rate Limiting Error:', error);
    return { allowed: true, remaining: 1 }; 
  }
};