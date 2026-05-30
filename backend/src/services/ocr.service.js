const axios = require("axios");
const FormData = require("form-data");
const ApiError = require("../utils/ApiError");

const OCR_SPACE_API_URL = "https://api.ocr.space/parse/image";


const OcrService = {
  /**
 
   *
   * @param {string} fileUrl 
   * @param {string} mimeType 
   * @returns {string} 
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
      formData.append("OCREngine", "1");

      if (mimeType === "application/pdf") {
        formData.append("filetype", "PDF");
        formData.append("isCreateSearchablePdf", "false");
        formData.append("isSearchablePdfHideTextLayer", "false");
      }

      const response = await axios.post(OCR_SPACE_API_URL, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000,
      });

      const data = response.data;

      if (!data || data.IsErroredOnProcessing) {
        const errMsg = data?.ErrorMessage?.[0] || "OCR processing failed.";
        throw new ApiError(502, `OCR Service Error: ${errMsg}`);
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        throw new ApiError(422, "OCR could not extract any text from the document.");
      }

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
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        502,
        `Failed to connect to OCR service: ${error.message}`
      );
    }
  },
};

module.exports = OcrService;
