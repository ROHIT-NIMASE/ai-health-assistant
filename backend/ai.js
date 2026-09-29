require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL,
  apiKey: "ollama",
});

// The SYSTEM prompt: constant rules, sent on every single call.
const SYSTEM_PROMPT = `
You are an AI assistant used in an educational clinic-management application.

Your job is to organize patient-provided information into a clear, structured,
non-diagnostic summary for clinic staff to review.

STRICT RULES — follow these exactly:
- Do not diagnose diseases.
- Do not prescribe medicines.
- Do not recommend medication dosages.
- Do not claim that the patient has a specific disease or condition.
- Do not provide medical advice of any kind.
- Only use the information the patient actually supplied. Do not invent symptoms,
  history, or details that were not given.
- Identify any important missing information a clinician would likely want to know.
- Generate a short list of useful follow-up questions clinic staff could ask the patient.
- Assign an "attention_level" of exactly one of: "Routine", "Soon", or "Urgent".
  This level reflects how promptly a human professional should review the case,
  based only on the reported information. It is NOT a diagnosis.
- If the reported information suggests professional attention may be needed soon,
  you may use "Urgent", but phrase everything around it as "the reported information
  may require prompt professional attention" — never name a condition or disease.

You must respond with ONLY a valid JSON object, no extra text before or after it,
matching exactly this shape:

{
  "summary": "string - a short, neutral summary of what the patient reported",
  "symptoms": ["array", "of", "strings"],
  "duration": "string",
  "missing_information": ["array", "of", "strings"],
  "follow_up_questions": ["array", "of", "strings"],
  "attention_level": "Routine" | "Soon" | "Urgent",
  "disclaimer": "This AI-generated information is for informational and educational purposes only. It is not a medical diagnosis or medical advice. Please consult a qualified healthcare professional for medical decisions."
}
`.trim();

// Builds the USER message: the specific patient's data for this call.
function buildUserPrompt(patient) {
  return `
Patient-provided information:

Name: ${patient.name}
Age: ${patient.age}
Gender: ${patient.gender}
City: ${patient.city}
Medical history / notes: ${patient.medicalHistory || "None provided"}

Symptoms (selected): ${patient.symptoms && patient.symptoms.length ? patient.symptoms.join(", ") : "None selected"}
Symptoms (free text): ${patient.freeTextSymptoms || "None provided"}
Duration: ${patient.duration}
Additional notes: ${patient.notes || "None provided"}

Generate the structured JSON summary now, following all rules exactly.
`.trim();
}

async function generatePatientSummary(patient) {
  const response = await client.chat.completions.create({
    model: process.env.OLLAMA_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(patient) },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

// Strips common wrapping artifacts, then parses into a real object.
function parseAIResponse(rawText) {
  let cleaned = rawText.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/i, "");
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI response could not be parsed as JSON");
  }
}
const ALLOWED_ATTENTION_LEVELS = ["Routine", "Soon", "Urgent"];

// Checks that the parsed AI object has the right fields, types, and values.
// Throws a descriptive Error naming the exact problem if anything is wrong.
function validateAISummary(summary) {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    throw new Error("AI response is not a valid object");
  }

  if (typeof summary.summary !== "string" || summary.summary.trim() === "") {
    throw new Error("AI response is missing a valid 'summary' string");
  }

  if (!Array.isArray(summary.symptoms)) {
    throw new Error("AI response 'symptoms' must be an array");
  }

  if (typeof summary.duration !== "string") {
    throw new Error("AI response 'duration' must be a string");
  }

  if (!Array.isArray(summary.missing_information)) {
    throw new Error("AI response 'missing_information' must be an array");
  }

  if (!Array.isArray(summary.follow_up_questions)) {
    throw new Error("AI response 'follow_up_questions' must be an array");
  }

  if (!ALLOWED_ATTENTION_LEVELS.includes(summary.attention_level)) {
    throw new Error(
      `AI response 'attention_level' must be one of ${ALLOWED_ATTENTION_LEVELS.join(", ")}, got "${summary.attention_level}"`
    );
  }

  if (typeof summary.disclaimer !== "string" || summary.disclaimer.trim() === "") {
    throw new Error("AI response is missing a valid 'disclaimer' string");
  }

  // All checks passed — return the summary unchanged.
  return summary;
}

module.exports = { generatePatientSummary, parseAIResponse, validateAISummary };

