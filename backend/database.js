const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "database", "clinic.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT,
    phone TEXT,
    city TEXT,
    medical_history TEXT,
    symptoms TEXT,
    duration TEXT,
    notes TEXT,
    ai_summary TEXT,
    attention_level TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function getAllPatients() {
  const rows = db.prepare("SELECT * FROM patients ORDER BY created_at DESC, id DESC").all();
  return rows.map(parsePatient);
}

function getPatientById(id) {
  const row = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
  return row ? parsePatient(row) : null;
}

function createPatient(patient) {
  const result = db
    .prepare(
      `INSERT INTO patients
        (name, age, gender, phone, city, medical_history, symptoms, duration, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      patient.name,
      patient.age,
      patient.gender || "",
      patient.phone || "",
      patient.city || "",
      patient.medicalHistory || "",
      JSON.stringify(patient.symptoms || []),
      patient.duration || "",
      patient.notes || ""
    );

  return getPatientById(result.lastInsertRowid);
}

function parsePatient(row) {
  return { ...row, symptoms: JSON.parse(row.symptoms || "[]") };
}

module.exports = { getAllPatients, getPatientById, createPatient };