import { Router } from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import productRoutes from "./productRoutes.js";
// import transporter from "../config/email.config.js";
import dokaanRoutes from "./dokaanRoutes.js";
import salesRoutes from "./sales.routes.js";
import customerRoutes from "./customer.routes.js";
import employeeRoutes from "./employee.routes.js";

const router = Router();

router.use("/api/v1/user", userRoutes);
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/profile", profileRoutes);
router.use("/api/v1/dokaan", dokaanRoutes);
router.use("/api/v1/products", productRoutes);
router.use("/api/v1/sales", salesRoutes);
router.use("/api/v1/customers", customerRoutes)
router.use("/api/v1/employee", employeeRoutes);

// router.post('/send-email', async (req, res) => {
//     const { to, subject, text, html } = req.body;
  
//     try {
//       const info = await transporter.sendMail({
//         from: '"Dokaan Tech" <dokaan.tech@gmail.com>',
//         to,
//         subject,
//         text,
//         html,
//       });
  
//       res.json({ message: 'Email sent successfully', info });
//     } catch (error) {
//       console.error('Error sending email:', error);
//       res.status(500).json({ message: 'Error sending email', error });
//     }
//   });

export default router;