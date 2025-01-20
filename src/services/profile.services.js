import Prisma from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import bcrypt from "bcryptjs";
import { imageValidator, generateFileName } from "../utils/helper.js";

// Fetch profile by user ID
export const getProfileById = async (userId) => {
  return await Prisma.user.findUnique({ where: { id: userId } });
};

// Update user profile
export const updateProfileData = async (id, data) => {
  return await Prisma.user.update({
    where: { id: Number(id) },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      profileImageUrl: true,
      role: true,
      twoFactorEnabled: true,
      subscription: true,        // Include subscription in response
      subscriptionStatus: true, // Include subscriptionStatus in response
    },
  });
};

// Delete user profile by ID
export const deleteProfileById = async (userId) => {
  return await Prisma.user.delete({ where: { id: userId } });
};

// Upload profile image to Cloudinary
export const handleProfileImageUpload = async (file) => {
  const validationError = imageValidator(file.size, file.mimetype);
  if (validationError) {
    throw new Error(validationError);
  }

  const fileName = generateFileName() + "." + file.name.split(".").pop();
  const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "user_profiles",
    public_id: fileName,
  });

  return uploadResult.secure_url;
};

// Validate role
export const validateRole = (role, validRoles = ["admin", "user", "moderator"]) => {
  if (role && !validRoles.includes(role)) {
    throw new Error(`Invalid role. Allowed values are: ${validRoles.join(", ")}.`);
  }
};

// Validate and hash password
export const validateAndHashPassword = async (oldPassword, newPassword, userPassword) => {
  if (!bcrypt.compareSync(oldPassword, userPassword)) {
    throw new Error("Old password is incorrect");
  }

  if (oldPassword === newPassword) {
    throw new Error("New password cannot be the same as the old password");
  }

  return bcrypt.hashSync(newPassword, 10);
};
