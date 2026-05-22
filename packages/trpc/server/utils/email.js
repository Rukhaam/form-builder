import { resend } from "./resend.js";

/**
 * Sends a verification OTP email to the user
 * @param {string} to - The recipient's email address
 * @param {string} otp - The 6-digit verification code
 */
export const sendVerificationEmail = async (to, otp) => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to FormBuilder!</h2>
        <p style="color: #555; font-size: 16px;">Thank you for registering. Please use the verification code below to complete your sign-up:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <strong style="font-size: 36px; letter-spacing: 6px; color: #111;">${otp}</strong>
        </div>
        
        <p style="color: #777; font-size: 14px; text-align: center;">This code will expire in <strong>15 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: "form builder <support@summitdigital.in>",
      to: to,
      subject: "Verify your FormBuilder Account",
      html: htmlTemplate,
    });

    if (response?.error) {
      console.error("🚨 RESEND BLOCKED THE EMAIL:", response.error.message);
      throw new Error(response.error.message);
    }

    return response;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to, otp) => {
  try {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">We received a request to reset your FormBuilder password. Use the code below to set a new password:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <strong style="font-size: 36px; letter-spacing: 6px; color: #111;">${otp}</strong>
        </div>
        
        <p style="color: #777; font-size: 14px; text-align: center;">This code will expire in <strong>15 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
      </div>
    `;
    const response = await resend.emails.send({
      from: "form builder <support@summitdigital.in>",
      to: to,
      subject: "Password Reset Request",
      html: htmlTemplate,
    });
    if (response?.error) {
      console.error("🚨 RESEND BLOCKED THE EMAIL:", response.error.message);
      throw new Error(response.error.message);
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
