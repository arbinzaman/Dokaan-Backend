import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import ProductController from "../controllers/ProductController.js";

const router = Router();

// Routes for Product CRUD operations
router.post("/",  ProductController.create); // Create a product
router.get("/", authMiddleware, ProductController.getAll); // Get all products
router.get("/category", authMiddleware, ProductController.getFiltered); // Get all products
router.post("/scan", ProductController.scan);
router.get('/total-products', ProductController.getTotalProductCount);
router.get("/:email", authMiddleware, ProductController.getProductsByEmail); // Get all products by email
router.get("/id/:id", authMiddleware, ProductController.getById); // Get a single product by ID
router.put("/:code", authMiddleware, ProductController.update); // Update a product by ID
router.delete("/:id", authMiddleware, ProductController.delete); // Delete a product by ID

export default router;
