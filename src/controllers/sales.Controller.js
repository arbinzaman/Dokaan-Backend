import {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    deleteSale,
  } from "../services/sales.services.js";
  
  class salesController {
    // Create a new Sale
    static async create(req, res) {
      try {
        const sale = await createSale(req.body);
        return res.status(201).json(sale);
      } catch (error) {
        console.error("Create Sale Error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    // Get All Sales
    static async getAll(req, res) {
      try {
        const sales = await getAllSales();
        return res.json(sales);
      } catch (error) {
        console.error("Get Sales Error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    // Get Sale by ID
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
  
    // Update Sale
    static async update(req, res) {
      try {
        const updatedSale = await updateSale(req.params.id, req.body);
        return res.json(updatedSale);
      } catch (error) {
        console.error("Update Sale Error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    // Delete Sale
    static async delete(req, res) {
      try {
        await deleteSale(req.params.id);
        return res.json({ message: "Sale deleted successfully" });
      } catch (error) {
        console.error("Delete Sale Error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  }
  
  export default salesController;
  