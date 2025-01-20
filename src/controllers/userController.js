// controllers/userController.js
import { 
  createUserService, 
  getUsersService, 
  getUserByIdService, 
  getUserByEmailService, 
  updateUserService, 
  deleteUserService,
  getUserGrowthDataService
} from '../services/user.services.js';

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await getUsersService();
    res.status(200).json({ 
      status: 'success', 
      message: 'Users fetched successfully', 
      data: users 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserByIdService(id);
    if (user) {
      res.status(200).json({ 
        status: 'success', 
        message: 'User fetched successfully', 
        data: user 
      });
    } else {
      res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await getUserByEmailService(email);
    if (user) {
      res.status(200).json({ 
        status: 'success', 
        message: 'User fetched successfully', 
        data: user 
      });
    } else {
      res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const newUser = await createUserService(req.body);
    res.status(201).json({ 
      status: 'success', 
      message: 'User created successfully', 
      data: newUser 
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedUser = await updateUserService(id, req.body);
    res.status(200).json({ 
      status: 'success', 
      message: 'User updated successfully', 
      data: updatedUser 
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error', 
      message: error.message 
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await deleteUserService(id);
    res.status(200).json({ 
      status: 'success', 
      message: 'User deleted successfully', 
      data: deletedUser 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};

// Get user growth data
export const getUserGrowthData = async (req, res) => {
  try {
    const growthData = await getUserGrowthDataService();
    res.status(200).json({ 
      status: 'success', 
      message: 'User growth data fetched successfully', 
      data: growthData 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error', 
      error: error.message 
    });
  }
};
