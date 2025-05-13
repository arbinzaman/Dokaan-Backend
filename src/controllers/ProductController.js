import prisma from "../config/db.config.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductByBarcode,
  getProductsByEmail,
  getTotalProductCount,
  getFilteredProducts,
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

  static async getProductsByEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          status: 400,
          message: "Email is required",
        });
      }

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
      console.log(id);

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
      const { barcode } = req.body;

      if (!barcode) {
        return res.status(400).json({
          status: 400,
          message: "Barcode is required",
        });
      }

      const product = await getProductByBarcode(barcode);

      if (!product) {
        return res.status(404).json({
          status: 404,
          message: "Product not found",
        });
      }

      const shopAddress = product.shop
        ? product.shop.address
        : "Address not available";

      return res.status(200).json({
        status: 200,
        message: `Product matched successfully with brand ${product.brand} and code ${product.code}`,
        matchedProduct: {
          productName: product.name,
          productCode: product.code,
          brand: product.brandCode,
          purchasePrice: product.purchasePrice,
          salesPrice: product.salesPrice,
          shopAddress,
          ownerName: product.owner ? product.owner.name : "Owner not available",
          salesCount: product.salesCount,
          sales: product.sales,
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
  // controllers/product.controller.js
  static async getTotalProductCount(req, res) {
    try {
      const count = await getTotalProductCount();

      return res.status(200).json({
        status: 200,
        data: count,
      });
    } catch (error) {
      console.error("Get Total Product Count Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch total product count",
      });
    }
  }

  static async getFiltered(req, res) {
    // console.log(req.query);
    try {
      const { shopId, categories } = req.query;
      console.log(shopId, categories);
      const filters = {};

      if (shopId && !isNaN(shopId)) {
        filters.shopId = Number(shopId);
      }

      if (categories) {
        const categoryArray = categories.split(",").map((cat) => cat.trim());
        filters.itemCategory = {
          in: categoryArray,
        };
      }

      const products = await prisma.product.findMany({
        where: filters,
        include: {
          shop: true,
          owner: true,
          sales: true,
        },
      });

      const formatted = products.map((product) => ({
        ...product,
        salesCount: product.sales.length,
      }));

      return res.status(200).json({
        status: 200,
        data: formatted,
      });
    } catch (error) {
      console.error("Get Filtered Products Error:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal Server Error",
      });
    }
  }
}

export default ProductController;
