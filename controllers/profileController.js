
export default class profileController {

static async getProfile(req, res) {
    const user = req.user;
    return res.json({
        status: 200,
        message: "Profile",
        data: user,
    });
}




static async getAllProfiles(req, res) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.json({
            status: 200,
            message: "All profiles",
            data: users,
        });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ status: 500, message: "Internal server error" });
    }}

    // static async getProfile(req, res) {
    //     try {
    //         const user = await prisma.user.findUnique({
    //             where: {
    //                 id: req.user.id,
    //             },
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         return res
    //             .status(500)
    //             .json({ status: 500, message: "Internal server error" });
    //     }
    // }

    static async updateProfile(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(updateProfileSchema);
            const payload = await validator.validate(body);

            const user = await prisma.user.update({
                where: {
                    id: req.user.id,
                },
                data: payload,
            });

            return res.json({
                status: 200,
                message: "Profile updated successfully",
                data: user,
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


    
};