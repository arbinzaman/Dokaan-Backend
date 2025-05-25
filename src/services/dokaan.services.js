import prisma from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateFileName, imageValidator } from "../utils/helper.js";

// Create Dokaan with New Owner
export const createDokaanWithNewOwner = async (data) => {
  const {
    name,
    email,
    password,
    dokaan_name,
    dokaan_location,
    dokaan_email,
    dokaan_phone,
    dokaan_type,
    dokaanImage, // Expect image from the controller
  } = data;

  // Check if the user already exists
  let user = await prisma.user.findUnique({ where: { email } });

  // If the user does not exist, create a new one
  if (!user) {
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "shop-owner", // Default role as shop owner
      },
    });
  }

  // Upload Dokaan Image to Cloudinary if provided
  let dokaanImageUrl = null;
  if (dokaanImage) {
    const validationError = imageValidator(dokaanImage.size, dokaanImage.mimetype);
    if (validationError) throw new Error(validationError);

    const fileName = generateFileName() + "." + dokaanImage.name.split(".").pop();
    const uploadResult = await cloudinary.uploader.upload(dokaanImage.tempFilePath, {
      folder: "dokaans",
      public_id: fileName,
    });
    dokaanImageUrl = uploadResult.secure_url;
  }

  // Create Dokaan with user's ID as ownerId
  const dokaan = await prisma.dokaan.create({
    data: {
      dokaan_name,
      dokaan_location,
      dokaan_email,
      dokaan_phone,
      dokaan_type,
      // dokaanImageUrl, // Save the Cloudinary URL
      ownerId: user.id,
    },
  });

  // Generate JWT Token
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "365d" }
  );

  const { password: userPassword, ...userWithoutSensitiveData } = user;

  return {
    dokaan,
    user: userWithoutSensitiveData,
    access_token: `Bearer ${token}`,
  };
};

// Update Dokaan
export const updateDokaan = async (id, data, files) => {
  let dokaanImageUrl = null;

  // Process file if provided
  if (files && files.dokaan_imageUrl) {
    const dokaanImage = files.dokaan_imageUrl;

    // Validate the image (size, type, etc.)
    const validationError = imageValidator(dokaanImage.size, dokaanImage.mimetype);
    if (validationError) throw new Error(validationError);

    // Upload to cloud storage (e.g., Cloudinary, AWS S3)
    const fileName = `${Date.now()}-${dokaanImage.name}`;
    const uploadResult = await cloudinary.uploader.upload(dokaanImage.tempFilePath, {
      folder: "dokaans",
      public_id: fileName,
    });

    dokaanImageUrl = uploadResult.secure_url;
  }

  // Update Dokaan with or without image
  return await prisma.dokaan.update({
    where: { id: BigInt(id) },
    data: {
      ...data,
      dokaan_imageUrl: dokaanImageUrl || undefined, // Only update image if provided
    },
  });
};



// Delete Dokaan
export const deleteDokaan = async (id) => {
  return await prisma.dokaan.delete({ where: { id: BigInt(id) } });
};

// Get All Dokaans
export const getAllDokaans = async () => {
  return await prisma.dokaan.findMany({
    include: {
      owner: true,
      employees: true,
    },
  });
};

// Get Dokaan by ID
export const getDokaanById = async (id) => {
  return await prisma.dokaan.findUnique({
    where: { id: BigInt(id) },
    include: {
      owner: true,
      employees: true,
    },
  });
};

// Add Employee to Dokaan
export const addEmployeeToDokaan = async (dokaanId, employeeData) => {
  return await prisma.user.create({
    data: {
      ...employeeData,
      dokaanId: BigInt(dokaanId),
    },
  });
};

// Remove Employee from Dokaan
export const removeEmployeeFromDokaan = async (id) => {
  return await prisma.user.update({
    where: { id: BigInt(id) },
    data: {
      dokaanId: null,
      shopRole: null,
    },
  });
};

// Add Employee from Existing Account
export const addEmployeeFromExistingAccount = async (email, dokaanId, shopRole) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User with the provided email does not exist");

  const dokaan = await prisma.dokaan.findUnique({ where: { id: BigInt(dokaanId) } });
  if (!dokaan) throw new Error("Shop (Dokaan) with the provided ID does not exist");

  return await prisma.user.update({
    where: { email },
    data: {
      dokaanId: BigInt(dokaanId),
      shopRole,
    },
  });
};


// Get all Dokaans for a user by email
export async function getDokaansByUserEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        dokaanOwned: true,         // Shops the user owns
        dokaanEmployment: true,    // Shop where the user is an employee
        // productsOwned: true,       // Products created by the user
        // salesMade: true,           // Sales made by the user
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Optional: You can structure the response to send only dokaans, or send the whole user with related data
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      dokaanOwned: user.dokaanOwned,
      dokaanEmployment: user.dokaanEmployment,
      productsOwned: user.productsOwned,
      salesMade: user.salesMade,
    };
  } catch (error) {
    console.error("Error in getDokaansByUserEmail:", error);
    throw error;
  }
}
