import { router } from './trpc.js';
import { authRouter } from './routes/auth.js';
import { formRouter } from './routes/forms.js'; 
import { reviewsRouter } from './routes/reviews.js';
import { billingRouter } from './routes/billing.js';
import { aiRouter } from './routes/ai.js';

import { webhooksRouter } from './routes/webhooks.js';

export const appRouter = router({
  auth: authRouter,
  form: formRouter,
  review:reviewsRouter,
  billing: billingRouter,
  ai: aiRouter,
  webhook: webhooksRouter,
});

export { createContext } from './context.js';
export { startCronJobs } from './utils/cron.js';
export { generateTokens } from './utils/jwt.js';

