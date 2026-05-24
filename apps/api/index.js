import './env.js';
import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import helmet from 'helmet';


import { appRouter, startCronJobs } from '@repo/trpc/server/index.js'; 
import { createContext } from '@repo/trpc/server/context.js';
import { oauthRouter } from './oauth.js'; 

const app = express();
app.use(helmet())

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use('/api/auth', oauthRouter);


app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  startCronJobs();
});