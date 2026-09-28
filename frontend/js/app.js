// --- DOM Selection ---
const patientForm = document.getElementById("patient-form");
const symptomCheckboxes = document.querySelectorAll('input[name="symptom"]');
const freeTextSymptoms = document.getElementById("free-text-symptoms");
const errorBox = document.getElementById("form-error");
const resultCard = document.getElementById("result-card");
const resultContent = document.getElementById("result-content");

// --- Event Listener ---
patientForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!validateSymptoms()) {
    showError("Please select at least one symptom or describe your symptoms in the text box.");
    return;
  }

  clearError();

  const patientData = collectFormData();
  console.log("Collected data:", patientData);
  console.log("As JSON string:", JSON.stringify(patientData));

  showPreview(patientData);
});

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

// --- UI Helpers ---
function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function clearError() {
  errorBox.textContent = "";
  errorBox.style.display = "none";
}

function showPreview(data) {
  // TEMPORARY: replaced by the real AI summary UI in Stage 14
  resultContent.textContent = JSON.stringify(data, null, 2);
  resultContent.classList.add("json-preview");
  resultCard.style.display = "block";
}