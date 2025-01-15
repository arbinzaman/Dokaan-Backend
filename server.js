import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import routes from "./src/routes/index.js"; // Import all routes

const app = express();

// Middleware
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(express.urlencoded({ extended: false }));

// CORS Configuration
const corsOptions = {
  origin: "*",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "x-reset-token",
    "x-invite-token",
    "x-api-key",
    "x-www-form-urlencoded",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/", routes);

// Error handler for BigInt serialization (if required by your app)
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default app;
