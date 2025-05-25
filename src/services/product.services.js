import prisma from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { cleanBarcode, generateFileName, imageValidator } from "../utils/helper.js";

export const createProduct = async (data, files) => {
  try {
    const {
      name,
      code,
      purchasePrice,
      salesPrice,
      initialStock,
      description,
      shopId,
      ownerId,
      itemCategory, // <-- Accept itemCategory from request
    } = data;

    let imageUrl = null;

    if (files?.imageUrl?.length > 0) {
      const image = files.imageUrl[0];
      const validationError = imageValidator(image.size, image.mimetype);
      if (validationError) throw new Error(validationError);

      const fileName = generateFileName() + "." + image.name.split(".").pop();
      const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "products",
        public_id: fileName,
      });
      imageUrl = uploadResult.secure_url;
    }

    if (!shopId || isNaN(Number(shopId))) throw new Error("Invalid shopId");
    if (!ownerId || isNaN(Number(ownerId))) throw new Error("Invalid ownerId");

    const existingProduct = await prisma.product.findUnique({
      where: { code },
    });
    if (existingProduct) {
      throw new Error(`Product with code ${code} already exists`);
    }

    return await prisma.product.create({
      data: {
        name,
        code,
        purchasePrice: parseFloat(purchasePrice),
        salesPrice: parseFloat(salesPrice),
        initialStock: parseInt(initialStock),
        description,
        imageUrl,
        shopId: Number(shopId),
        ownerId: Number(ownerId),
        itemCategory: itemCategory || null, // <-- Save itemCategory if provided
      },
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    throw error;
  }
};


export const updateProduct = async (id, data, files) => {
  try {
    let imageUrl = null;

    if (files?.imageUrl?.length > 0) {
      const image = files.imageUrl[0];
      const validationError = imageValidator(image.size, image.mimetype);
      if (validationError) throw new Error(validationError);

      const fileName = generateFileName() + "." + image.name.split(".").pop();
      const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "products",
        public_id: fileName,
      });
      imageUrl = uploadResult.secure_url;
    }

    return await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...data,
        imageUrl: imageUrl || undefined,
      },
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    return await prisma.product.delete({
      where: { id: Number(id) },
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    throw error;
  }
};

export const getAllProducts = async (shopId) => {
  try {
    const products = await prisma.product.findMany({
      where: shopId ? { shopId } : undefined,
      include: {
        shop: true,
        owner: true,
        sales: true,
      },
    });

    return products.map(product => ({
      ...product,
      salesCount: product.sales.length,
    }));
  } catch (error) {
    console.error("Get All Products Error:", error);
    throw error;
  }
};


export const getProductsByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        productsOwned: {
          include: {
            shop: true,
            owner: true,
            sales: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.productsOwned.map(product => ({
      ...product,
      salesCount: product.sales.length,
    }));
  } catch (error) {
    console.error("Get Products By Email Error:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        shop: true,
        owner: true,
        sales: true,
      },
    });

    if (!product) return null;

    return {
      ...product,
      salesCount: product.sales.length,
    };
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    throw error;
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    const cleanedBarcode = cleanBarcode(barcode);
    console.log("Searching for barcode:", cleanedBarcode);

    const product = await prisma.product.findFirst({
      where: {
        code: cleanedBarcode,
      },
      include: {
        shop: true,
        owner: true,
        sales: true,
      },
    });

    if (!product) {
      console.log("No product found with barcode:", cleanedBarcode);
      return null;
    }

    return {
      ...product,
      salesCount: product.sales.length,
    };
  } catch (error) {
    console.error("Get Product By Barcode Error:", error);
    throw error;
  }
};

// services/product.services.js
export const getTotalProductCount = async () => {
  const result = await prisma.product.groupBy({
    by: ['shopId'],
    _count: {
      id: true,
    },
  });

  // Result: [{ shopId: 1, _count: { id: 12 } }, ...]
  return result.map((entry) => ({
    shopId: entry.shopId,
    totalProducts: entry._count.id,
  }));
};


// services/product.services.js
export const getFilteredProducts = async (categories, shopId) => {
  try {
    const filters = {};

    if (categories) {
      const categoryArray = categories.split(",").map((cat) => cat.trim());
      filters.itemCategory = { in: categoryArray };
    }

    if (shopId && !isNaN(Number(shopId))) {
      filters.shopId = Number(shopId);
    }

    const products = await prisma.product.findMany({
      where: filters,
      include: {
        shop: true,
        owner: true,
        sales: true,
      },
    });

    // Group by shopId
    const groupedByShop = {};

    products.forEach((product) => {
      const shopId = product.shopId;
      if (!groupedByShop[shopId]) {
        groupedByShop[shopId] = {
          shopId,
          shopName: product.shop?.name,
          products: [],
        };
      }

      groupedByShop[shopId].products.push({
        ...product,
        salesCount: product.sales.length,
      });
    });

    return Object.values(groupedByShop);
  } catch (error) {
    console.error("Get Filtered Products Error:", error);
    throw error;
  }
};

