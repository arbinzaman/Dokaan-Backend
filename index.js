import "dotenv/config"; // Load environment variables from .env
import app from "./server.js"; // Import the app instance from server.js

// Retrieve the PORT from environment variables or use a default
const PORT = process.env.PORT || 3000;

// Test route to verify the backend
app.get("/", (req, res) => {
  res.send("Hello World from Dokaan backend!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});
