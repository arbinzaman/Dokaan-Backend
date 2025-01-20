// services/userService.js
import  prisma  from "../config/db.config.js";
import bcrypt from "bcryptjs";

// Get all users
export const getUsersService = async () => {
  const users = await prisma.user.findMany();
  return users;
};

// Get user by ID
export const getUserByIdService = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  });
  return user;
};

// Get user by Email
export const getUserByEmailService = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return user;
};

// Create user
export const createUserService = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role
    }
  });

  return newUser;
};

// Update user
export const updateUserService = async (id, userData) => {
  const { name, email, password, role } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  const updatedData = {};

  if (name) updatedData.name = name;
  if (email) updatedData.email = email;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updatedData.password = await bcrypt.hash(password, salt);
  }
  if (role) updatedData.role = role;

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(id) },
    data: updatedData
  });

  return updatedUser;
};

// Delete user
export const deleteUserService = async (id) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Delete the user
  const deletedUser = await prisma.user.delete({
    where: { id: parseInt(id) }
  });

  return deletedUser;
};

// Get user growth data (monthly)
export const getUserGrowthDataService = async () => {
  const users = await prisma.user.findMany({
    select: {
      createdAt: true
    }
  });

  const userGrowth = {};

  users.forEach((user) => {
    const month = user.createdAt.toLocaleString("default", { month: "short" });
    if (!userGrowth[month]) {
      userGrowth[month] = 0;
    }
    userGrowth[month]++;
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const growthData = months.map((month) => ({
    month,
    users: userGrowth[month] || 0
  }));

  return growthData;
};
