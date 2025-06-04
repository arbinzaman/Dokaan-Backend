import express from "express";
import ExpenseController from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", ExpenseController.create);
router.get("/:shopId", ExpenseController.getAllByShop);
router.get("/single/:id", ExpenseController.getById);
router.put("/:id", ExpenseController.update);
router.delete("/:id", ExpenseController.delete);

export default router;
