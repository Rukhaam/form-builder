import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '@repo/trpc/server'; // Importing from the new package
import { createContext } from '@repo/trpc/server/context'; // For passing DB/Auth

const app = express();
app.use(cors());

// The API is just a shell that forwards requests to the tRPC package
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(4000, () => {
  console.log('API running on port 4000');
});