const UploadService = require("./upload.service");
const OcrService = require("./ocr.service");
const AiService = require("./ai.service");
const TripService = require("./trip.service");
const ApiError = require("../utils/ApiError");


const WorkflowService = {
  /**
  
   *
   * @param {Object} file - Multer file object (buffer, mimetype, originalname)
   * @param {string} userId - The authenticated user's MongoDB ObjectId
   * @returns {Object} The fully processed Trip document
   */
  processDocument: async (file, userId) => {
    const documentType =
      file.mimetype === "application/pdf" ? "PDF" : "IMAGE";

    // --- Step 1: Upload to Cloudinary ---
    console.log(`📤 [Workflow] Step 1: Uploading to Cloudinary...`);
    let cloudinaryResult;
    try {
      cloudinaryResult = await UploadService.uploadToCloudinary(
        file.buffer,
        file.originalname,
        file.mimetype
      );
    } catch (error) {
      throw new ApiError(500, `Upload failed: ${error.message}`);
    }

    // --- Step 2: Create initial Trip record in DB ---
    console.log(`💾 [Workflow] Step 2: Creating initial trip record...`);
    const trip = await TripService.createTrip({
      userId,
      originalFileName: file.originalname,
      cloudinaryUrl: cloudinaryResult.cloudinaryUrl,
      cloudinaryPublicId: cloudinaryResult.cloudinaryPublicId,
      documentType,
      processingStatus: "processing",
    });

    try {

      console.log(`🔍 [Workflow] Step 3: Extracting text via OCR...`);
      const rawText = await OcrService.extractTextFromUrl(
        cloudinaryResult.cloudinaryUrl,
        file.mimetype
      );

      console.log(`🤖 [Workflow] Step 4: Parsing OCR text with Gemini AI...`);
      const structuredData = await AiService.parseTravelData(rawText);

      console.log(`✈️  [Workflow] Step 5: Generating itinerary with Gemini AI...`);
      const itinerary = await AiService.generateItinerary(structuredData);

      console.log(`✅ [Workflow] Step 6: Saving results to database...`);
      const updatedTrip = await TripService.updateTrip(trip._id, {
        extractedRawText: rawText,
        extractedStructuredData: structuredData,
        generatedItinerary: itinerary,
        processingStatus: "completed",
      });

      console.log(`🎉 [Workflow] Document processing complete for trip: ${trip._id}`);
      return updatedTrip;
    } catch (processingError) {

      console.error(`❌ [Workflow] Processing failed: ${processingError.message}`);
      await TripService.updateTrip(trip._id, {
        processingStatus: "failed",
        processingError: processingError.message,
      });

      throw new ApiError(
        500,
        `Document uploaded but processing failed: ${processingError.message}`
      );
    }
  },
};

module.exports = WorkflowService;
