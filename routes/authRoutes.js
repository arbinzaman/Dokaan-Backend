import  { Router } from "express";
import AuthController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const router = Router();

router.post("/signup", AuthController.register);
router.post("/login", AuthController.login);
router.put("/two-factor-auth", authMiddleware, AuthController.toggleTwoFactorAuth);
router.post("/send-otp", authMiddleware, AuthController.sendOtp);
router.post("/verify-otp", authMiddleware, AuthController.verifyOtp);

export default router;