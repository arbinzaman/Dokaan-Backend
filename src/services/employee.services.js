import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.config.js";
import vine from "@vinejs/vine";
import { registerSchema } from "../validation/authValidation.js";

export const createEmployee = async (payload) => {
  try {
    const validator = vine.compile(registerSchema);
    const validatedPayload = await validator.validate(payload);

    const existingUser = await prisma.user.findFirst({
      where: { email: validatedPayload.email },
    });

    if (existingUser) {
      const error = new Error("Employee with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    const dataToCreate = { ...validatedPayload };
    if (dataToCreate.password) {
      const salt = bcrypt.genSaltSync(10);
      dataToCreate.password = bcrypt.hashSync(dataToCreate.password, salt);
    }

    Object.assign(dataToCreate, {
      role: "employee",
      shopRole: "employee",
      salary: payload.salary,
      workStartTime: payload.workStartTime,
      workEndTime: payload.workEndTime,
      workDays: payload.workDays,
      workHours: payload.workHours,
      workLocation: payload.workLocation,
      workStatus: payload.workStatus,
      dokaanId: payload.dokaanId ? BigInt(payload.dokaanId) : null,
    });

    const employee = await prisma.user.create({
      data: dataToCreate,
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const tokenPayload = {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    const { password, twoFactorSecret, ...employeeWithoutSensitiveData } = employee;

    return {
      status: 200,
      message: "Employee created successfully",
      user: employeeWithoutSensitiveData,
      access_token: `Bearer ${token}`,
    };
  } catch (error) {
    throw error;
  }
};

export const getAllEmployeesByShop = async (shopId) => {
  if (!shopId) throw new Error("shopId is required");

  const shopIdBigInt = BigInt(shopId);

  const employees = await prisma.user.findMany({
    where: {
      dokaanId: shopIdBigInt,
      shopRole: "employee",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      salary: true,
      workStartTime: true,
      workEndTime: true,
      workDays: true,
      workHours: true,
      workLocation: true,
      workStatus: true,
      dokaanId: true,
    },
  });

  return employees;
};

export const getEmployeeById = async (id) => {
  if (!id) throw new Error("Employee id is required");

  const employee = await prisma.user.findUnique({
    where: { id: BigInt(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      salary: true,
      workStartTime: true,
      workEndTime: true,
      workDays: true,
      workHours: true,
      workLocation: true,
      workStatus: true,
      dokaanId: true,
    },
  });

  return employee;
};

export const updateEmployee = async (id, updateData) => {
  if (!id) throw new Error("Employee id is required");

  const dataToUpdate = { ...updateData };

  if (dataToUpdate.password) {
    const salt = bcrypt.genSaltSync(10);
    dataToUpdate.password = bcrypt.hashSync(dataToUpdate.password, salt);
  }

  if (dataToUpdate.dokaanId) {
    dataToUpdate.dokaanId = BigInt(dataToUpdate.dokaanId);
  }

  return await prisma.user.update({
    where: { id: BigInt(id) },
    data: dataToUpdate,
  });
};

export const deleteEmployee = async (id) => {
  if (!id) throw new Error("Employee id is required");

  return await prisma.user.delete({
    where: { id: BigInt(id) },
  });
};
