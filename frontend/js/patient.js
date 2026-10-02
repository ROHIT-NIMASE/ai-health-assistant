// --- DOM Selection ---
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const patientContent = document.getElementById("patient-content");

const infoName = document.getElementById("info-name");
const infoAge = document.getElementById("info-age");
const infoGender = document.getElementById("info-gender");
const infoPhone = document.getElementById("info-phone");
const infoCity = document.getElementById("info-city");
const infoCreated = document.getElementById("info-created");
const infoHistory = document.getElementById("info-history");
const infoNotes = document.getElementById("info-notes");

const resultCard = document.getElementById("result-card");
const attentionBadge = document.getElementById("attention-badge");
const summaryText = document.getElementById("summary-text");
const symptomsList = document.getElementById("symptoms-list");
const durationText = document.getElementById("duration-text");
const missingInfoList = document.getElementById("missing-info-list");
const followupList = document.getElementById("followup-list");
const aiDisclaimer = document.getElementById("ai-disclaimer");

// --- Run as soon as the page is ready ---
document.addEventListener("DOMContentLoaded", loadPatient);

async function loadPatient() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    showError("No patient id was provided in the URL.");
    loadingMessage.style.display = "none";
    return;
  }

  try {
    const patient = await fetchPatient(id);
    renderPatientInfo(patient);

    if (patient.ai_summary) {
      renderAISummary(patient.ai_summary);
      resultCard.style.display = "block";
    } else {
      resultCard.style.display = "none"; // patient saved without an AI summary (e.g. via old /api/patients route)
    }

    patientContent.style.display = "block";
  } catch (error) {
    showError(error.message);
  } finally {
    loadingMessage.style.display = "none";
  }
}

// --- Talking to the backend ---
async function fetchPatient(id) {
  let response;

  try {
    response = await fetch(`/api/patients/${id}`);
  } catch (networkError) {
    throw new Error("Could not reach the server. Please check that it is running.");
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error("The server sent an unexpected response.");
  }

  if (response.status === 404) {
    throw new Error("No patient was found with that id.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Could not load this patient.");
  }

  return data;
}

// --- Rendering: patient info ---
function renderPatientInfo(patient) {
  infoName.textContent = patient.name;
  infoAge.textContent = patient.age;
  infoGender.textContent = patient.gender || "—";
  infoPhone.textContent = patient.phone || "—";
  infoCity.textContent = patient.city || "—";
  infoCreated.textContent = patient.created_at
    ? new Date(patient.created_at).toLocaleString()
    : "—";
  infoHistory.textContent = patient.medical_history || "None provided";
  infoNotes.textContent = patient.notes || "None provided";
}

// --- Rendering: AI summary (same shape/logic as app.js, Stage 14) ---
function renderAISummary(data) {
  attentionBadge.textContent = data.attention_level;
  attentionBadge.className = "badge " + attentionBadgeClass(data.attention_level);

  summaryText.textContent = data.summary;

  renderPillList(symptomsList, data.symptoms);

  durationText.textContent = data.duration || "Not specified";

  renderBulletList(missingInfoList, data.missing_information, "No missing information flagged.");
  renderBulletList(followupList, data.follow_up_questions, "No follow-up questions suggested.");

  aiDisclaimer.textContent = data.disclaimer;
}

function attentionBadgeClass(level) {
  if (level === "Urgent") return "badge-urgent";
  if (level === "Soon") return "badge-soon";
  return "badge-routine";
}

function renderPillList(container, items) {
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.textContent = "None reported";
    return;
  }

  items.forEach((item) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = item;
    container.appendChild(pill);
  });
}

function renderBulletList(container, items, emptyMessage) {
  container.innerHTML = "";

  if (!items || items.length === 0) {
    const li = document.createElement("li");
    li.textContent = emptyMessage;
    li.className = "empty-item";
    container.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

// --- UI Helpers ---
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}