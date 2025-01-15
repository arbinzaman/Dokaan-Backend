import { Router } from "express";
import DokaanController from "../controllers/dokaanController.js";

const router = Router();

router.post("/", DokaanController.create);
router.put("/:id", DokaanController.update);
router.delete("/:id", DokaanController.delete);
router.get("/", DokaanController.getAll);
router.get("/:id", DokaanController.getById);
router.post("/add-employee", DokaanController.addEmployee);
router.post("/remove-employee", DokaanController.removeEmployee);
router.post('/add-exiting-user-employee', DokaanController.addEmployeeFromExistingAccount);

export default router;
