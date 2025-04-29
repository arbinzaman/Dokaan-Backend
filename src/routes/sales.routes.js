import { Router } from "express";
import SalesController from "../controllers/sales.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, SalesController.create);
router.get("/", authMiddleware, SalesController.getAll);
router.get("/top-selling", SalesController.getTopSelling);
router.get("/stats", authMiddleware, SalesController.getStats);
router.get("/:id", authMiddleware, SalesController.getById);
router.put("/:id", authMiddleware, SalesController.update);
router.delete("/:id", authMiddleware, SalesController.delete);



export default router;