import { db } from "@repo/database";
import jwt from "jsonwebtoken";

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = decoded;
    } catch (error) {
      console.error("Invalid token");
    }
  }

  return {
    req,
    res,
    db,
    user,
  };
};
