import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import ProfileController from "../controllers/profileController.js";


const router = Router();

router.get("/", authMiddleware, ProfileController.getProfile); 
router.put("/:id", authMiddleware, ProfileController.updateProfile);
router.put("/change-password/:id", authMiddleware, ProfileController.updatePassword);


export default router;