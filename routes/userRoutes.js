import { Router } from "express";
import { createUser, updateUser,getUsers ,deleteUser} from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers); 
router.post("/login", createUser); 
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;