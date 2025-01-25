import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { registerSchema, loginSchema } from "../validation/authValidation.js";
import prisma from "../config/db.config.js";// Import other service functions
import vine from "@vinejs/vine";


// Register User Service
export const registerUser = async (payload) => {
  const validator = vine.compile(registerSchema);
  const validatedPayload = await validator.validate(payload);

  // Check if user already exists
  const userExist = await prisma.user.findFirst({
    where: { email: validatedPayload.email },
  });
  if (userExist) {
    throw new Error("User already exists");
  }

  // Encrypt password
  if (validatedPayload.password) {
    const salt = bcrypt.genSaltSync(10);
    validatedPayload.password = bcrypt.hashSync(validatedPayload.password, salt);
  }

  // Create user
  const user = await prisma.user.create({ data: validatedPayload });

  // Issue JWT token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "365d" });

  // Remove sensitive data
  const { password, twoFactorSecret, ...userWithoutSensitiveData } = user;

  return {
    status: 200,
    message: "User created successfully",
    user: userWithoutSensitiveData,
    access_token: `Bearer ${token}`,
  };
};

// Login User Service
export const loginUser = async (payload) => {
  const validator = vine.compile(loginSchema);
  const validatedPayload = await validator.validate(payload);

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: validatedPayload.email },
  });

  if (!user) {
    throw new Error("User does not exist");
  }

  // Compare password
  const isMatch = bcrypt.compareSync(validatedPayload.password, user.password);
  if (!isMatch) {
    throw new Error("Incorrect password");
  }


  // Fetch or create Dokaan info
  let dokaan = await prisma.dokaan.findFirst({
    where: { ownerId: user.id },
  });


  // Issue JWT token
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "365d" });

  // Remove sensitive fields
  const { password, twoFactorSecret, ...userWithoutSensitiveData } = user;

  return {
    status: 200,
    message: "Login successful",
    user: userWithoutSensitiveData,
    dokaan: dokaan,
    access_token: `Bearer ${token}`,
  };
};

// Send OTP via email
export const sendOtpMail = async (userId, email) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  // Generate OTP
  const otp = speakeasy.totp({
    secret: user.twoFactorSecret,
    encoding: "base32",
    digits: 6,
  });

  // Send OTP via email
  await transporter.sendMail({
    from: `"Dokaan Support Team" <${process.env.EMAIL_USER}>`,  // Sender's email
    to: email,  // Recipient's email
    subject: "Your One-Time Password (OTP) for Secure Access",  // Email subject
    text: `Dear User,

We have generated a One-Time Password (OTP) to verify your login or perform a secure action.

Your OTP Code: ${otp}

This code is valid for a limited time only. Please use it promptly to complete the verification process.

If you did not request this code, please disregard this email or contact our support team immediately.

Best regards,
The Dokaan Support Team`,  // Email body
  });

  return { status: 200, message: "OTP sent successfully" };
};

// Verify OTP and Enable Two-Factor Authentication
export const verifyOtp = async (otp, userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  // Verify OTP
  const isValidOtp = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1,
  });

  if (!isValidOtp) {
    throw new Error("Invalid OTP");
  }

  // Enable 2FA in the database
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
    },
  });

  return {
    status: 200,
    message: "OTP verified and Two-Factor Authentication enabled",
  };
};

// Disable Two-Factor Authentication
export const disableTwoFactorAuth = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.twoFactorEnabled) {
    throw new Error("Two-Factor Authentication is already disabled");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  return { status: 200, message: "Two-Factor Authentication disabled" };
};
