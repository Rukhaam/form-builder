import express from 'express';
import { db, users } from '@repo/database';
import { eq } from 'drizzle-orm';
import { generateTokens } from '@repo/trpc/server/utils/jwt.js';

export const oauthRouter = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';


oauthRouter.get('/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});

oauthRouter.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) throw new Error(tokenData.error_description || 'Failed to fetch tokens');
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    
    const googleUser = await userResponse.json();
    let user = await db.select().from(users).where(eq(users.email, googleUser.email)).limit(1).then(res => res[0]);

    if (!user) {
      const [newUser] = await db.insert(users).values({
        email: googleUser.email,
        authProvider: 'GOOGLE',
        providerId: googleUser.id,
        isEmailVerified: true, // Google already verified them
      }).returning();
      user = newUser;
    } else {
      if (user.authProvider === 'LOCAL') {
        const [updatedUser] = await db.update(users)
          .set({ authProvider: 'GOOGLE', providerId: googleUser.id, isEmailVerified: true })
          .where(eq(users.id, user.id))
          .returning();
        user = updatedUser;
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res.redirect(`${FRONTEND_URL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);

  } catch (error) {
    console.error('OAuth Error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});