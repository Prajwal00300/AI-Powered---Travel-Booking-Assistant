const UploadService = require("./upload.service");
const OcrService = require("./ocr.service");
const AiService = require("./ai.service");
const TripService = require("./trip.service");
const ApiError = require("../utils/ApiError");


const WorkflowService = {
  /**
   * Processes multiple documents uploaded together
   * @param {Array} files - Array of Multer file objects
   * @param {string} userId - The authenticated user's MongoDB ObjectId
   * @returns {Object} The fully processed Trip document
   */
  processDocuments: async (files, userId) => {
    console.log(`📤 [Workflow] Step 1: Uploading ${files.length} document(s) to Cloudinary...`);
    
    let fileReferences;
    try {
      fileReferences = await Promise.all(
        files.map(async (file) => {
          const docType = file.mimetype === "application/pdf" ? "PDF" : "IMAGE";
          const result = await UploadService.uploadToCloudinary(
            file.buffer,
            file.originalname,
            file.mimetype
          );
          return {
            originalFileName: file.originalname,
            cloudinaryUrl: result.cloudinaryUrl,
            cloudinaryPublicId: result.cloudinaryPublicId,
            documentType: docType,
          };
        })
      );
    } catch (error) {
      throw new ApiError(500, `Upload failed: ${error.message}`);
    }

    console.log(`💾 [Workflow] Step 2: Creating initial trip record...`);
    const documentType = files.length > 1 ? "MULTIPLE" : fileReferences[0].documentType;
    const trip = await TripService.createTrip({
      userId,
      documentType,
      fileReferences,
      processingStatus: "processing",
    });

    try {
      console.log(`🔍 [Workflow] Step 3: Extracting text via OCR for all documents...`);
      const extractedTexts = await Promise.all(
        fileReferences.map(async (ref, index) => {
          const originalMimetype = files[index].mimetype;
          return await OcrService.extractTextFromUrl(ref.cloudinaryUrl, originalMimetype);
        })
      );

      const mergedRawText = extractedTexts.join("\n\n--- NEXT DOCUMENT ---\n\n");

      console.log(`🤖 [Workflow] Step 4: Parsing OCR text with Gemini AI...`);
      const structuredData = await AiService.parseTravelData(mergedRawText);

      console.log(`✈️  [Workflow] Step 5: Generating itinerary with Gemini AI...`);
      const itinerary = await AiService.generateItinerary(structuredData);

      console.log(`✅ [Workflow] Step 6: Saving results to database...`);
      const updatedTrip = await TripService.updateTrip(trip._id, {
        extractedRawText: mergedRawText,
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
        `Documents uploaded but processing failed: ${processingError.message}`
      );
    }
  },

  /**
   * Processes manually entered trip data
   * @param {Object} manualData - Data entered by the user
   * @param {string} userId - User ID
   * @returns {Object} Processed trip document
   */
  processManualEntry: async (manualData, userId) => {
    const structuredData = {
      ...manualData,
      documentType: manualData.documentType || "OTHER",
    };

    console.log(`💾 [Workflow] Creating initial manual trip record...`);
    const trip = await TripService.createTrip({
      userId,
      originalFileName: "Manual Entry",
      cloudinaryUrl: "",
      cloudinaryPublicId: "",
      documentType: "MANUAL",
      processingStatus: "processing",
    });

    try {
      console.log(`✈️  [Workflow] Generating itinerary with Gemini AI from manual data...`);
      const itinerary = await AiService.generateItinerary(structuredData);

      console.log(`✅ [Workflow] Saving results to database...`);
      const updatedTrip = await TripService.updateTrip(trip._id, {
        extractedRawText: "Manual Entry Data",
        extractedStructuredData: structuredData,
        generatedItinerary: itinerary,
        processingStatus: "completed",
      });

      console.log(`🎉 [Workflow] Manual processing complete for trip: ${trip._id}`);
      return updatedTrip;
    } catch (processingError) {
      console.error(`❌ [Workflow] Processing failed: ${processingError.message}`);
      await TripService.updateTrip(trip._id, {
        processingStatus: "failed",
        processingError: processingError.message,
      });

      throw new ApiError(
        500,
        `Manual trip created but itinerary generation failed: ${processingError.message}`
      );
    }
  },
};

module.exports = WorkflowService;
