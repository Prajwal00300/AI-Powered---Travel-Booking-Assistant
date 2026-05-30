const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Route imports
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const tripRoutes = require("./routes/trip.routes");

// Middleware imports
const { errorHandler, notFound } = require("./middlewares/error.middleware");

const app = express();



// Set secure HTTP headers
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use(globalLimiter);

// Stricter rate limit for auth routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
});


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logging (dev only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}



// Health check endpoint (no auth needed)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Travel Booking Assistant API is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/trips", tripRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;
