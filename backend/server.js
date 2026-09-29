require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { getAllPatients, getPatientById, createPatient } = require("./database");
const { generatePatientSummary } = require("./ai");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => { /* ... */ });

app.get("/api/patients", (req, res, next) => { /* ... */ });
app.get("/api/patients/:id", (req, res, next) => { /* ... */ });
app.post("/api/patients", (req, res, next) => { /* ... */ });

// TEMPORARY — for testing the prompt only. Removed in Stage 12.
app.get("/api/ai-test", async (req, res, next) => {
  try {
    const dummyPatient = {
      name: "Test Patient",
      age: 24,
      gender: "Male",
      city: "Pune",
      medicalHistory: "",
      symptoms: ["Fever", "Headache"],
      freeTextSymptoms: "",
      duration: "2 days",
      notes: "",
    };

    const rawReply = await generatePatientSummary(dummyPatient);
    res.status(200).json({ rawReply });
  } catch (err) {
    next(err);
  }
});

// Catch-all — must be LAST among /api routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Error handler — must be after everything else
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});