import "dotenv/config";
import express from "express";
import cors from "cors";
import { initializeDatabase } from "./config/database.js";
import "./models/index.js";

const { PORT, NODE_ENV } = process.env;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Parking Management API is running",
    environment: NODE_ENV,
  });
});

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
