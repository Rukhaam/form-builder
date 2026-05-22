const rateLimitCache = new Map();

setInterval(() => {
      const now =  Date.now();
      for(const[key, record] of rateLimitCache.entries()) {
        if(now > record.resetTime) {
          rateLimitCache.delete(key);
        }
      }
}, 60 * 1000); 


export const checkRateLimit = (identifier, limit = 5, windowMinutes = 15) => {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const record = rateLimitCache.get(identifier);
  if (!record || now > record.resetTime) {
    rateLimitCache.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
};