import { registerUser, loginUser, sendOtpMail, verifyOtp, disableTwoFactorAuth } from "../services/auth.services.js";

class AuthController {
  // Register User
  static async register(req, res) {
    try {
      const user = await registerUser(req.body);
      return res.json(user);
    } catch (error) {
      console.error("Register Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  // Login User
  static async login(req, res) {
    try {
      const user = await loginUser(req.body);
      return res.json(user);
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  // Send OTP
  static async sendOtp(req, res) {
    try {
      const result = await sendOtpMail(req.user.id, req.user.email);
      return res.json(result);
    } catch (error) {
      console.error("Send OTP Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  // Verify OTP and Enable Two-Factor Authentication
  static async verifyOtp(req, res) {
    try {
      const result = await verifyOtp(req.body.otp, req.user.id);
      return res.json(result);
    } catch (error) {
      console.error("Verify OTP and Enable 2FA Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  // Disable Two-Factor Authentication
  static async disableTwoFactorAuth(req, res) {
    try {
      const result = await disableTwoFactorAuth(req.user.id);
      return res.json(result);
    } catch (error) {
      console.error("Disable 2FA Error:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }
}

export default AuthController;
