import { Router } from "express";
import { createUser, updateUser,getUsers ,deleteUser,getUserById} from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers); 
router.get("/:id", getUserById);
router.post("/", createUser); 
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;