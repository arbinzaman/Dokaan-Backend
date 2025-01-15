import prisma from "../config/db.config.js";

export const createDokaan = async (data) => {
  return await prisma.dokaan.create({ data });
};

export const updateDokaan = async (id, data) => {
  return await prisma.dokaan.update({
    where: { id: BigInt(id) },
    data,
  });
};

export const deleteDokaan = async (id) => {
  return await prisma.dokaan.delete({
    where: { id: BigInt(id) },
  });
};

export const getAllDokaans = async () => {
  return await prisma.dokaan.findMany({
    include: {
      owner: true,
      employees: true,
    },
  });
};

export const getDokaanById = async (id) => {
  return await prisma.dokaan.findUnique({
    where: { id: BigInt(id) },
    include: {
      owner: true,
      employees: true,
    },
  });
};

export const addEmployeeToDokaan = async (dokaanId, employeeData) => {
  return await prisma.user.create({
    data: {
      ...employeeData,
      dokaanId: BigInt(dokaanId),
    },
  });
};

export const removeEmployeeFromDokaan = async (id) => {
  return await prisma.user.update({
    where: { id: BigInt(id) },
    data: {
      dokaanId: null,
      shopRole: null,
    },
  });
};



export const addEmployeeFromExistingAccount = async (email, dokaanId, shopRole) => {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
  
    if (!user) {
      throw new Error("User with the provided email does not exist");
    }
  
    // Check if dokaanId exists (if needed)
    const dokaan = await prisma.dokaan.findUnique({
      where: { id: dokaanId },
    });
  
    if (!dokaan) {
      throw new Error("Shop (Dokaan) with the provided ID does not exist");
    }
  
    // Update the user to add them as an employee in the shop
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        dokaanId: dokaanId,
        shopRole: shopRole,
      },
    });
  
    return updatedUser;
  };
