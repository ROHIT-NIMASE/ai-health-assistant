const express = require("express");
const cors = require("cors");
const path = require("path");
const { getAllPatients, getPatientById, createPatient } = require("./database");
const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// --- TEMPORARY in-memory data (replaced by SQLite in Stage 8) ---
// Dummy patients only.
// List all patients
app.get("/api/patients", (req, res, next) => {
  try {
    res.status(200).json(getAllPatients());
  } catch (err) {
    next(err); // hand the error to the error-handling middleware
  }
});

// Get one patient by id
app.get("/api/patients/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const patient = getPatientById(id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (err) {
    next(err);
  }
});

// Create a patient
app.post("/api/patients", (req, res, next) => {
  try {
    const { name, age } = req.body;

    // Minimal check for now. Proper validation comes later.
    if (!name || !age) {
      return res.status(400).json({ error: "Name and age are required" });
    }

    const newPatient = createPatient(req.body);
    res.status(201).json(newPatient);
  } catch (err) {
    next(err);
  }
});

// --- Routes ---

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AI Health Assistant server is running",
    timestamp: new Date().toISOString(),
  });
});

// List all patients
app.get("/api/patients", (req, res) => {
  res.status(200).json(patients);
});

// Get one patient by id
app.get("/api/patients/:id", (req, res) => {
  const id = Number(req.params.id);
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  res.status(200).json(patient);
});

// Create a patient
app.post("/api/patients", (req, res) => {
  const { name, age, city, symptoms, duration } = req.body;

  // Minimal check for now. Proper validation comes in a later stage.
  if (!name || !age) {
    return res.status(400).json({ error: "Name and age are required" });
  }

  const newPatient = {
    id: nextId++,
    name,
    age,
    city: city || "",
    symptoms: symptoms || [],
    duration: duration || "",
  };

  patients.push(newPatient);
  res.status(201).json(newPatient);
});

// --- Unknown API routes: return JSON 404 instead of an HTML page ---
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// --- Error-handling middleware (4 parameters) ---
app.use((err, req, res, next) => {
  console.error("Server error:", err.message); // full detail stays in OUR terminal
  res.status(500).json({ error: "Something went wrong on the server" }); // safe message for the user
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});