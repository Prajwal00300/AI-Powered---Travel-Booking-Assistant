const { GoogleGenerativeAI } = require("@google/generative-ai");

let geminiClient = null;

/**
 * Returns a singleton instance of the Google Generative AI client.
 * Initializes on first call using the API key from environment variables.
 */
const getGeminiClient = () => {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini AI Client Initialized");
  }
  return geminiClient;
};

module.exports = { getGeminiClient };
