import { Router } from "express";
import EmployeeController from "../controllers/employee.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Create a new employee
router.post("/", authMiddleware, EmployeeController.create);

// Get all employees for a specific shop (requires ?shopId=)
router.get("/", authMiddleware, EmployeeController.getAllByShop);

// Get single employee by ID
router.get("/:id", authMiddleware, EmployeeController.getOne);

// Update employee by ID
router.put("/:id", authMiddleware, EmployeeController.update);

// Delete employee by ID
router.delete("/:id", authMiddleware, EmployeeController.delete);

export default router;
