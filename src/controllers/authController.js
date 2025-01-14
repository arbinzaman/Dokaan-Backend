import prisma from "../config/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema, loginSchema } from "../validation/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { sendOtpMail, verifyOtp } from "../services/auth.services.js";

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

      // Remove password and OTP secret from the user object
      const { password, twoFactorSecret, ...userWithoutSensitiveData } = user;

      return res.json({
        status: 200,
        message: "Login successful",
        user: userWithoutSensitiveData,
        access_token: `Bearer ${token}`,
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }

  // Send OTP
  static async sendOtp(req, res) {
    try {
      const { id, email } = req.user;

      // Fetch user to get the 2FA secret (optional if not needed)
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      // Send OTP via email
      sendOtpMail(email, user);

      return res.json({
        status: 200,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.error("Send OTP Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  // Verify OTP and Enable Two-Factor Authentication
  static async verifyOtp(req, res) {
    try {
      const { otp } = req.body;
      const { id } = req.user;

      // Fetch user's 2FA secret
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      // Verify OTP
      const isValidOtp = verifyOtp(otp, user);
      if (!isValidOtp) {
        return res.status(400).json({
          status: 400,
          message: "Invalid OTP",
        });
      }

      // Enable 2FA in the database
      await prisma.user.update({
        where: { id },
        data: {
          twoFactorEnabled: true,
        },
      });

      return res.json({
        status: 200,
        message: "OTP verified and Two-Factor Authentication enabled",
        twoFactorEnabled: true,
      });
    } catch (error) {
      console.error("Verify OTP and Enable 2FA Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  // Disable Two-Factor Authentication
  static async disableTwoFactorAuth(req, res) {
    try {
      const { id } = req.user; // Get user ID from the authenticated request

      // Fetch user from the database
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      // Check if 2FA is already disabled
      if (!user.twoFactorEnabled) {
        return res.status(400).json({
          status: 400,
          message: "Two-Factor Authentication is already disabled",
        });
      }

      // Update the database to disable 2FA
      await prisma.user.update({
        where: { id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null, // Remove the secret as 2FA is disabled
        },
      });

      return res.json({
        status: 200,
        message: "Two-Factor Authentication disabled",
      });
    } catch (error) {
      console.error("Disable 2FA Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }
}

export default AuthController;
