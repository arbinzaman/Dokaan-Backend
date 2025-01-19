import Prisma from "../config/db.config.js";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await Prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by id
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await Prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const findUser = await Prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (findUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  try {
    const newUser = await Prisma.user.create({
      data: {
        name: name,
        email: email,
        password: password,
        role: role,
      },
    });
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const updatedUser = await Prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: name,
        email: email,
        password: password,
        role: role,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Delete user
// In userController.js 
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
      // Delete all Dokaan records associated with the user
      await Prisma.dokaan.deleteMany({
          where: {
              ownerId: parseInt(id),
          },
      });

      // Delete the user
      await Prisma.user.delete({
          where: {
              id: parseInt(id),
          },
      });

      res.json({ message: "User deleted" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};