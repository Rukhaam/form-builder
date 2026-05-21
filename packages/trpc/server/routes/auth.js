// Auth routes
import { router, publicProcedure } from '../trpc.js';
import { registerSchema, loginSchema } from '@repo/schemas';

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {

      return { message: `Registered user: ${input.email}` };
    }),
});