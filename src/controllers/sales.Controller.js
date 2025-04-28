import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesStats,
  getTopSellingProducts,
  getLowStockProducts,
  getSalesDataByMonth,  // Import the new service function
} from "../services/sales.services.js";

class SalesController {
  // Create a new sale
  static async create(req, res) {
    try {
      const sale = await createSale(req.body);
      return res.status(201).json(sale);
    } catch (error) {
      console.error("Create Sale Error:", error.message);
      return res.status(400).json({ message: error.message });
    }
  }

  // Get all sales
  static async getAll(req, res) {
    try {
      const sales = await getAllSales();
      return res.json(sales);
    } catch (error) {
      console.error("Get Sales Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get sale by ID
  static async getById(req, res) {
    try {
      const sale = await getSaleById(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      return res.json(sale);
    } catch (error) {
      console.error("Get Sale By ID Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Update sale by ID
  static async update(req, res) {
    try {
      const updatedSale = await updateSale(req.params.id, req.body);
      if (!updatedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      return res.json(updatedSale);
    } catch (error) {
      console.error("Update Sale Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Delete sale by ID
  static async delete(req, res) {
    try {
      const deletedSale = await deleteSale(req.params.id);
      if (!deletedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      return res.json({ message: "Sale deleted successfully" });
    } catch (error) {
      console.error("Delete Sale Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get sales statistics (e.g., total sales, average sales, etc.)
  static async getStats(req, res) {
    try {
      const stats = await getSalesStats();
      return res.json(stats);
    } catch (error) {
      console.error("Get Sales Stats Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get top-selling products (with optional limit and shopId)
  static async getTopSelling(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const shopId = req.query.shopId;
      const result = await getTopSellingProducts(limit, shopId);
      return res.json(result);
    } catch (error) {
      console.error("Get Top Selling Products Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get low stock products for a specific shop
  static async getLowStock(req, res) {
    try {
      const shopId = req.query.shopId;
      if (!shopId) {
        return res.status(400).json({ message: "Shop ID is required" });
      }
      const result = await getLowStockProducts(shopId);
      return res.json(result);
    } catch (error) {
      console.error("Get Low Stock Products Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get sales trend data (e.g., sales over time)
  static async getSalesTrend(req, res) {
    try {
      const salesTrend = await getSalesDataByMonth();
      return res.json(salesTrend);
    } catch (error) {
      console.error("Get Sales Trend Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default SalesController;
