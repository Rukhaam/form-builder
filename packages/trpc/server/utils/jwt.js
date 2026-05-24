import jwt from 'jsonwebtoken';


export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;


export const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); 
  return { accessToken, refreshToken };
};