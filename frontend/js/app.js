// --- DOM Selection ---
const patientForm = document.getElementById("patient-form");
const symptomCheckboxes = document.querySelectorAll('input[name="symptom"]');
const freeTextSymptoms = document.getElementById("free-text-symptoms");
const errorBox = document.getElementById("form-error");
const resultCard = document.getElementById("result-card");
const resultContent = document.getElementById("result-content");
const generateBtn = document.getElementById("generate-btn");

// --- Event Listener (async so we can use await inside) ---
patientForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!validateSymptoms()) {
    showError("Please select at least one symptom or describe your symptoms in the text box.");
    return;
  }

  clearError();

  const formData = collectFormData();

  // The database has one "symptoms" list, so for now we merge the
  // free-text symptoms into it. (We will improve this in Stage 15.)
  const payload = {
    ...formData,
    symptoms: [...formData.symptoms, formData.freeTextSymptoms].filter(Boolean),
  };

  setLoading(true);

  try {
    const savedPatient = await sendPatientToServer(payload);
    showPreview(savedPatient);
    patientForm.reset();
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false); // runs on success AND failure
  }
});

// --- Talking to the backend ---
async function sendPatientToServer(patientData) {
  let response;

  try {
    response = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
    });
  } catch (networkError) {
    // fetch() throws only when the request could not reach the server
    throw new Error("Could not reach the server. Please check that it is running and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error("The server sent an unexpected response.");
  }

  // fetch() does NOT throw on 400/500, so we check response.ok ourselves
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

// --- UI Helpers ---
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

function showPreview(data) {
  // TEMPORARY: replaced by the real AI summary UI in Stage 14
  resultContent.textContent = JSON.stringify(data, null, 2);
  resultContent.classList.add("json-preview");
  resultCard.style.display = "block";
}