import { initTRPC, TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from './utils/jwt.js';
import { checkRateLimit } from './utils/rateLimit.js'; 
import { db, workspaceMembers } from '@repo/database';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const t = initTRPC.context().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const getClientIp = (req) => {
  return req?.headers?.['x-forwarded-for']?.split(',')[0] 
      || req?.socket?.remoteAddress 
      || req?.ip 
      || 'unknown-ip';
};

// --- 1. Standard Public Limiter (Browsing forms, fetching templates) ---
// Policy: 100 requests per 5 minutes
const standardRateLimiter = t.middleware(async ({ ctx, next }) => {
  const clientIp = getClientIp(ctx.req);
  
  const { allowed } = await checkRateLimit(`ip:standard:${clientIp}`, 100, 300);
  
  if (!allowed) {
    throw new TRPCError({ 
      code: 'TOO_MANY_REQUESTS', 
      message: 'Rate limit exceeded. Please slow down.' 
    });
    
  }

  return next({ ctx });
});

// --- 2. Strict Public Limiter (Auth, Passwords) ---
// Policy: 5 requests per 15 minutes
const strictRateLimiter = t.middleware(async ({ ctx, next }) => {
  const clientIp = getClientIp(ctx.req);
  
  const { allowed } = await checkRateLimit(`ip:strict:${clientIp}`, 5, 900);
  
  if (!allowed) {
    throw new TRPCError({ 
      code: 'TOO_MANY_REQUESTS', 
      message: 'You are doing that too much. Please try again in 15 minutes and touch some grass!!' 
    });
  }

  return next({ ctx });
});

// --- 3. Form Response Limiter ---
// Policy: 5 response submissions per 15 minutes
const formResponseRateLimiter = t.middleware(async ({ ctx, next }) => {
  const clientIp = getClientIp(ctx.req);

  const { allowed } = await checkRateLimit(`ip:form-response:${clientIp}`, 5, 900);

  if (!allowed) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many form responses submitted. Please try again in 15 minutes.',
    });
  }

  return next({ ctx });
});

// --- 4. Authenticated Limiter (Dashboard actions) ---
// Policy: 60 requests per 1 minute
const isAuthed = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req?.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing Token' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], ACCESS_TOKEN_SECRET);
    const { allowed } = await checkRateLimit(`user:${decoded.id}`, 60, 60);
    
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

// --- 5. Workspace Access Middleware ---
// Verifies the authenticated user is a member of the requested workspace
// and injects workspaceId + workspaceRole into ctx for downstream RBAC.
const isWorkspaceMember = t.middleware(async ({ ctx, rawInput, next }) => {
  // rawInput may be an object with workspaceId at the top level
  const workspaceId = rawInput?.workspaceId;

  if (!workspaceId || typeof workspaceId !== 'string') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'workspaceId is required',
    });
  }

  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, ctx.user.id),
      )
    )
    .limit(1);

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this workspace',
    });
  }

  return next({
    ctx: {
      ...ctx,
      workspaceId,
      workspaceRole: membership.role,
    },
  });
});

// --- EXPORT SPECIFIC PROCEDURES ---
export const standardPublicProcedure = t.procedure.use(standardRateLimiter);
export const strictPublicProcedure = t.procedure.use(strictRateLimiter);
export const formResponseProcedure = t.procedure.use(formResponseRateLimiter);
export const protectedProcedure = t.procedure.use(isAuthed);
export const workspaceProcedure = t.procedure.use(isAuthed).use(isWorkspaceMember);

