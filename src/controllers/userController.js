import { 
  createAUser, 
  getAllUsers, 
  getUserByIdQuery, 
  getUserByEmailQuery, 
  updateAUser, 
  deleteAUser 
} from '../services/user.services.js'; 

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers(); 
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

// Get user by id
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserByIdQuery(id); 
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
    const user = await getUserByEmailQuery(email); 
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
    const newUser = await createAUser(req.body); 
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
    const updatedUser = await updateAUser(id, req.body); 
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
    const deletedUser = await deleteUser(id); 
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