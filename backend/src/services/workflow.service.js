const UploadService = require("./upload.service");
const OcrService = require("./ocr.service");
const AiService = require("./ai.service");
const TripService = require("./trip.service");
const ApiError = require("../utils/ApiError");

/**
 * WorkflowService
 * The master orchestrator for the document processing pipeline.
 *
 * Sequence:
 * 1. Upload file to Cloudinary
 * 2. Save initial Trip record (status: processing)
 * 3. Run OCR on the Cloudinary URL
 * 4. Parse OCR text with Gemini AI
 * 5. Generate itinerary with Gemini AI
 * 6. Update the Trip record with all results (status: completed)
 *
 * If any step fails, the Trip is updated with status: failed and the error message.
 */
const WorkflowService = {
  /**
   * Processes a travel document through the full pipeline.
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

    // --- Step 3, 4, 5: OCR + AI Parsing + Itinerary (with error recovery) ---
    try {
      // Step 3: OCR
      console.log(`🔍 [Workflow] Step 3: Extracting text via OCR...`);
      const rawText = await OcrService.extractTextFromUrl(
        cloudinaryResult.cloudinaryUrl,
        file.mimetype
      );

      // Step 4: AI Parsing
      console.log(`🤖 [Workflow] Step 4: Parsing OCR text with Gemini AI...`);
      const structuredData = await AiService.parseTravelData(rawText);

      // Step 5: Itinerary Generation
      console.log(`✈️  [Workflow] Step 5: Generating itinerary with Gemini AI...`);
      const itinerary = await AiService.generateItinerary(structuredData);

      // --- Step 6: Update Trip with all results ---
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
      // If any processing step fails, mark the trip as failed (don't delete it)
      // The user can see the uploaded document even if AI processing failed
      console.error(`❌ [Workflow] Processing failed: ${processingError.message}`);
      await TripService.updateTrip(trip._id, {
        processingStatus: "failed",
        processingError: processingError.message,
      });

      // Re-throw so the controller can send an appropriate response
      throw new ApiError(
        500,
        `Document uploaded but processing failed: ${processingError.message}`
      );
    }
  },
};

module.exports = WorkflowService;
