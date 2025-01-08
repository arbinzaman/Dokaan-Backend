import "dotenv/config"; // Import the dotenv package and call the config method to load the environment variables from the .env file
import express from "express"; // Import the express package 
import fileUpload from "express-fileupload";
import cors from "cors";
const app = express();
const PORT = 5000; 


app.get('/', (req, res) => {
    res.send('Hello World from Dokaan backend!');
});

//middleware
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
var corsOptions = {
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


//routes file
import routes from "./routes/index.js";
app.use(routes);


// Error handler
BigInt.prototype.toJSON = function () {
    return this.toString();
  };

// Start the server
app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});
