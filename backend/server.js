const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve the frontend folder as static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// --- Routes ---
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AI Health Assistant server is running",
    timestamp: new Date().toISOString(),
  });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});