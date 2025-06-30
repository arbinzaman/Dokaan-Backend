import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../services/invoice.services.js";

class InvoiceController {
  static async create(req, res) {
    try {
      const invoice = await createInvoice(req.body);
      return res.status(201).json({ status: 201, data: invoice });
    } catch (error) {
      console.error("Create Invoice Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to create invoice",
      });
    }
  }

  static async getAll(req, res) {
    try {
      const { shopId, day, month, year } = req.query;

      if (!shopId) {
        return res.status(400).json({
          status: 400,
          message: "Missing shopId query parameter",
        });
      }

      const filters = {
        shopId: BigInt(shopId),
        day: day ? parseInt(day) : undefined,
        month: month || undefined,
        year: year ? parseInt(year) : undefined,
      };

      const invoices = await getInvoices(filters);
      return res.status(200).json({ status: 200, data: invoices });
    } catch (error) {
      console.error("Get Invoices Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch invoices",
      });
    }
  }

  static async getById(req, res) {
    try {
      const id = BigInt(req.params.id);
      const invoice = await getInvoiceById(id);

      if (!invoice) {
        return res.status(404).json({
          status: 404,
          message: "Invoice not found",
        });
      }

      return res.status(200).json({ status: 200, data: invoice });
    } catch (error) {
      console.error("Get Invoice By ID Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch invoice",
      });
    }
  }

  static async update(req, res) {
    try {
      const id = BigInt(req.params.id);
      const updated = await updateInvoice(id, req.body);
      return res.status(200).json({ status: 200, data: updated });
    } catch (error) {
      console.error("Update Invoice Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to update invoice",
      });
    }
  }

  static async delete(req, res) {
    try {
      const id = BigInt(req.params.id);
      await deleteInvoice(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Delete Invoice Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to delete invoice",
      });
    }
  }
}

export default InvoiceController;
