// --- DOM Selection ---
const patientForm = document.getElementById("patient-form");
const symptomCheckboxes = document.querySelectorAll('input[name="symptom"]');
const freeTextSymptoms = document.getElementById("free-text-symptoms");
const errorBox = document.getElementById("form-error");
const generateBtn = document.getElementById("generate-btn");

const resultCard = document.getElementById("result-card");
const attentionBadge = document.getElementById("attention-badge");
const summaryText = document.getElementById("summary-text");
const symptomsList = document.getElementById("symptoms-list");
const durationText = document.getElementById("duration-text");
const missingInfoList = document.getElementById("missing-info-list");
const followupList = document.getElementById("followup-list");
const aiDisclaimer = document.getElementById("ai-disclaimer");

// --- Event Listener ---
patientForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!validateSymptoms()) {
    showError("Please select at least one symptom or describe your symptoms in the text box.");
    return;
  }

  clearError();

  const formData = collectFormData();
  const payload = {
    ...formData,
    symptoms: [...formData.symptoms, formData.freeTextSymptoms].filter(Boolean),
  };

  setLoading(true);

  try {
    const savedPatient = await requestAISummary(payload);
    renderAISummary(savedPatient.ai_summary);
    patientForm.reset();
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

// --- Talking to the backend ---
async function requestAISummary(patientData) {
  let response;

  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
  } catch (networkError) {
    throw new Error("Could not reach the server. Please check that it is running and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error("The server sent an unexpected response.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

// --- Data Collection ---
function collectFormData() {
  const checkedSymptoms = Array.from(symptomCheckboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  return {
    name: document.getElementById("name").value.trim(),
    age: Number(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    phone: document.getElementById("phone").value.trim(),
    city: document.getElementById("city").value.trim(),
    medicalHistory: document.getElementById("medical-history").value.trim(),
    symptoms: checkedSymptoms,
    freeTextSymptoms: freeTextSymptoms.value.trim(),
    duration: document.getElementById("duration").value.trim(),
    notes: document.getElementById("additional-notes").value.trim(),
  };
}

// --- Validation ---
function validateSymptoms() {
  const anyCheckboxChecked = Array.from(symptomCheckboxes).some(
    (checkbox) => checkbox.checked
  );
  const freeTextFilled = freeTextSymptoms.value.trim().length > 0;
  return anyCheckboxChecked || freeTextFilled;
}

// --- UI Helpers: form state ---
function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  generateBtn.textContent = isLoading ? "Generating Summary..." : "Generate AI Summary";
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function clearError() {
  errorBox.textContent = "";
  errorBox.style.display = "none";
}

// --- Rendering the AI summary ---
function renderAISummary(data) {
  attentionBadge.textContent = data.attention_level;
  attentionBadge.className = "badge " + attentionBadgeClass(data.attention_level);

  summaryText.textContent = data.summary;

  renderPillList(symptomsList, data.symptoms);

  durationText.textContent = data.duration || "Not specified";

  renderBulletList(missingInfoList, data.missing_information, "No missing information flagged.");
  renderBulletList(followupList, data.follow_up_questions, "No follow-up questions suggested.");

  aiDisclaimer.textContent = data.disclaimer;

  resultCard.style.display = "block";
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
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