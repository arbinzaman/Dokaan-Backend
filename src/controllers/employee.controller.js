import {
  createEmployee,
  getAllEmployeesByShop,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../services/employee.services.js";

class EmployeeController {
  static async create(req, res) {
    try {
      const employee = await createEmployee(req.body);
      return res.status(201).json({ status: 201, data: employee });
    } catch (error) {
      console.error("Create Employee Error:", error);

      if (error.statusCode === 409) {
        return res.status(409).json({
          status: 409,
          message: error.message,
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: 400,
          message: error.message,
        });
      }

      return res.status(500).json({
        status: 500,
        message: "Failed to create employee",
      });
    }
  }

  static async getAllByShop(req, res) {
    try {
      const { shopId } = req.query;
      if (!shopId) {
        return res.status(400).json({
          status: 400,
          message: "Missing required query: shopId",
        });
      }

      const employees = await getAllEmployeesByShop(shopId);
      return res.status(200).json({ status: 200, data: employees });
    } catch (error) {
      console.error("Get Employees Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch employees",
      });
    }
  }

  static async getOne(req, res) {
    try {
      const employee = await getEmployeeById(req.params.id);
      if (!employee) {
        return res.status(404).json({
          status: 404,
          message: "Employee not found",
        });
      }
      return res.status(200).json({ status: 200, data: employee });
    } catch (error) {
      console.error("Get Employee Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch employee",
      });
    }
  }

  static async update(req, res) {
    try {
      const updatedEmployee = await updateEmployee(req.params.id, req.body);
      return res.status(200).json({ status: 200, data: updatedEmployee });
    } catch (error) {
      console.error("Update Employee Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to update employee",
      });
    }
  }

  static async delete(req, res) {
    try {
      const deletedEmployee = await deleteEmployee(req.params.id);
      return res.status(200).json({ status: 200, data: deletedEmployee });
    } catch (error) {
      console.error("Delete Employee Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to delete employee",
      });
    }
  }
}

export default EmployeeController;
