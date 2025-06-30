import express from "express";
import InvoiceController from "../controllers/invoice.controller.js";

const router = express.Router();

router.post("/", InvoiceController.create);
router.get("/", InvoiceController.getAll);
router.get("/:id", InvoiceController.getById);
router.put("/:id", InvoiceController.update);
router.delete("/:id", InvoiceController.delete);


export default router;
