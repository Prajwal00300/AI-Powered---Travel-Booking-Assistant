const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

/**
 * Official Google Generative AI client instance.
 * Authenticated using GEMINI_API_KEY via new GoogleGenerativeAI(apiKey).
 * This is the ONLY place Gemini authentication happens in the entire backend.
 * No OAuth, no Bearer tokens, no axios — SDK handles everything internally.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = genAI;
