import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.config.js";
import vine from "@vinejs/vine";
import { registerSchema } from "../validation/authValidation.js"; // Reuse the schema or make an employee-specific one

export const createEmployee = async (payload) => {
  console.log(payload);
  // 1. Validate input
  const validator = vine.compile(registerSchema); // You can make a `createEmployeeSchema` if needed
  const validatedPayload = await validator.validate(payload);

  // 2. Check if email is already in use
  const existingUser = await prisma.user.findFirst({
    where: { email: validatedPayload.email },
  });

  if (existingUser) {
    throw new Error("Employee with this email already exists");
  }

  // 3. Hash password
  if (validatedPayload.password) {
    const salt = bcrypt.genSaltSync(10);
    validatedPayload.password = bcrypt.hashSync(validatedPayload.password, salt);
  }

  // 4. Create employee user
  const employee = await prisma.user.create({
  data: {
    ...validatedPayload,
    role: "employee",
    shopRole: "employee",
    salary: payload.salary,
    workStartTime: payload.workStartTime,
    workEndTime: payload.workEndTime,
    workDays: payload.workDays,
    workHours: payload.workHours,
    workLocation: payload.workLocation,
    workStatus: payload.workStatus,
    dokaanId: payload.dokaanId, // if assigning to a shop
  },
});


  // 5. JWT token
  const tokenPayload = {
    id: employee.id,
    email: employee.email,
    name: employee.name,
    role: employee.role,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  // 6. Remove sensitive fields
  const { password, twoFactorSecret, ...employeeWithoutSensitiveData } = employee;

  // 7. Return secure response
  return {
    status: 200,
    message: "Employee created successfully",
    user: employeeWithoutSensitiveData,
    access_token: `Bearer ${token}`,
  };
};



// Get all employees for a specific shop
export const getAllEmployeesByShop = async (shopId) => {
  return await prisma.user.findMany({
    where: {
      dokaanId: BigInt(shopId),
      shopRole: "employee",
    },
  });
};

// Get single employee by ID
export const getEmployeeById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: BigInt(id) },
  });
};

// Update employee
export const updateEmployee = async (id, updateData) => {
  // Hash password if updating
  if (updateData.password) {
    const salt = bcrypt.genSaltSync(10);
    updateData.password = bcrypt.hashSync(updateData.password, salt);
  }

  return await prisma.user.update({
    where: { id: BigInt(id) },
    data: updateData,
  });
};

// Delete employee
export const deleteEmployee = async (id) => {
  return await prisma.user.delete({
    where: { id: BigInt(id) },
  });
};
