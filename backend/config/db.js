import mongoose from "mongoose";

/* =========================
DATABASE CONNECTION
========================= */

let isConnected = false;

const connectDB = async () => {
  // CRITICAL: fail fast, don't hang
  mongoose.set("bufferCommands", false);
  mongoose.set("strictQuery", false);

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[AI Studio] MONGO_URI not configured — in-memory fallback active");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(
      `MongoDB Connected Successfully: ${conn.connection.host}`
    );
  } catch (error) {
    console.warn(
      `[AI Studio] MongoDB connection offline (${error.message}) — in-memory fallback active`
    );
  }
};

export const isDbConnected = () => isConnected;
export default connectDB;
