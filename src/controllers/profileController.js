import { generateFileName, imageValidator } from "../utils/helper.js";
import vine, { errors } from "@vinejs/vine";
import Prisma from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";
import { updatePasswordSchema } from "../validation/authValidation.js";
import bcrypt from "bcryptjs";


export default class profileController {
  static async getProfile(req, res) {
    try {
      const user = req.user;
      return res.json({
        status: 200,
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;
      let profileImageUrl = null;
      // console.log(req.body);
  
      // Handle profile image upload
      if (req.files && req.files.profileImageUrl) {
        const profile = req.files.profileImageUrl;
  
        // Validate image
        const validationError = imageValidator(profile.size, profile.mimetype);
        if (validationError) {
          return res.status(400).json({ status: 400, message: validationError });
        }
  
        // Generate filename and upload to Cloudinary
        const fileName = generateFileName() + "." + profile.name.split(".").pop();
        const uploadResult = await cloudinary.uploader.upload(profile.tempFilePath, {
          folder: "user_profiles",
          public_id: fileName,
        });
        profileImageUrl = uploadResult.secure_url;
      }
  
      // Update user data in the database
      const updatedUser = await Prisma.user.update({
        where: { id: Number(id) },
        data: {
          name: name || undefined,
          email: email || undefined,
          profileImageUrl: profileImageUrl || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImageUrl: true,
          role: true,
          twoFactorEnabled: true, // Include twoFactorEnabled in the response
          // twoFactorSecret: true,  // Include twoFactorSecret in the response
        },
      });
  
      return res.json({
        status: 200,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }
  

  static async deleteProfile(req, res) {
    try {
      await Prisma.user.delete({
        where: {
          id: req.user.id,
        },
      });

      return res.json({
        status: 200,
        message: "Profile deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }

  static async updatePassword(req, res) {
    try {
      const body = req.body;
      console.log(body);
      const validator = vine.compile(updatePasswordSchema);
      const payload = await validator.validate(body);
  
      // Fetch the user from the database using the user ID from the request
      const user = await Prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      });
  
      // Check if the old password matches the stored password
      const isMatch = bcrypt.compareSync(payload.oldPassword, user.password);
      // console.log("Old Password (Plain Text):", payload.oldPassword);
      // console.log("Stored Password (Hashed):", user.password);
      // console.log("Password Match:", isMatch);

      // console.log("Payload Old Password:", payload.oldPassword);
      // console.log("Fetched User:", user);
      // console.log("Stored Hashed Password:", user.password);
      // console.log("Password Match Result:", bcrypt.compareSync(payload.oldPassword, user.password));

      
      if (!isMatch) {
        return res.status(400).json({ status: 400, message: "Old password is incorrect" });
      }
  
      // Check if the new password is the same as the old one
      if (payload.oldPassword === payload.newPassword) {
        return res.status(400).json({ status: 400, message: "New password cannot be the same as the old password" });
      }
  
      // Hash the new password
      const hashedPassword = bcrypt.hashSync(payload.newPassword, 10);
  
      // Update the user's password in the database
      await Prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          password: hashedPassword,
        },
      });
  
      return res.json({
        status: 200,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error(error);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages });
      } else {
        return res.status(500).json({ status: 500, message: "Internal server error" });
      }
    }
  }
  
  
}
