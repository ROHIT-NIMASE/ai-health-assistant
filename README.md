# AI Health Assistant for a Local Clinic

An educational, AI-assisted web application that collects patient information and symptoms, then generates a structured, **non-diagnostic AI summary** for clinic staff to review.

Built as an internship project to learn full-stack development, REST APIs, database integration, AI/LLM integration, prompt engineering, and responsible AI practices.

## Problem Statement

Small clinics often rely on manual patient intake forms and verbal communication, which can be time-consuming and inconsistent. This project explores how AI can help organize patient-reported information into a structured summary that clinic staff can review without replacing professional medical judgment.

## Project Objectives

- Build a full-stack healthcare web application.
- Collect and validate patient information and symptoms.
- Generate structured AI summaries using a local language model.
- Store patient records in a database.
- Provide a searchable dashboard for clinic staff.
- Implement validation, error handling, and basic AI safety checks.

## Features

- Patient registration with name, age, gender, phone, city, and medical history.
- Symptom selection through checkboxes and free-text input.
- AI-generated summaries containing symptoms, duration, missing information, and follow-up questions.
- Three attention levels: Routine, Soon, and Urgent.
- Dashboard with patient counts, search, and attention-level filters.
- Individual patient detail pages.
- Persistent SQLite database storage.
- Input validation and error handling.
- Responsive interface for desktop and mobile screens.
- AI response validation and a keyword-based safety filter.
- Medical disclaimer displayed with AI-generated summaries.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Database Library | better-sqlite3 |
| AI Model Runtime | Ollama |
| Language Model | Llama 3.2 |
| AI Integration | OpenAI-compatible Node.js SDK |
| Configuration | dotenv |
| Testing | Manual testing |

## System Architecture

```text
User / Browser
      |
      v
HTML + CSS + JavaScript
      |
      v
Express.js REST API
      |
      +-------------------+
      |                   |
      v                   v
SQLite Database       Ollama LLM
      |                   |
      +---------+---------+
                |
                v
     Validate AI Response
                |
                v
     Display Summary to User
```

The frontend communicates with the backend through API requests. The backend handles input validation, database operations, AI requests, and response validation.

## Project Structure

```text
ai-health-assistant/
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── patient.html
│   ├── css/
│   │   ├── style.css
│   │   ├── dashboard.css
│   │   └── patient.css
│   └── js/
│       ├── app.js
│       ├── dashboard.js
│       └── patient.js
├── backend/
│   ├── server.js
│   ├── ai.js
│   ├── database.js
│   └── validation.js
├── database/
│   └── clinic.db
├── .env
├── .gitignore
├── TEST_PLAN.md
├── package.json
└── README.md
```

*Note: The SQLite database and `.env` file should remain local and should not be committed to GitHub.*

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- [Ollama](https://ollama.com/)
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/ROHIT-NIMASE/ai-health-assistant.git
cd ai-health-assistant
```

### 2. Install dependencies

```bash
npm install
```

### 3. Download the AI model

```bash
ollama pull llama3.2
```

Make sure Ollama is running on your system.

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2
PORT=3000
```

These settings configure the local Ollama endpoint, model name, and backend port. No cloud API key is required for the local Ollama setup.

### 5. Start the application

```bash
npm run dev
```

### 6. Open the application

Open the following URL in your browser:

- **Application:** http://localhost:3000
- **Clinic Dashboard:** http://localhost:3000/dashboard.html

## Database

The project uses SQLite through `better-sqlite3`.

Patient information and AI-generated summaries are stored in a local database file. The database is initialized automatically by the application and persists between backend restarts.

Parameterized SQL statements are used for database queries to help prevent SQL injection.

## AI Integration

The application uses **Ollama with Llama 3.2** to generate structured summaries from patient-reported information.

The backend sends a system prompt containing instructions and the required response format, along with the patient's submitted information.

The model is accessed through an OpenAI-compatible local endpoint using the Node.js SDK. This allows the project to demonstrate LLM integration without requiring a paid cloud API.

## AI Response Format

The AI generates a structured response containing fields such as:

```json
{
  "summary": "A concise summary of the reported information",
  "symptoms": ["Reported symptom"],
  "duration": "Patient-reported duration",
  "missing_information": ["Information that may be useful"],
  "follow_up_questions": ["Question for further clarification"],
  "attention_level": "Routine",
  "disclaimer": "AI-generated information is not medical advice."
}
```

The example above illustrates the expected structure; actual content depends on the submitted information and model response.

## Healthcare Safety

This application is an educational project, not a medical diagnostic system.

- The AI is instructed not to diagnose diseases or prescribe medicines.
- Patient input is validated by the backend.
- AI responses are checked for expected fields and allowed attention levels.
- A keyword-based safety filter provides an additional safeguard.
- A medical disclaimer accompanies generated summaries.

**Important:** These safeguards are not a guarantee of medical accuracy or safety. AI-generated summaries must not replace assessment by a qualified healthcare professional. This project is not intended for independent clinical decision-making or emergency triage.

## Error Handling and Validation

The application includes several validation and error-handling layers:

- **Frontend validation:** Provides immediate feedback to users.
- **Backend validation:** Checks submitted patient information before processing.
- **AI response validation:** Checks the structure and values returned by the model.
- **Error handling:** Handles AI service failures, invalid responses, and database errors with appropriate application messages.

## Testing

The project includes a manual test plan covering:

- Valid and invalid patient submissions.
- Missing or invalid input fields.
- AI service failure and backend unavailability.
- AI response validation.
- Patient search and attention-level filtering.
- Patient details and invalid or missing IDs.
- Mobile layout and database persistence.

See [`TEST_PLAN.md`](./TEST_PLAN.md) for the detailed test plan and recorded results.

## Limitations

- The AI can produce incorrect or incomplete summaries.
- The keyword-based safety filter is not exhaustive.
- Response time depends on local hardware and model performance.
- Authentication and role-based access control are not implemented.
- The application has not been validated for real clinical use.
- Manual testing does not provide the same coverage as a comprehensive automated test suite.

## Future Improvements

- Add authentication and role-based access control.
- Introduce automated tests using a framework such as Jest.
- Improve accessibility and keyboard navigation.
- Add pagination for larger patient lists.
- Implement audit logging for access to patient records.
- Add a human review and approval workflow for AI-generated summaries.
- Improve AI safety validation and evaluation.

## Learning Outcomes

Through this project, I practised:

- Full-stack application development.
- REST API design using Express.js.
- Database operations using SQLite.
- Local LLM integration with Ollama.
- Prompt design and structured JSON responses.
- Backend validation and error handling.
- Git and GitHub version control.
- Manual testing and documentation.

## Author

**Rohit Nimase**

GitHub: [ROHIT-NIMASE](https://github.com/ROHIT-NIMASE)
