import express from 'express';
import { db, users } from '@repo/database';
import { eq } from 'drizzle-orm';
import { generateTokens } from '@repo/trpc/server/utils/jwt.js';

export const oauthRouter = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://form-builder-by-rukhaam.vercel.app').replace(/\/+$/, '');

function redirectWithOAuthError(res, error) {
  res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
}

oauthRouter.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    redirectWithOAuthError(res, 'oauth_not_configured');
    return;
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent('profile email')}&prompt=select_account`;
  res.redirect(url);
});

oauthRouter.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      redirectWithOAuthError(res, 'oauth_missing_code');
      return;
    }

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
    if (!userResponse.ok || !googleUser.email) {
      throw new Error('Failed to fetch Google profile');
    }

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
        redirectWithOAuthError(res, 'manual_account_exists');
        return;
      }

      if (user.authProvider !== 'GOOGLE') {
        redirectWithOAuthError(res, 'oauth_account_mismatch');
        return;
      }

      if (!user.providerId) {
        const [updatedUser] = await db.update(users)
          .set({ providerId: googleUser.id, isEmailVerified: true })
          .where(eq(users.id, user.id))
          .returning();
        user = updatedUser;
      } else if (user.providerId !== googleUser.id) {
        redirectWithOAuthError(res, 'oauth_account_mismatch');
        return;
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res.redirect(`${FRONTEND_URL}/auth/success?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);

  } catch (error) {
    console.error('OAuth Error:', error);
    redirectWithOAuthError(res, 'oauth_failed');
  }
});
