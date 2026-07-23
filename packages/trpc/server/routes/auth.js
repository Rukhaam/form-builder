import { router, publicProcedure, strictPublicProcedure } from "../trpc.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@repo/schemas";
import { users } from "@repo/database";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";
import {
  generateTokens,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../utils/jwt.js";
import { generateOtpWithExpiry } from "../utils/otp.js";

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existingUser.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }
      const { otp, otpExpiry } = generateOtpWithExpiry();

      const hashedPassword = await bcrypt.hash(password, 10);

      await ctx.db.insert(users).values({
        email,
        passwordHash: hashedPassword,
        authProvider: "LOCAL",
        otp,
        otpExpiry,
        isEmailVerified: false,
      });

      await sendVerificationEmail(email, otp);

      return { message: "OTP sent to email. Please verify to continue." };
    }),

  verifyOtp: publicProcedure
    .input(verifyOtpSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, otp } = input;

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (user.otp !== otp)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid OTP" });
      if (new Date() > user.otpExpiry)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "OTP has expired",
        });

      const [updatedUser] = await ctx.db
        .update(users)
        .set({ isEmailVerified: true, otp: null, otpExpiry: null })
        .where(eq(users.id, user.id))
        .returning();

      const tokens = generateTokens(updatedUser);
      return {
        user: { id: updatedUser.id, email: updatedUser.email },
        ...tokens,
      };
    }),

  login: strictPublicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user || !user.passwordHash)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });

      if (!user.isEmailVerified)
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Please verify your email before logging in. If you lost your code, please register again.",
        });

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });

      const tokens = generateTokens(user);
      return { user: { id: user.id, email: user.email }, ...tokens };
    }),

  forgotPassword: strictPublicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { email } = input;

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user)
        return { message: "If an account exists, a reset code has been sent." };
      if (user.authProvider === "GOOGLE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This account uses Google Sign-In. Please log in with Google.",
        });
      }

      const { otp, otpExpiry } = generateOtpWithExpiry();

      await ctx.db
        .update(users)
        .set({ otp, otpExpiry })
        .where(eq(users.id, user.id));

      await sendPasswordResetEmail(email, otp);

      return { message: "If an account exists, a reset code has been sent." };
    }),

  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, otp, newPassword } = input;

      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (user.otp !== otp)
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid OTP" });
      if (new Date() > user.otpExpiry)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "OTP has expired",
        });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await ctx.db
        .update(users)
        .set({
          passwordHash: hashedPassword,
          otp: null,
          otpExpiry: null,
          isEmailVerified: true,
        })
        .where(eq(users.id, user.id));

      return {
        message: "Password has been reset successfully. You can now log in.",
      };
    }),

  refresh: publicProcedure
    .input(refreshTokenSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const decoded = jwt.verify(input.refreshToken, REFRESH_TOKEN_SECRET);

        const [user] = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, decoded.id))
          .limit(1);
        if (!user) throw new Error("User no longer exists");

        const newAccessToken = jwt.sign(
          { id: user.id, email: user.email },
          ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );

        return { accessToken: newAccessToken };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired refresh token. Please log in again.",
        });
      }
    }),
});
