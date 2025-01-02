import  Prisma  from "../config/db.config.js";

//get all users
export const getUsers = async (req, res) => {
    try {
        const users = await Prisma.user.findMany();
        res.json(users);
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//create user by id
export const createUser = async (req, res) => {
    const { name, email, password,role } = req.body;

    const findUser = await Prisma.user.findUnique({
        where: {
            email:email,
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
                role:role,
            },
        });
        res.json(newUser);
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//update user

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password,role } = req.body;

    try {
        const updateUser = await Prisma.user.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name: name,
                email: email,
                password: password,
                role:role,
            },
        });
        res.json(updateUser);
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//delete user
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await Prisma.user.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.json({ message: "User deleted" });
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}