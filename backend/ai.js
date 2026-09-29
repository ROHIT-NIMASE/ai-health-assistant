require("dotenv").config();
const OpenAI = require("openai");

// Same SDK, pointed at our local Ollama server instead of OpenAI's servers.
// Ollama ignores the API key, but the SDK requires the field to be present.
const client = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL,
  apiKey: "ollama", // placeholder — Ollama does not check this
});

// Temporary test function — replaced by the real clinical prompt in Stage 11.
async function testAIConnection() {
  const response = await client.chat.completions.create({
    model: process.env.OLLAMA_MODEL,
    messages: [
      { role: "user", content: "Reply with exactly: AI connection working." },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = { testAIConnection };