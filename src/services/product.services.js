// Product Service
import prisma from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { generateFileName, imageValidator } from "../utils/helper.js";

export const createProduct = async (data, files) => {
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

  console.log("Received shopId:", shopId);  // Log to inspect the value of shopId

  let imageUrl = null;

  if (files && files.imageUrl) {
    const image = files.imageUrl;
    const validationError = imageValidator(image.size, image.mimetype);
    if (validationError) throw new Error(validationError);

    const fileName = generateFileName() + "." + image.name.split(".").pop();
    const uploadResult = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "products",
      public_id: fileName,
    });
    imageUrl = uploadResult.secure_url;
  }

  // Check if shopId and ownerId are valid before converting to BigInt
  if (!shopId || isNaN(shopId)) {
    console.log("Invalid shopId value:", shopId);  // Log invalid shopId
    throw new Error("Invalid shopId");
  }
  if (!ownerId || isNaN(ownerId)) {
    throw new Error("Invalid ownerId");
  }

  // Convert to BigInt only after validation
  const shopIdBigInt = BigInt(shopId);
  const ownerIdBigInt = BigInt(ownerId);

  return await prisma.product.create({
    data: {
      name,
      code,
      purchasePrice: parseFloat(purchasePrice),
      salesPrice: parseFloat(salesPrice),
      initialStock: parseInt(initialStock),
      description,
      imageUrl,
      shopId: shopIdBigInt,
      ownerId: ownerIdBigInt,
    },
  });
};


export const updateProduct = async (id, data, files) => {
  let imageUrl = null;

  if (files && files.imageUrl) {
    const image = files.imageUrl;
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
    where: { id: BigInt(id) },
    data: {
      ...data,
      imageUrl: imageUrl || undefined,
    },
  });
};

export const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id: BigInt(id) },
  });
};

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      shop: true,
      owner: true,
    },
  });
};

export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id: BigInt(id) },
    include: {
      shop: true,
      owner: true,
    },
  });
};
