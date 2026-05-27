const WorkflowService = require("../services/workflow.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

/**
 * UploadController
 * Receives the uploaded file from the request and triggers the full processing pipeline.
 */

/**
 * @route   POST /api/upload
 * @desc    Upload a travel document and trigger the OCR + AI processing pipeline
 * @access  Protected
 */
const uploadDocument = asyncHandler(async (req, res) => {
  // req.file is populated by the uploadSingle middleware
  // req.user is populated by the protect middleware
  const file = req.file;
  const userId = req.user._id;

  const processedTrip = await WorkflowService.processDocument(file, userId);

  res.status(201).json(
    new ApiResponse(
      201,
      { trip: processedTrip },
      "Document uploaded and processed successfully."
    )
  );
});

module.exports = { uploadDocument };
