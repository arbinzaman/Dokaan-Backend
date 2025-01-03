import { Router } from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
const router = Router();

router.use("/api/v1/user", userRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/profile", profileRoutes);

export default router;