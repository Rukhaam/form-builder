import { router } from './trpc.js';
import { authRouter } from './routes/auth.js';
import { formRouter } from './routes/forms.js'; 
import { reviewsRouter } from './routes/reviews.js';

export const appRouter = router({
  auth: authRouter,
  form: formRouter,
  review:reviewsRouter 
});

export { createContext } from './context.js';
export { startCronJobs } from './utils/cron.js';
export { generateTokens } from './utils/jwt.js';

