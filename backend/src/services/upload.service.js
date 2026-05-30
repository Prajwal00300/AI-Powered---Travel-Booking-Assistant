const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const ApiError = require("../utils/ApiError");


const UploadService = {
  /**
   
   *
   * @param {Buffer} fileBuffer - The file buffer from Multer's memory storage.
   * @param {string} originalName - Original file name for reference.
   * @param {string} mimeType - The MIME type of the file (e.g. image/jpeg, application/pdf).
   * @returns {Object} { cloudinaryUrl, cloudinaryPublicId }
   */
  uploadToCloudinary: (fileBuffer, originalName, mimeType) => {
    return new Promise((resolve, reject) => {
      // Determine the Cloudinary resource type
      const resourceType = mimeType === "application/pdf" ? "raw" : "image";

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "travel-booking-assistant",
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            reject(
              new ApiError(
                500,
                `Cloudinary upload failed: ${error.message}`
              )
            );
          } else {
            resolve({
              cloudinaryUrl: result.secure_url,
              cloudinaryPublicId: result.public_id,
            });
          }
        }
      );

      // Pipe the buffer into the upload stream
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  },

  /**
  
   *
   * @param {string} publicId - The Cloudinary public ID of the file.
   * @param {string} mimeType - Used to determine resource_type for deletion.
   */
  deleteFromCloudinary: async (publicId, resourceType = "image") => {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      console.error(`⚠️ Cloudinary deletion failed for ${publicId}: ${error.message}`);
    }
  },
};

module.exports = UploadService;
