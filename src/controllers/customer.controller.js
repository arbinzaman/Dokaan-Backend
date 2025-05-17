import {
  createCustomer,
  getAllCustomersWithDetails,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getCustomerGrowthByShop,
} from "../services/customer.services.js";

class CustomerController {
  static async create(req, res) {
    try {
      const customer = await createCustomer(req.body);
      return res.status(201).json({ status: 201, data: customer });
    } catch (error) {
      console.error("Create Customer Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to create customer",
      });
    }
  }

  static async getAll(req, res) {
    // console.log(req, res);
    try {
      const { year, month, day } = req.query;
      const filters = {
        year: year ? parseInt(year) : undefined,
        month: month || undefined,
        day: day ? parseInt(day) : undefined,
      };

      const customers = await getAllCustomersWithDetails(filters);
      return res.status(200).json({ status: 200, data: customers });
    } catch (error) {
      console.error("Get Customers Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch customers",
      });
    }
  }

  static async getById(req, res) {
    try {
      const id = BigInt(req.params.id);
      const customer = await getCustomerById(id);

      if (!customer) {
        return res
          .status(404)
          .json({ status: 404, message: "Customer not found" });
      }

      return res.status(200).json({ status: 200, data: customer });
    } catch (error) {
      console.error("Get Customer By ID Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch customer",
      });
    }
  }

  static async update(req, res) {
    try {
      const id = BigInt(req.params.id);
      const updated = await updateCustomer(id, req.body);
      return res.status(200).json({ status: 200, data: updated });
    } catch (error) {
      console.error("Update Customer Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to update customer",
      });
    }
  }

  static async delete(req, res) {
    try {
      const id = BigInt(req.params.id);
      await deleteCustomer(id);
      return res.status(204).send();
    } catch (error) {
      console.error("Delete Customer Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to delete customer",
      });
    }
  }

  static async getStats(req, res) {
    try {
      const shopId = req.query.shopId;
      if (!shopId) {
        return res.status(400).json({
          status: 400,
          message: "Missing shopId query parameter",
        });
      }

      const stats = await getCustomerStats(shopId);
      return res.status(200).json({ status: 200, data: stats });
    } catch (error) {
      console.error("Get Customer Stats Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch customer stats",
      });
    }
  }
  // Inside CustomerController class
  static async getShopGrowthStats(req, res) {
    try {
      const { shopId } = req.query;

      if (!shopId) {
        return res.status(400).json({
          status: 400,
          message: "Missing shopId query parameter",
        });
      }

      const { growthData, lastUpdatedMonth } = await getCustomerGrowthByShop(
        shopId
      );

      return res.status(200).json({
        status: "success",
        message: "Shop-wise user growth data fetched successfully",
        data: growthData,
        lastUpdatedMonth,
      });
    } catch (error) {
      console.error("Get Shop Growth Stats Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch shop growth stats",
      });
    }
  }
}

export default CustomerController;
