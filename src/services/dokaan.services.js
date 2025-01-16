import prisma from "../config/db.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const createDokaanWithNewOwner = async (data) => {
  const { name, email, password, dokaan_name, dokaan_location, dokaan_email, dokaan_phone, dokaan_type } = data;

  // Check if the user already exists
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // If the user does not exist, create a new one
  if (!user) {
    // Encrypt the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "shop-owner", // Default role as shop owner
      },
    });
  }

  // Create Dokaan with the user's ID as ownerId
  const dokaan = await prisma.dokaan.create({
    data: {
      dokaan_name,
      dokaan_location,
      dokaan_email,
      dokaan_phone,
      dokaan_type,
      ownerId: user.id,
    },
  });

  // Generate JWT for the user
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  // Remove sensitive data from the user object
  const { password: userPassword, ...userWithoutSensitiveData } = user;

  // Return both Dokaan and user data along with the token
  return {
    dokaan,
    user: userWithoutSensitiveData,
    access_token: `Bearer ${token}`,
  };
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
