import Redis from 'ioredis';
import './loadEnv.js';


const redisUrl = process.env.REDIS_URL;
export const redis = new Redis(redisUrl);

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
