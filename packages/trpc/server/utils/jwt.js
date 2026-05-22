import jwt from 'jsonwebtoken';

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your_access_secret_key';
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret_key';
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); 
  return { accessToken, refreshToken };
};