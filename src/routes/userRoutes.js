import { Router } from "express";
import { createUser,getUserGrowthData, updateUser,getUsers ,deleteUser,getUserById, getUserByEmail} from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers); 
router.get("/user-growth", getUserGrowthData); 
router.get("/:id", getUserById);
router.get("/email/:email", getUserByEmail);
router.post("/", createUser); 
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;