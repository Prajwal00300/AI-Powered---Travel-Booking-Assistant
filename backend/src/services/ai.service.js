const genAI = require("../config/gemini");
const ApiError = require("../utils/ApiError");

/**
 * AiService
 * ─────────────────────────────────────────────────────────────
 * Gemini integration using ONLY the official @google/generative-ai SDK.
 *
 * Authentication:  new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
 * Model access:    genAI.getGenerativeModel({ model })
 * Content gen:     model.generateContent(prompt)
 *
 * NO axios, NO fetch, NO Authorization: Bearer headers anywhere here.
 * ─────────────────────────────────────────────────────────────
 */

// Primary model — fallbacks used only if primary is unavailable
const PRIMARY_MODEL   = "gemini-3.5-flash";
const FALLBACK_MODELS = ["gemini-3.1-flash-lite", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

/**
 * Safely calls generateContent() across a chain of models.
 * Falls through to the next model only on quota (429) or not-found (404) errors.
 * Throws immediately on auth errors or other failures.
 *
 * @param {string} prompt
 * @returns {string} Raw text response from Gemini
 */
const callGemini = async (prompt) => {
  const models = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  for (const modelName of models) {
    try {
      console.log(`🤖 [Gemini] Calling model: ${modelName}`);

      // Official SDK: getGenerativeModel + generateContent — no manual HTTP
      const model  = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text   = result.response.text();

      console.log(`✅ [Gemini] Response received from: ${modelName}`);
      return text.trim();

    } catch (err) {
      const msg     = err.message || "";
      const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests");
      const is404   = msg.includes("404") || msg.includes("not found");
      const isAuth  = msg.includes("401") || msg.includes("403") ||
                      msg.includes("API_KEY_INVALID") || msg.includes("UNAUTHENTICATED") ||
                      msg.includes("expired") || msg.includes("ACCESS_TOKEN");

      if (isAuth) {
        // Key is wrong — no point trying other models
        console.error(`❌ [Gemini] Auth error on ${modelName}: ${msg}`);
        throw new ApiError(
          401,
          "Gemini API key is invalid or expired. Please check GEMINI_API_KEY in your .env file."
        );
      }

      if (isQuota || is404) {
        console.warn(`⚠️  [Gemini] ${modelName} unavailable (${isQuota ? "quota" : "not found"}) — trying next model...`);
        continue;
      }

      // Unknown error — fail immediately
      console.error(`❌ [Gemini] Unexpected error on ${modelName}: ${msg}`);
      throw err;
    }
  }

  throw new ApiError(
    429,
    "All Gemini models are currently quota-limited. Please wait a few minutes and try again."
  );
};

/**
 * Safely parse a string that may be wrapped in markdown code fences.
 * Gemini sometimes wraps JSON in ```json ... ``` — this strips those out.
 *
 * @param {string} raw - Raw response text from Gemini
 * @returns {Object} Parsed JavaScript object
 */
const safeParseJson = (raw) => {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new ApiError(
      500,
      `Gemini returned malformed JSON. Parse error: ${e.message}. Raw (first 300 chars): ${cleaned.substring(0, 300)}`
    );
  }
};

const AiService = {

  /**
   * parseTravelData
   * ─────────────────────────────────────────────────────────────
   * Sends OCR-extracted text to Gemini and returns structured travel JSON.
   * This is the reusable core parsing function for the upload pipeline.
   *
   * Architecture:
   *   OCR Text → Gemini (gemini-1.5-flash) → Structured JSON → MongoDB
   *
   * @param {string} rawText - Raw text extracted by OCR from the travel document
   * @returns {Object} Structured travel data object
   */
  parseTravelData: async (rawText) => {
    const prompt = `
You are a travel document parser. Extract structured information from the OCR text below.

STRICT RULES:
- Return ONLY a valid JSON object.
- No markdown, no code fences, no explanation, no extra text.
- If a field is not present, set its value to null.
- All dates must be in YYYY-MM-DD format.
- The response must be directly parseable by JSON.parse().

FIELDS TO EXTRACT:
{
  "passengerName": "Full name of the traveler",
  "flightNumber": "Flight or train number",
  "airline": "Airline or carrier name",
  "departureCity": "City of departure",
  "arrivalCity": "City of destination",
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD or null",
  "seatNumber": "Seat or berth number",
  "travelClass": "Economy / Business / First etc.",
  "bookingReference": "PNR or booking confirmation number",
  "hotelName": "Hotel name if mentioned",
  "hotelCheckIn": "YYYY-MM-DD or null",
  "hotelCheckOut": "YYYY-MM-DD or null",
  "totalAmount": "Total fare or cost as string",
  "currency": "Currency code e.g. INR, USD",
  "documentType": "FLIGHT_TICKET | HOTEL_BOOKING | TRAIN_TICKET | TRAVEL_INVOICE | OTHER",
  "additionalInfo": {}
}

OCR TEXT:
${rawText}

JSON:`;

    try {
      const responseText = await callGemini(prompt);
      const structured   = safeParseJson(responseText);
      return structured;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error("❌ [Gemini] parseTravelData failed:", err.message);
      throw new ApiError(502, `Gemini AI parsing failed: ${err.message}`);
    }
  },

  /**
   * generateItinerary
   * ─────────────────────────────────────────────────────────────
   * Takes the structured travel JSON and generates a day-by-day itinerary.
   *
   * Architecture:
   *   Structured JSON → Gemini → Formatted Itinerary String → MongoDB
   *
   * @param {Object} structuredData - Parsed travel data from parseTravelData()
   * @returns {string} Formatted itinerary text (markdown)
   */
  generateItinerary: async (structuredData) => {
    const prompt = `
You are an expert travel planner. Generate a detailed, friendly, day-by-day travel itinerary based on the structured booking data below.

INSTRUCTIONS:
- Format clearly with Day 1, Day 2, etc.
- Include check-in/check-out times, flight times where available.
- Add 2-3 practical travel tips per day.
- Use clear markdown formatting (bold headings, bullet points).
- STRICT RULE: Do NOT include any introductory or concluding conversational filler (e.g., "Have a fantastic trip!", "Here is your itinerary:", "Feel free to ask..."). Output ONLY the markdown itinerary itself.

TRAVEL DATA:
${JSON.stringify(structuredData, null, 2)}

ITINERARY:`;

    try {
      const itinerary = await callGemini(prompt);
      if (!itinerary) {
        throw new ApiError(500, "Gemini returned an empty itinerary response.");
      }
      return itinerary;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error("❌ [Gemini] generateItinerary failed:", err.message);
      throw new ApiError(502, `Gemini AI itinerary generation failed: ${err.message}`);
    }
  },

};

module.exports = AiService;
