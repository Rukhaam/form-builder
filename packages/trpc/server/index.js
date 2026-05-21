import { router, publicProcedure } from './trpc.js';
import { authRouter } from './routes/auth.js';
import { formsRouter } from './routes/forms.js';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return { status: 'ok', message: 'tRPC backend is alive!' };
  }),
  
  // Merge domain routers
  auth: authRouter,
  forms: formsRouter,
});

