import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

/* =========================
CONFIG
========================= */

dotenv.config();

/* =========================
DATABASE
========================= */

connectDB();

/* =========================
APP
========================= */

const app = express();

/* =========================
MIDDLEWARE
========================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));

/* =========================
STATIC UPLOADS
========================= */

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

/* =========================
FRONTEND STATIC ASSETS
========================= */

const frontendDir = path.join(process.cwd(), "frontend");
app.use(express.static(frontendDir));
app.use("/frontend", express.static(frontendDir));

/* =========================
API HEALTH ROUTE
========================= */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "HAMBAK TECH & SERVICES API"
  });
});

/* =========================
API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);

/* =========================
DATABASE & ERROR MIDDLEWARE
========================= */

app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    err.name === "MongooseServerSelectionError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.warn("[AI Studio] Database offline — returning mock response");
    if (req.method === "GET") {
      return res.json(
        req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {}
      );
    }
    return res
      .status(503)
      .json({ error: "Service temporarily unavailable (database offline)" });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

/* =========================
404 FOR UNMATCHED API
========================= */

app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

/* =========================
FALLBACK TO FRONTEND
========================= */

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

/* =========================
SERVER
========================= */

const PORT = 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`HAMBAK TECH & SERVICES server running on http://${HOST}:${PORT}`);
});

export default app;
