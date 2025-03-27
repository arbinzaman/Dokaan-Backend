import prisma from "../config/db.config.js";

// Create Sale
export const createSale = async (data) => {
  return await prisma.sales.create({
    data: {
      productId: data.productId,
      code: data.code,
      sellerId: data.sellerId,
      shopId: data.shopId,
      branch: data.branch,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      soldAt: new Date(),
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

// Update Sale
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
