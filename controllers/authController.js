import prisma from "../config/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema, loginSchema } from "../validation/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import transporter from "../config/email.config.js";

class AuthController {
  // Register User
  static async register(req, res) {
    try {
      const { body } = req;

      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      // Check if user already exists
      const userExist = await prisma.user.findFirst({
        where: { email: payload.email },
      });

      if (userExist) {
        return res
          .status(400)
          .json({ status: 400, message: "User already exists" });
      }

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
    } catch (error) {
      console.error("Register Error:", error);

      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ status: 400, error: error.messages });
      }

      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }

  // Login User
  static async login(req, res) {
    try {
      const { body } = req;
      console.log(body);

      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return res.status(400).json({ status: 400, message: "User does not exist" });
      }

      // Compare password
      const isMatch = bcrypt.compareSync(payload.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ status: 400, message: "Incorrect password" });
      }

      // Issue JWT token
      const payloadData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      const token = jwt.sign(payloadData, process.env.JWT_SECRET, { expiresIn: "365d" });

      const { password, ...userWithoutPassword } = user;

      return res.json({
        status: 200,
        message: "Login successful",
        user: userWithoutPassword,
        access_token: `Bearer ${token}`,
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }

// Enable/Disable Two-Factor Authentication
static async toggleTwoFactorAuth(req, res) {
  try {
    const { enable, password } = req.body; // Include password in request body
    const { id } = req.user;

    // Fetch user from the database
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Verify the password provided by the user
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: 400, message: "Incorrect password" });
    }

    if (enable) {
      // Generate 2FA secret
      const secret = speakeasy.generateSecret({ length: 20 });

      // Update 2FA status in the database
      await prisma.user.update({
        where: { id },
        data: {
          twoFactorEnabled: true,
          twoFactorSecret: secret.base32,
        },
      });

      return res.json({
        status: 200,
        message: "Two-Factor Authentication enabled",
      });
    } else {
      // Disable 2FA
      await prisma.user.update({
        where: { id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      return res.json({
        status: 200,
        message: "Two-Factor Authentication disabled",
      });
    }
  } catch (error) {
    console.error("Toggle 2FA Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
}


  // Send OTP
  static async sendOtp(req, res) {
    try {
      const { id, email } = req.user;
      console.log(email);

      // Fetch user's 2FA secret
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({
          status: 400,
          message: "Two-Factor Authentication is not enabled",
        });
      }

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
      

      return res.json({
        status: 200,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.error("Send OTP Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  // Verify OTP
  static async verifyOtp(req, res) {
    try {
      const { otp } = req.body;
      const { id } = req.user;

      // Fetch user's 2FA secret
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || !user.twoFactorEnabled) {
        return res.status(400).json({
          status: 400,
          message: "Two-Factor Authentication is not enabled",
        });
      }

      // Verify OTP
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp,
        window: 1,
      });

      if (!isValid) {
        return res.status(400).json({
          status: 400,
          message: "Invalid OTP",
        });
      }

      return res.json({
        status: 200,
        message: "OTP verified successfully",
      });
    } catch (error) {
      console.error("Verify OTP Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }
}

export default AuthController;
