import { Router } from "express";
import CustomerController from "../controllers/customer.controller.js";

const router = Router();

router.post("/", CustomerController.create);
router.get("/", CustomerController.getAll);
router.get("/search", CustomerController.getSearch);
router.get("/growth", CustomerController.getShopGrowthStats);
router.get("/stats", CustomerController.getStats);
router.put("/:id", CustomerController.update);
router.delete("/:id", CustomerController.delete);
router.get("/:id", CustomerController.getById);


export default router;
