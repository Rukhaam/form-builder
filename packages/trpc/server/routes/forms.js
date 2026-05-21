// Forms routes
import { router, publicProcedure } from '../trpc.js';
import { createFormSchema } from '@repo/schemas';

export const formsRouter = router({
  create: publicProcedure
    .input(createFormSchema)
    .mutation(async ({ input, ctx }) => {
      return { message: `Created form: ${input.title}` };
    }),
});