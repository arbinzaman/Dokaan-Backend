import prisma from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { generateFileName, imageValidator } from "../utils/helper.js";

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
    } = data;

    console.log("Received shopId:", shopId); // Debugging

    let imageUrl = null;

    if (files?.imageUrl?.length > 0) {
      const image = files.imageUrl[0]; // Ensure correct file access
      const validationError = imageValidator(image.size, image.mimetype);
      if (validationError) throw new Error(validationError);

      const fileName = generateFileName() + "." + image.name.split(".").pop();
      const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "products",
        public_id: fileName,
      });
      imageUrl = uploadResult.secure_url;
    }

    // Validate shopId and ownerId
    if (!shopId || isNaN(Number(shopId))) {
      console.log("Invalid shopId value:", shopId);
      throw new Error("Invalid shopId");
    }
    if (!ownerId || isNaN(Number(ownerId))) {
      throw new Error("Invalid ownerId");
    }

    // Ensure code is unique before inserting
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
        shopId: Number(shopId), // Convert to Number instead of BigInt
        ownerId: Number(ownerId),
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
      where: { id: Number(id) }, // Use Number instead of BigInt
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
      where: { id: Number(id) }, // Convert to Number
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    throw error;
  }
};

export const getAllProducts = async () => {
  try {
    return await prisma.product.findMany({
      include: {
        shop: true,
        owner: true,
      },
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    return await prisma.product.findUnique({
      where: { id: Number(id) }, // Convert to Number
      include: {
        shop: true,
        owner: true,
      },
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    throw error;
  }
};
