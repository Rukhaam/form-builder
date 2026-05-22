import crypto from 'crypto';

/**

 * @param {number} expirationMinutes 
 * @returns {{ otp: string, otpExpiry: Date }}
 */
export const generateOtpWithExpiry = (expirationMinutes = 15) => {
  const otp = crypto.randomInt(100000, 1000000).toString(); 
  const otpExpiry = new Date(Date.now() + expirationMinutes * 60 * 1000);
  
  return { otp, otpExpiry };
};