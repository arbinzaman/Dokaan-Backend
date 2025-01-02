import { Router } from "express";
import { createUser, updateUser,getUsers } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers); 
router.post("/login", createUser); 
router.put("/:id", updateUser);

export default router;