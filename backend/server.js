require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const { getAllPatients, getPatientById, createPatient } = require("./database");
const { generatePatientSummary, parseAIResponse, validateAISummary } = require("./ai");

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

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
app.get("/api/patients", (req, res, next) => {
  try {
    res.status(200).json(getAllPatients());
  } catch (err) {
    next(err);
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

// Create a patient WITHOUT AI (simple direct-add utility; not used by the main form)
app.post("/api/patients", (req, res, next) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).json({ error: "Name and age are required" });
    }

    const newPatient = createPatient(req.body);
    res.status(201).json(newPatient);
  } catch (err) {
    next(err);
  }
});

// Analyze patient data with AI, then save the complete record.
app.post("/api/analyze", async (req, res, next) => {
  const patient = req.body;

  if (!patient || !patient.name || !patient.age) {
    return res.status(400).json({ error: "Patient name and age are required" });
  }

  // Step 1: call the AI
  let rawReply;
  try {
    rawReply = await generatePatientSummary(patient);
  } catch (aiError) {
    console.error("AI call failed:", aiError.message);
    return res.status(502).json({ error: "The AI service is currently unavailable. Please try again." });
  }

  // Step 2: parse the AI's text into an object
  let aiSummary;
  try {
    aiSummary = parseAIResponse(rawReply);
  } catch (parseError) {
    console.error("AI response parse failed:", parseError.message, "Raw reply:", rawReply);
    return res.status(502).json({ error: "The AI returned an unexpected response. Please try again." });
  }

  // Step 3: validate the object's shape and values
  try {
    validateAISummary(aiSummary);
  } catch (validationError) {
    console.error("AI response validation failed:", validationError.message, "Parsed reply:", aiSummary);
    return res.status(502).json({ error: "The AI returned an incomplete response. Please try again." });
  }

  // Step 4: save patient + AI summary together
  let savedPatient;
  try {
    savedPatient = createPatient({
      ...patient,
      aiSummary,
      attentionLevel: aiSummary.attention_level,
    });
  } catch (dbError) {
    console.error("Database save failed:", dbError.message);
    return res.status(500).json({ error: "Could not save the patient record. Please try again." });
  }

  // Step 5: return the full saved record
  res.status(201).json(savedPatient);
});

// --- Unknown API routes: return JSON 404 instead of an HTML page ---
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// --- Error-handling middleware (4 parameters) ---
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});