import mongoose from "mongoose";

/* =========================
DATABASE CONNECTION
========================= */

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.warn("Notice: MONGO_URI / MONGODB_URI environment variable is not defined.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

export default connectDB;
