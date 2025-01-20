import {
  getProfileById,
  updateProfileData,
  deleteProfileById,
  handleProfileImageUpload,
  validateRole,
  validateAndHashPassword,
} from "../services/profile.services.js";

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
      console.error("Error retrieving profile:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const { name, email, twoFactorEnabled, role, subscription, subscriptionStatus } = req.body;
  
      let profileImageUrl = null;
  
      // Handle profile image upload if present
      if (req.files && req.files.profileImageUrl) {
        profileImageUrl = await handleProfileImageUpload(req.files.profileImageUrl);
      }
  
      // Validate role (if provided)
      if (role) validateRole(role);
  
      // Prepare the data for update
      const updatedUser = await updateProfileData(id, {
        name,
        email,
        profileImageUrl,
        twoFactorEnabled,
        role,
        subscription,
        subscriptionStatus,
      });
  
      return res.json({
        status: 200,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(400).json({ status: 400, message: error.message || "Internal server error" });
    }
  }
  

  static async deleteProfile(req, res) {
    try {
      await deleteProfileById(req.user.id);
      return res.json({ status: 200, message: "Profile deleted successfully" });
    } catch (error) {
      console.error("Error deleting profile:", error);
      return res.status(500).json({ status: 500, message: "Internal server error" });
    }
  }

  static async updatePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await getProfileById(req.user.id);

      if (!user) {
        return res.status(404).json({ status: 404, message: "User not found" });
      }

      const hashedPassword = await validateAndHashPassword(oldPassword, newPassword, user.password);

      await updateProfileData(req.user.id, { password: hashedPassword });

      return res.json({ status: 200, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(400).json({ status: 400, message: error.message || "Internal server error" });
    }
  }
}
