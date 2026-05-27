const axios = require("axios");
const FormData = require("form-data");
const ApiError = require("../utils/ApiError");

const OCR_SPACE_API_URL = "https://api.ocr.space/parse/image";

/**
 * OcrService
 * Handles text extraction from documents using the OCR.Space API.
 * This service is completely independent of the AI layer.
 */
const OcrService = {
  /**
   * Extracts text from a document using its URL (e.g., Cloudinary URL).
   * OCR.Space accepts a public URL directly, so no re-uploading needed.
   *
   * @param {string} fileUrl - The publicly accessible URL of the file (Cloudinary URL).
   * @param {string} mimeType - Used to determine if it's a PDF or image.
   * @returns {string} The raw extracted text from the document.
   */
  extractTextFromUrl: async (fileUrl, mimeType) => {
    try {
      const formData = new FormData();
      formData.append("url", fileUrl);
      formData.append("apikey", process.env.OCR_SPACE_API_KEY);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      formData.append("detectOrientation", "true");
      formData.append("scale", "true");
      formData.append("OCREngine", "2"); // Engine 2 is more accurate for complex documents

      // Enable PDF-specific parsing if the document is a PDF
      if (mimeType === "application/pdf") {
        formData.append("isCreateSearchablePdf", "false");
        formData.append("isSearchablePdfHideTextLayer", "false");
      }

      const response = await axios.post(OCR_SPACE_API_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 second timeout for OCR processing
      });

      const data = response.data;

      // Validate OCR.Space API response structure
      if (!data || data.IsErroredOnProcessing) {
        const errMsg = data?.ErrorMessage?.[0] || "OCR processing failed.";
        throw new ApiError(502, `OCR Service Error: ${errMsg}`);
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        throw new ApiError(422, "OCR could not extract any text from the document.");
      }

      // Concatenate text from all parsed pages
      const extractedText = data.ParsedResults.map(
        (result) => result.ParsedText
      )
        .join("\n")
        .trim();

      if (!extractedText) {
        throw new ApiError(
          422,
          "OCR returned empty text. The document may be a scanned image with no readable content."
        );
      }

      return extractedText;
    } catch (error) {
      // Re-throw ApiErrors, wrap everything else
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        502,
        `Failed to connect to OCR service: ${error.message}`
      );
    }
  },
};

module.exports = OcrService;
