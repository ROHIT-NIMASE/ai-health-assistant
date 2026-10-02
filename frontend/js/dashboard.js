// --- DOM Selection ---
const statTotal = document.getElementById("stat-total");
const statRoutine = document.getElementById("stat-routine");
const statSoon = document.getElementById("stat-soon");
const statUrgent = document.getElementById("stat-urgent");

const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const emptyMessage = document.getElementById("empty-message");
const patientsTable = document.getElementById("patients-table");
const patientsTableBody = document.getElementById("patients-table-body");

// --- Run as soon as the page is ready ---
document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {
  try {
    const patients = await fetchPatients();
    renderStats(patients);
    renderTable(patients);
  } catch (error) {
    showError(error.message);
  } finally {
    loadingMessage.style.display = "none";
  }
}

// --- Talking to the backend ---
async function fetchPatients() {
  let response;

  try {
    response = await fetch("/api/patients");
  } catch (networkError) {
    throw new Error("Could not reach the server. Please check that it is running.");
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error("The server sent an unexpected response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Could not load patients.");
  }

  return data;
}

// --- Rendering ---
function renderStats(patients) {
  const total = patients.length;
  const routine = patients.filter((p) => p.attention_level === "Routine").length;
  const soon = patients.filter((p) => p.attention_level === "Soon").length;
  const urgent = patients.filter((p) => p.attention_level === "Urgent").length;

  statTotal.textContent = total;
  statRoutine.textContent = routine;
  statSoon.textContent = soon;
  statUrgent.textContent = urgent;
}

function renderTable(patients) {
  patientsTableBody.innerHTML = ""; // safe: clearing, not inserting untrusted text

  if (patients.length === 0) {
    emptyMessage.style.display = "block";
    patientsTable.style.display = "none";
    return;
  }

  emptyMessage.style.display = "none";
  patientsTable.style.display = "table";

  patients.forEach((patient) => {
    patientsTableBody.appendChild(buildPatientRow(patient));
  });
}

function buildPatientRow(patient) {
  const row = document.createElement("tr");
  row.classList.add("patient-row");
  row.addEventListener("click", () => {
    window.location.href = `patient.html?id=${patient.id}`;
  });

  const nameCell = document.createElement("td");
  nameCell.textContent = patient.name;

  const ageCell = document.createElement("td");
  ageCell.textContent = patient.age;

  const symptomsCell = document.createElement("td");
  symptomsCell.textContent =
    patient.symptoms && patient.symptoms.length ? patient.symptoms.join(", ") : "—";

  const durationCell = document.createElement("td");
  durationCell.textContent = patient.duration || "—";

  const attentionCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = "badge " + attentionBadgeClass(patient.attention_level);
  badge.textContent = patient.attention_level || "Unknown";
  attentionCell.appendChild(badge);

  row.append(nameCell, ageCell, symptomsCell, durationCell, attentionCell);
  return row;
}

function attentionBadgeClass(level) {
  if (level === "Urgent") return "badge-urgent";
  if (level === "Soon") return "badge-soon";
  return "badge-routine";
}

// --- UI Helpers ---
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}