import { Router } from "express";
import CustomerController from "../controllers/customer.controller.js";

const router = Router();

router.post("/", CustomerController.create);
router.get("/", CustomerController.getAll);
router.get("/stats", CustomerController.getStats);
router.get("/:id", CustomerController.getById);
router.put("/:id", CustomerController.update);
router.delete("/:id", CustomerController.delete);

export default router;
