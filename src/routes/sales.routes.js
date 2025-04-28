import express from "express";
import SalesController from "../controllers/sales.controller.js";

const router = express.Router();

// Existing routes
router.post("/create", SalesController.create);
router.get("/", SalesController.getAll);
router.get("/:id", SalesController.getById);
router.put("/:id", SalesController.update);
router.delete("/:id", SalesController.delete);
router.get("/stats", SalesController.getStats);
router.get("/top-selling", SalesController.getTopSelling);
router.get("/low-stock", SalesController.getLowStock);
router.get("/sales-trend", SalesController.getSalesTrend);

export default router;
