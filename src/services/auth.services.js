
import speakeasy from "speakeasy";
import transporter from "../config/email.config.js";
import bcrypt from "bcryptjs";

export const registerUser = async (user) => {
 try{
      // Encrypt password
   const salt = bcrypt.genSaltSync(10);
   payload.password = bcrypt.hashSync(payload.password, salt);

   // Create user
   const user = await prisma.user.create({
     data: payload,
   });

   return res.json({
     status: 200,
     message: "User created successfully",
     data: user,
   });
 }
  catch (error) {
   console.error("Register Error:", error);

   if (error instanceof errors.E_VALIDATION_ERROR) {
     return res.status(400).json({ status: 400, error: error.messages });
   }
}};


// Send OTP via email
export const sendOtpMail = async (email,user) => {

       // Generate OTP
       const otp = speakeasy.totp({
        secret: user.twoFactorSecret,
        encoding: "base32",
        digits: 6,
      });

      // Send OTP via email
      await transporter.sendMail({
        from: `"Dokaan Support Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your One-Time Password (OTP) for Secure Access",
        text: `Dear User,
      
We have generated a One-Time Password (OTP) to verify your login or perform a secure action. 
      
Your OTP Code: ${otp}
      
This code is valid for a limited time only. Please use it promptly to complete the verification process. 
      
If you did not request this code, please disregard this email or contact our support team immediately.
      
Best regards,  
The Dokaan Support Team`,
      });

    }


// Verify OTP
export const verifyOtp = async (otp, user) => {
  // Verify OTP
  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!isValid) {
    return "Invalid OTP";
  }

  return null;
};
