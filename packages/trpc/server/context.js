import { db } from "@repo/database";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "./utils/jwt.js";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export const createContext = ({ req, res }) => {
  let user = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      user = decoded;
    } catch {
      // Protected procedures perform the authoritative auth check.
      // Context only hydrates an optional user when a valid token is present.
    }
  }

  return {
    req,
    res,
    db,
    user,
  };
};
