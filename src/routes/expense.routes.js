import express from "express";
import ExpenseController from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", ExpenseController.create);
router.get("/", ExpenseController.getAllByShop);
router.get("/financial-report", ExpenseController.getFinancialReport);
router.get("/income-statement", ExpenseController.getIncomeStatement);
router.get("/single/:id", ExpenseController.getById);
router.put("/:id", ExpenseController.update);
router.delete("/:id", ExpenseController.delete);

export default router;
