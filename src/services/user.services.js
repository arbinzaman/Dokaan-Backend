import Prisma from "../config/db.config.js";
import bcrypt from "bcryptjs"; 

export const createAUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if the user already exists
  const existingUser = await Prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10); 
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const newUser = await Prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  return newUser;
};

export const getAllUsers = async () => {
  const users = await Prisma.user.findMany();
  return users;
};

export const getUserByIdQuery = async (userId) => {
  const user = await Prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
  return user;
};

export const getUserByEmailQuery = async (userEmail) => {
  const user = await Prisma.user.findUnique({
    where: { email: userEmail },
  });
  return user;
};

export const updateAUser = async (userId, userData) => {
  const { name, email, password, role } = userData;

  // Check if the user exists
  const existingUser = await Prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const updatedData = {};

  if (name) {
    updatedData.name = name;
  }

  if (email) {
    updatedData.email = email;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updatedData.password = await bcrypt.hash(password, salt);
  }

  if (role) {
    updatedData.role = role;
  }

  const updatedUser = await Prisma.user.update({
    where: { id: parseInt(userId) },
    data: updatedData,
  });

  return updatedUser;
};

export const deleteAUser = async (userId) => {
  // Check if the user exists
  try {
    // Delete associated Dokaans first
    await prisma.dokaan.deleteMany({ 
      where: { ownerId: userId } 
    });

    // Delete the user
    const deletedUser = await prisma.user.delete({ 
      where: { id: userId } 
    });

    return deletedUser; 
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error; 
  }
};