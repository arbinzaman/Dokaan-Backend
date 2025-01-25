import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import ProductController from "../controllers/ProductController.js";

const router = Router();

// Routes for Product CRUD operations
router.post("/", authMiddleware, ProductController.create); // Create a product
router.get("/", authMiddleware, ProductController.getAll); // Get all products
router.get("/:id", authMiddleware, ProductController.getById); // Get a single product by ID
router.put("/:id", authMiddleware, ProductController.update); // Update a product by ID
router.delete("/:id", authMiddleware, ProductController.delete); // Delete a product by ID

export default router;
