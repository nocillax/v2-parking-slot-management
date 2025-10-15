import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "#config/database.js";
import cookieParser from "cookie-parser";
import "#models/index.js";

// Import routes
import apiRoutes from "#api/index.js";
import { errorHandler } from "#src/middleware/error.middleware.js";

const { PORT, NODE_ENV } = process.env;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure req.body is an object for GET requests
app.use((req, res, next) => {
  if (req.method === "GET" && !req.body) {
    req.body = {};
  }
  next();
});

// Basic health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Parking Management API is running",
    environment: NODE_ENV,
  });
});

// API Routes
app.use("/api/v1", apiRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database first
    await initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
