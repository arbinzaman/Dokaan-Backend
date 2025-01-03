import prisma from "../config/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema ,loginSchema} from "../validation/authValidation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class AuthController {
  static async register(req, res) {
    try {
      const body = req.body;
      const validator = vine.compile(registerSchema);
      const payload = await validator.validate(body);

      //check if user exist
      const userExist = await prisma.user.findFirst({
        where: {
          email: payload.email,
        },
      });

      if (userExist) {
        return res
          .status(400)
          .json({ status: 400, message: "User already exist" });
      }

      //encrypt password
      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      //create user
      const user = await prisma.user.create({
        data: payload,
      });

      return res.json({
        status: 200,
        message: "User created successfully",
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




  //login
  static async login(req, res) {
    try {
      const body = req.body;

      const validator = vine.compile(loginSchema);
      const payload = await validator.validate(body);
 

      //check if user exist
      const user = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ status: 400, message: "User does not exist" });
      }

      //compare password
      const isMatch = bcrypt.compareSync(payload.password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ status: 400, message: "Invalid credentials" });
      }


  // issue token
  const payloadData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });


      return res.json({
        status: 200,
        message: "Login successful",
        // data: user,
        // payload,
        access_token: `Bearer ${token}`,
      });
      
    } catch (error) {
      return res
        .status(500)
        .json({ status: 500, message: "Internal server error" });
    }
  }


}

export default AuthController;
