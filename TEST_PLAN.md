# AI Health Assistant — Test Plan and Results

**Tester:** Rohit Nimase  
**Date:** 03 October 2026  
**Environment:** Windows, Node.js, Express, SQLite, Ollama (`llama3.2`)  
**Project:** AI Health Assistant

> **Reporting note:** Results below reflect the outcomes actually reported during testing. Unverified cases are not marked as passed. Update the remaining statuses only after completing those checks.

## Test Results

| # | Test case | Actual result | Status |
|---:|---|---|---|
| 1 | Valid patient submission | AI summary generated and patient record was visible in the dashboard. | PASS |
| 2 | Missing name | Request returned HTTP 400 with a name-validation error. | PASS |
| 3 | Missing age | Request returned HTTP 400 when age was omitted. | PASS |
| 4 | Age = 0 | Submission was accepted and the patient record showed age 0. | PASS |
| 5 | Negative age | Request returned HTTP 400 with an age-validation error. | PASS |
| 6 | No symptoms | Form blocked submission and asked the user to select or describe symptoms. | PASS |
| 7 | Missing duration | Request returned HTTP 400 with a duration-validation error. | PASS |
| 8 | AI service unavailable | With the AI endpoint temporarily pointed at an unavailable port, the API returned HTTP 502 and the expected service-unavailable message. | PASS |
| 9 | Invalid AI response | Direct validator test rejected an empty summary. End-to-end API behavior for this case was not confirmed. | PARTIAL |
| 10 | Backend unavailable | With the Node.js backend stopped, the already-loaded frontend displayed “Could not reach the server. Please check that it is running and try again.” Backend was restarted successfully afterward. | PASS |
| 11 | Database failure | The code's `createPatient` call is wrapped in `try...catch`, and the catch returns HTTP 500. Runtime simulation of a database-save failure has not been completed. | PENDING |
| 12 | Serious symptoms | Summary generated for chest pain, difficulty breathing, and sudden sweating; attention level was **Urgent**. Explicit immediate emergency-care guidance was not confirmed from the screenshot. | PARTIAL |
| 13 | Search by name | Searching for “Rahul Sharma” filtered the patient list correctly. | PASS |
| 14 | No search results | Searching for `XYZ_NoPatient_999` displayed “No patients found.” | PASS |
| 15 | Filter by attention level | Selecting Urgent displayed only patients with the Urgent attention level. | PASS |
| 16 | Empty patient list | Dashboard code includes an empty-state message, but runtime behavior with an empty patient list has not been verified. | PARTIAL |
| 17 | Patient details page | Clicking Rahul Sharma opened the details page and displayed patient information and the AI summary. | PASS |
| 18 | Invalid patient ID | Opening the details page with ID `999999` displayed a “Patient not found” message. | PASS |
| 19 | Missing patient ID | Opening `http://localhost:3000/patient.html` displayed “No patient id was provided in the URL” and a Back to Dashboard link. | PASS |
| 20 | Mobile layout | Application worked in mobile device emulation. | PASS |
| 21 | Restart persistence | Rahul Sharma and the patient details remained available after restarting the backend. | PASS |
| 22 | Disclaimer visibility | Full medical disclaimer was visible and readable on the patient details page. | PASS |

## Summary

- **PASS:** 18
- **PARTIAL:** 3
- **PENDING:** 1
- **FAIL:** 0

## Remaining verification

1. **Test 9 — Invalid AI response:** Exercise the API with a controlled invalid AI response and confirm the expected HTTP 502 response.
2. **Test 11 — Database failure:** Use a safe isolated test database or a controlled test double to force the save operation to fail; confirm HTTP 500. Do not delete or alter the real `database/clinic.db`.
3. **Test 12 — Serious symptoms:** Verify that the displayed result explicitly advises immediate emergency medical care, not only an `Urgent` badge.
4. **Test 16 — Empty patient list:** Verify the empty-state UI using an isolated test database or a controlled mock response. Do not clear the real database.

## Notes

- A passing test records observed behavior, not merely expected behavior or the presence of code.
- Keep fictional patient data for demonstrations and tests.
- The AI assistant is not a substitute for a qualified healthcare professional or emergency services.
