import { db } from '@repo/database';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = ({ req, res }) => {
  // In the future, you will verify the user's token from req.headers here
  // const user = verifyToken(req.headers.authorization);

  return {
    req,
    res,
    db,
    // user
  };
};