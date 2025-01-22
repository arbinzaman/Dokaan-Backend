// Product Controller
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
  } from "../services/product.services.js";
  
  class ProductController {
    static async create(req, res) {
      try {
        const data = req.body;
        const files = req.files;
  
        const product = await createProduct(data, files);
  
        return res.status(200).json({
          status: 200,
          message: "Product created successfully",
          data: product,
        });
      } catch (error) {
        console.error("Create Product Error:", error);
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
  
        const product = await updateProduct(id, data, files);
  
        return res.status(200).json({
          status: 200,
          message: "Product updated successfully",
          data: product,
        });
      } catch (error) {
        console.error("Update Product Error:", error);
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
        });
      }
    }
  
    static async delete(req, res) {
      try {
        const { id } = req.params;
  
        await deleteProduct(id);
  
        return res.status(200).json({
          status: 200,
          message: "Product deleted successfully",
        });
      } catch (error) {
        console.error("Delete Product Error:", error);
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
        });
      }
    }
  
    static async getAll(req, res) {
      try {
        const products = await getAllProducts();
  
        return res.status(200).json({
          status: 200,
          data: products,
        });
      } catch (error) {
        console.error("Get All Products Error:", error);
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
        });
      }
    }
  
    static async getById(req, res) {
      try {
        const { id } = req.params;
  
        const product = await getProductById(id);
  
        if (!product) {
          return res.status(404).json({
            status: 404,
            message: "Product not found",
          });
        }
  
        return res.status(200).json({
          status: 200,
          data: product,
        });
      } catch (error) {
        console.error("Get Product By ID Error:", error);
        return res.status(500).json({
          status: 500,
          message: "Internal Server Error",
        });
      }
    }
  }
  
  export default ProductController;