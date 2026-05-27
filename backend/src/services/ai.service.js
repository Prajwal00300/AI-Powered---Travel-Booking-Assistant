const { getGeminiClient } = require("../config/gemini");
const ApiError = require("../utils/ApiError");

const MODEL_NAME = "gemini-1.5-flash";

/**
 * AiService
 * Handles all communication with the Google Gemini API.
 * Two distinct responsibilities:
 *  1. parseOcrTextToJson - Convert raw OCR text to structured JSON
 *  2. generateItinerary   - Generate travel itinerary from structured data
 */
const AiService = {
  /**
   * Parses raw OCR text into a structured JSON object using Gemini.
   * Uses a strict prompt to ensure deterministic, parseable output.
   *
   * @param {string} rawText - The raw extracted text from OCR.
   * @returns {Object} Structured travel data as a JavaScript object.
   */
  parseOcrTextToJson: async (rawText) => {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
You are a travel document parser. Your task is to extract structured information from the following raw OCR text extracted from a travel document.

IMPORTANT INSTRUCTIONS:
- Return ONLY a valid JSON object. No markdown, no code blocks, no explanation, no comments.
- If a field is not found in the text, set its value to null.
- Dates should be in YYYY-MM-DD format.
- The JSON must be parseable by JSON.parse().

Extract the following fields if available:
- passengerName (string): Full name of the passenger/traveler
- flightNumber (string): Flight/train/bus number
- departureCity (string): City of departure
- arrivalCity (string): City of arrival/destination
- departureDate (string): Date of departure (YYYY-MM-DD)
- returnDate (string): Return date if available (YYYY-MM-DD)
- hotelName (string): Name of the hotel if mentioned
- hotelCheckIn (string): Hotel check-in date (YYYY-MM-DD)
- hotelCheckOut (string): Hotel check-out date (YYYY-MM-DD)
- bookingReference (string): Any booking/PNR/confirmation number
- airline (string): Airline or transport company name
- seatNumber (string): Seat or berth number
- travelClass (string): Class of travel (Economy, Business, etc.)
- totalAmount (string): Total fare/cost if mentioned
- currency (string): Currency code (INR, USD, etc.)
- documentType (string): Type of document (FLIGHT_TICKET, HOTEL_BOOKING, TRAIN_TICKET, TRAVEL_INVOICE, OTHER)
- additionalInfo (object): Any other important travel information

RAW OCR TEXT:
${rawText}

JSON RESPONSE:`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      // Sanitize response: Remove potential markdown code blocks
      const cleanedJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsedData;
      try {
        parsedData = JSON.parse(cleanedJson);
      } catch (parseError) {
        throw new ApiError(
          500,
          `Gemini returned malformed JSON: ${parseError.message}. Raw response: ${cleanedJson.substring(0, 200)}`
        );
      }

      return parsedData;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        502,
        `Gemini AI parsing failed: ${error.message}`
      );
    }
  },

  /**
   * Generates a detailed travel itinerary from structured travel data.
   *
   * @param {Object} structuredData - The parsed travel data JSON object.
   * @returns {string} A well-formatted markdown itinerary.
   */
  generateItinerary: async (structuredData) => {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
You are an expert travel planner. Based on the following structured travel data extracted from a booking document, generate a detailed, friendly, and organized travel itinerary.

INSTRUCTIONS:
- Format the itinerary clearly with Day 1, Day 2, etc.
- Include specific times where possible (based on flight/check-in info).
- Add helpful travel tips for each day.
- Be specific about the destination city.
- If hotel information is available, include check-in/check-out details.
- Keep the tone warm and helpful.
- Use markdown formatting (headers, bullet points, bold text).

STRUCTURED TRAVEL DATA:
${JSON.stringify(structuredData, null, 2)}

Generate the travel itinerary:`;

    try {
      const result = await model.generateContent(prompt);
      const itinerary = result.response.text().trim();

      if (!itinerary) {
        throw new ApiError(500, "Gemini returned an empty itinerary.");
      }

      return itinerary;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        502,
        `Gemini AI itinerary generation failed: ${error.message}`
      );
    }
  },
};

module.exports = AiService;
