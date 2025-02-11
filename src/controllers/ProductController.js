// Product Controller
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    getProductByBarcode,
    getProductsByEmail,
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
  

  // New method to handle fetching products by email
  static async getProductsByEmail(req, res) {
    try {
      const { email } = req.params; // Extract email from the request parameters

      if (!email) {
        return res.status(400).json({
          status: 400,
          message: "Email is required",
        });
      }

      // Fetch the products for the given email
      const products = await getProductsByEmail(email);

      if (!products || products.length === 0) {
        return res.status(404).json({
          status: 404,
          message: "No products found for this email",
        });
      }

      return res.status(200).json({
        status: 200,
        data: products,
      });
    } catch (error) {
      console.error("Get Products By Email Error:", error);
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

static async scan(req, res) {
    try {
      const { barcode } = req.body; // Assume barcode is sent in the request body

      if (!barcode) {
        return res.status(400).json({
          status: 400,
          message: "Barcode is required",
        });
      }

      // Get product details by barcode
      const product = await getProductByBarcode(barcode);

      if (!product) {
        return res.status(404).json({
          status: 404,
          message: "Product not found",
        });
      }

      // Assuming the product's shop includes an 'address' field
      const shopAddress = product.shop ? product.shop.address : 'Address not available';

      return res.status(200).json({
        status: 200,
        message: `Product matched successfully with brand ${product.brand} and code ${product.code}`,
        matchedProduct: {
          productName: product.name,
          productCode: product.code,
          brand: product.brandCode,  // Include brand name in the response
          purchasePrice: product.purchasePrice,
          salesPrice: product.salesPrice,
          shopAddress: shopAddress, // Show the shop's address
          ownerName: product.owner ? product.owner.name : 'Owner not available', // Optionally, show owner details
        },
      });
    } catch (error) {
      console.error("Scan Product Barcode Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }
  


    
  }
  
  export default ProductController;