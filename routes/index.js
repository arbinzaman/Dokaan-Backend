import { Router } from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
const router = Router();

router.use("/api/v1/user", userRoutes);
router.use("/api/v1/auth", authRoutes);

export default router;