import prisma from "../config/db.config.js";

// Create Sale
export const createSale = async (data) => {
  const product = await prisma.product.findUnique({
    where: { code: data.productCode },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check stock
  if ((product.initialStock || 0) < data.quantity) {
    throw new Error("Not enough stock available");
  }

  // Deduct stock
  await prisma.product.update({
    where: { id: product.id },
    data: {
      initialStock: (product.initialStock || 0) - data.quantity,
    },
  });

  // Create sale with product snapshot and correct relation
  return await prisma.sales.create({
    data: {
      productId: product.id, // ✅ store actual relation ID
      code: data.code,
      sellerId: data.sellerId,
      shopId: data.shopId,
      branch: data.branch,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      soldAt: new Date(),

      // Snapshot from product
      name: product.name,
      purchasePrice: product.purchasePrice,
      salesPrice: product.salesPrice,
      discount: product.discount,
      includeVAT: product.includeVAT,
      batchNo: product.batchNo,
      serialNoOrIMEI: product.serialNoOrIMEI,
      description: product.description,
      itemUnit: product.itemUnit,
      itemCategory: product.itemCategory,
      size: product.size,
      wholesalePrice: product.wholesalePrice,
      mrp: product.mrp,
    },
  });
};


// Get All Sales
export const getAllSales = async () => {
  return await prisma.sales.findMany({
    include: {
      product: true,
      seller: true,
      shop: true,
    },
  });
};

// Get Sale by ID
export const getSaleById = async (id) => {
  return await prisma.sales.findUnique({
    where: { id: Number(id) },
    include: {
      product: true,
      seller: true,
      shop: true,
    },
  });
};

// Update Sale (only non-product fields)
export const updateSale = async (id, data) => {
  return await prisma.sales.update({
    where: { id: Number(id) },
    data,
  });
};

// Delete Sale
export const deleteSale = async (id) => {
  return await prisma.sales.delete({
    where: { id: Number(id) },
  });
};
