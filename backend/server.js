require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { configureCloudinary } = require("./src/config/cloudinary");

const PORT = process.env.PORT || 3000;

/**
 * Server startup sequence:
 * 1. Connect to MongoDB
 * 2. Configure Cloudinary
 * 3. Initialize Gemini client
 * 4. Start Express server
 *
 * The app only starts listening AFTER all critical services are connected.
 * This prevents the server from accepting requests before the DB is ready.
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Configure Cloudinary
    configureCloudinary();

    // 3. (Gemini client is initialized in its own config file)
    
    // 4. Start listening
    app.listen(PORT, () => {
      console.log(`
🚀 ====================================
   Travel Booking Assistant API
   Status:  Running
   Port:    ${PORT}
   Env:     ${process.env.NODE_ENV || "development"}
   URL:     http://localhost:${PORT}/api/health
====================================
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions globally
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();
