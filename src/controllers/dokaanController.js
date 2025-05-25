import {
  createDokaanWithNewOwner,
  updateDokaan,
  deleteDokaan,
  getAllDokaans,
  getDokaanById,
  addEmployeeToDokaan,
  removeEmployeeFromDokaan,
  addEmployeeFromExistingAccount,
  getDokaansByUserEmail
} from "../services/dokaan.services.js";

class DokaanController {
  static async create(req, res) {
    try {
      const data = req.body;

      // Call service function to create Dokaan and owner
      const { dokaan, user, access_token } = await createDokaanWithNewOwner(
        data
      );

      // Send response
      return res.status(200).json({
        status: 200,
        message: "Dokaan and owner created successfully",
        data: {
          dokaan,
          owner: user,
        },
        access_token,
      });
    } catch (error) {
      console.error("Create Dokaan Error:", error);
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
      const files = req.files;
      // console.log("Files received:", req.files);

      const dokaan = await updateDokaan(id, data, files);
      return res.json({ status: 200, data: dokaan });
    } catch (error) {
      console.error("Update Dokaan Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await deleteDokaan(id);
      return res.json({ status: 200, message: "Dokaan deleted successfully" });
    } catch (error) {
      console.error("Delete Dokaan Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
  }

  static async getAll(req, res) {
    try {
      const dokaans = await getAllDokaans();
      return res.json({ status: 200, data: dokaans });
    } catch (error) {
      console.error("Get All Dokaans Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const dokaan = await getDokaanById(id);
      if (!dokaan) {
        return res
          .status(404)
          .json({ status: 404, message: "Dokaan not found" });
      }
      return res.json({ status: 200, data: dokaan });
    } catch (error) {
      console.error("Get Dokaan By ID Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
  }

  static async addEmployee(req, res) {
    try {
      const { dokaanId, name, email, password, shopRole } = req.body;
      const employeeData = { name, email, password, shopRole };
      const employee = await addEmployeeToDokaan(dokaanId, employeeData);
      return res.json({
        status: 200,
        message: "Employee added to Dokaan",
        data: employee,
      });
    } catch (error) {
      console.error("Add Employee Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
  }

  static async removeEmployee(req, res) {
    try {
      const { id } = req.body;
      const employee = await removeEmployeeFromDokaan(id);
      return res.json({
        status: 200,
        message: "Employee removed from Dokaan",
        data: employee,
      });
    } catch (error) {
      console.error("Remove Employee Error:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal Server Error" });
    }
  }

  static async addEmployeeFromExistingAccount(req, res) {
    try {
      const { email, dokaanId, shopRole } = req.body;

      // Validate the inputs (you can also use a validation schema here)
      if (!email || !dokaanId || !shopRole) {
        return res
          .status(400)
          .json({ status: 400, message: "Missing required fields" });
      }

      // Call the service to add employee to the shop
      const employee = await addEmployeeFromExistingAccount(
        email,
        dokaanId,
        shopRole
      );

      return res.status(200).json({
        status: 200,
        message: "Employee added successfully",
        data: employee,
      });
    } catch (error) {
      console.error("Add Employee Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
    }
  }

  static async getDokaansByEmail(req, res) {
  try {
    const { email } = req.params;
    if (!email) {
      return res
        .status(400)
        .json({ status: 400, message: "Email is required" });
    }

    const dokaans = await getDokaansByUserEmail(email);

    return res.status(200).json({
      status: 200,
      message: "Dokaans fetched successfully",
      data: dokaans,
    });
  } catch (error) {
    console.error("Get Dokaans by Email Error:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
}

}

export default DokaanController;
