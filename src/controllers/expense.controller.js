import {
  createExpense,
  getAllExpensesByShopId,
  getSingleExpense,
  updateExpense,
  deleteExpense,
} from "../services/expense.services.js";

class ExpenseController {
  static async create(req, res) {
    try {
      const { title, amount, date, shopId, user_id, notes, category } =
        req.body;

      if (!shopId || !user_id) {
        return res.status(400).json({
          status: 400,
          message: "Shop ID and User ID are required",
        });
      }

      const expense = await createExpense({
        title,
        amount,
        date,
        shopId,
        user_id,
        notes,
        category,
      });

      return res.status(201).json({
        status: 201,
        message: "Expense created successfully",
        data: expense,
      });
    } catch (error) {
      console.error("Create Expense Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }

  static async getAllByShop(req, res) {
  try {
    const { shopId } = req.query; // 🔁 Changed from req.params to req.query

    if (!shopId || isNaN(shopId)) {
      return res.status(400).json({
        status: 400,
        message: "Valid numeric Shop ID is required",
      });
    }

    const expenses = await getAllExpensesByShopId(shopId);

    return res.status(200).json({
      status: 200,
      message: "Expenses fetched successfully",
      data: expenses,
    });
  } catch (error) {
    console.error("Get Expenses by Shop ID Error:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
}


  static async getById(req, res) {
    try {
      const { id } = req.params;
      const expense = await getSingleExpense(id);

      if (!expense) {
        return res.status(404).json({
          status: 404,
          message: "Expense not found",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Expense fetched successfully",
        data: expense,
      });
    } catch (error) {
      console.error("Get Expense By ID Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedExpense = await updateExpense(id, data);

      return res.status(200).json({
        status: 200,
        message: "Expense updated successfully",
        data: updatedExpense,
      });
    } catch (error) {
      console.error("Update Expense Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await deleteExpense(id);

      return res.status(200).json({
        status: 200,
        message: "Expense deleted successfully",
      });
    } catch (error) {
      console.error("Delete Expense Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }
}

export default ExpenseController;
