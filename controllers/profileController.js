import { generateFileName, imageValidator } from "../utils/helper.js";
import { errors } from "@vinejs/vine";
import  Prisma  from "../config/db.config.js";
import cloudinary from "../config/cloudinary.config.js";

export default class profileController {
  static async getProfile(req, res) {
    try {
      const user = req.user;
      return res.json({
        status: 200,
        message: "Profile",
        data: user,
      });
    } catch (error) {
      console.log(error);
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
  
      // Update user data
      const updatedUser = await Prisma.user.update({
        where: { id: Number(id) },
        data: {
          name: name || undefined,
          email: email || undefined,
          profileImageUrl: profileImageUrl || undefined,
        },
      });
  
      // Exclude password from the response
      const { password: _, ...userWithoutPassword } = updatedUser;
  
      return res.json({
        status: 200,
        message: "User updated successfully",
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  };  
  
  

  static async deleteProfile(req, res) {
    try {
      await prisma.user.delete({
        where: {
          id: req.user.id,
        },
      });

      return res.json({
        status: 200,
        message: "Profile deleted successfully",
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }

  static async updatePassword(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(updatePasswordSchema);
      const payload = await validator.validate(body);

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
      });

      const isMatch = bcrypt.compareSync(payload.oldPassword, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ status: 400, message: "Invalid credentials" });
      }

      const hashedPassword = bcrypt.hashSync(payload.newPassword, 10);

      await prisma.user.update({
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
      console.log(error.messages);
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ error: error.messages });
      } else {
        return res
          .status(500)
          .json({ status: 500, message: "Internal server error" });
      }
    }
  }
}
