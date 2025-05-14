import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesStats,
  // getTopSellingProducts,
  getTopSellingProductsBySeller,
  getMonthlySalesStats,
  getTotalSales,
  getCategoryWiseSales,
  getTotalRevenue,
} from "../services/sales.services.js";

class SalesController {
  static async create(req, res) {
    // console.log(req.body);
    try {
      const sale = await createSale(req.body);
      return res.status(201).json(sale);
    } catch (error) {
      console.error("Create Sale Error:", error.message);
      return res.status(400).json({ message: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { shopId, year, month, date } = req.query;
      if (!shopId) {
        return res.status(400).json({ message: "shopId is required" });
      }

      const sales = await getAllSales(shopId, year, month, date);
      return res.json(sales);
    } catch (error) {
      console.error("Get Sales Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  

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

  static async update(req, res) {
    try {
      const updatedSale = await updateSale(req.params.id, req.body);
      return res.json(updatedSale);
    } catch (error) {
      console.error("Update Sale Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async delete(req, res) {
    try {
      await deleteSale(req.params.id);
      return res.json({ message: "Sale deleted successfully" });
    } catch (error) {
      console.error("Delete Sale Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await getSalesStats();
      return res.json(stats);
    } catch (error) {
      console.error("Get Sales Stats Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getTopSelling(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const shopId = req.query.shopId; // Optional: allow filter by shop
      const result = await getTopSellingProductsBySeller(limit, shopId);
      return res.json(result);
    } catch (error) {
      console.error("Get Top Selling Products Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getTotalRevenue(req, res) {
    const { shopId } = req.query;
    console.log(shopId);
  
    if (!shopId) {
      return res.status(400).json({ message: "Missing shopId in query" });
    }
  
    try {
      const parsedShopId = BigInt(shopId); // Fix the BigInt conversion issue
      const { totalRevenue } = await getTotalRevenue(parsedShopId);
      return res.json({ totalRevenue });
    } catch (error) {
      console.error("Get Total Revenue Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getSalesStats(req, res) {
    const { shopId } = req.query;
    console.log(shopId);
  
    if (!shopId) {
      return res.status(400).json({ message: "Missing shopId in query" });
    }
  
    try {
      const parsedShopId = BigInt(shopId);
      const data = await getMonthlySalesStats(parsedShopId);
      res.status(200).json(data);
    } catch (error) {
      console.error("Sales stats error:", error);
      res.status(500).json({ message: "Failed to fetch sales statistics" });
    }
  }
  
  static async getTotalSalesAmount(req, res) {
    try {
      const shopId = req.query.shopId ;
      console.log(shopId);
      if (!shopId) {
        return res.status(400).json({ message: "Missing shopId parameter" });
      }
  
      const data = await getTotalSales(shopId);
      res.status(200).json(data);
    } catch (error) {
      console.error("Total sales fetch error:", error);
      res.status(500).json({ message: "Failed to fetch total sales" });
    }
  }
  

  static async getSalesByCategory(req, res) {
    const { shopId } = req.query; // Get shopId from query params
    console.log(shopId);
    try {
      const data = await getCategoryWiseSales(shopId); // Pass shopId to the service function
      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching category-wise sales:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
}

export default SalesController;
