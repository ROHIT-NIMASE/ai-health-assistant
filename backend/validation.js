// Validates patient input data. Returns an array of error messages.
// An empty array means the input is valid.
function validatePatientInput(patient) {
  const errors = [];

  if (!patient || typeof patient !== "object") {
    return ["Request body is missing or invalid"];
  }

  if (!patient.name || typeof patient.name !== "string" || patient.name.trim() === "") {
    errors.push("Name is required");
  }

  // Use typeof/isNaN checks, NOT "!patient.age", so that age 0 is not
  // incorrectly treated as missing (0 is falsy in JavaScript).
  if (
    patient.age === undefined ||
    patient.age === null ||
    typeof patient.age !== "number" ||
    Number.isNaN(patient.age)
  ) {
    errors.push("Age is required and must be a number");
  } else if (patient.age < 0 || patient.age > 120) {
    errors.push("Age must be between 0 and 120");
  }

  if (!patient.gender || typeof patient.gender !== "string" || patient.gender.trim() === "") {
    errors.push("Gender is required");
  }

  const hasCheckedSymptoms = Array.isArray(patient.symptoms) && patient.symptoms.length > 0;
  const hasFreeTextSymptoms =
    typeof patient.freeTextSymptoms === "string" && patient.freeTextSymptoms.trim() !== "";

  if (!hasCheckedSymptoms && !hasFreeTextSymptoms) {
    errors.push("At least one symptom (selected or described) is required");
  }

  if (!patient.duration || typeof patient.duration !== "string" || patient.duration.trim() === "") {
    errors.push("Duration is required");
  }

  return errors;
}

module.exports = { validatePatientInput };