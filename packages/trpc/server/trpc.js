import { initTRPC, TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from './utils/jwt.js';
import { checkRateLimit } from './utils/rateLimit.js'; 
const t = initTRPC.context().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// --- 1. Custom Public Rate Limiter (IP Based) ---
const publicRateLimiter = t.middleware(({ ctx, next }) => {
  const clientIp = ctx.req?.ip || ctx.req?.socket?.remoteAddress || 'unknown-ip';
  
  // 5 requests per 15 minutes per IP
  const { allowed } = checkRateLimit(`ip:${clientIp}`, 5, 15);
  
  if (!allowed) {
    throw new TRPCError({ 
      code: 'TOO_MANY_REQUESTS', 
      message: 'You are doing that too much. Please try again in 15 minutes and touch some grass!!' 
    });
  }

  return next({ ctx });
});

const isAuthed = t.middleware(({ ctx, next }) => {
  const authHeader = ctx.req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing Token' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], ACCESS_TOKEN_SECRET);
    
    const { allowed } = checkRateLimit(`user:${decoded.id}`, 60, 1);
    
    if (!allowed) {
        throw new TRPCError({ 
          code: 'TOO_MANY_REQUESTS', 
          message: 'API rate limit exceeded.' 
        });
    }

    return next({ ctx: { ...ctx, user: decoded } });
  } catch (err) {
    if (err instanceof TRPCError) throw err;
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Token' });
  }
});


export const strictPublicProcedure = t.procedure.use(publicRateLimiter);
export const protectedProcedure = t.procedure.use(isAuthed);