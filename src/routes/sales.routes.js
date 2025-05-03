import { Router } from "express";
import SalesController from "../controllers/sales.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/",  SalesController.create);
router.get("/", authMiddleware, SalesController.getAll);
router.get("/top-selling", SalesController.getTopSelling);
router.get("/stats",  SalesController.getStats);
router.get("/stats-by-month",  SalesController.getSalesStats);
router.get("/total", SalesController.getTotalSalesAmount);
router.get("/total-revenue", SalesController.getTotalRevenue);
router.get('/category-wise', SalesController.getSalesByCategory);
router.get("/:id", authMiddleware, SalesController.getById);
router.put("/:id", authMiddleware, SalesController.update);
router.delete("/:id", authMiddleware, SalesController.delete);



export default router;