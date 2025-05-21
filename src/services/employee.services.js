import prisma from "../config/db.config.js";

export const createEmployee = async (data) => {
  return await prisma.user.create({
    data: {
      ...data,
      role: "employee",
      shopRole: "employee",
    },
  });
};

export const getAllEmployeesByShop = async (shopId) => {
  return await prisma.user.findMany({
    where: {
      dokaanId: BigInt(shopId),
      shopRole: "employee",
    },
  });
};

export const getEmployeeById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: BigInt(id) },
  });
};

export const updateEmployee = async (id, updateData) => {
  return await prisma.user.update({
    where: { id: BigInt(id) },
    data: updateData,
  });
};

export const deleteEmployee = async (id) => {
  return await prisma.user.delete({
    where: { id: BigInt(id) },
  });
};
