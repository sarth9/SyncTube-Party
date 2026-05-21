import mongoose from "mongoose";

export async function connectDatabase(mongodbUri: string): Promise<void> {
  try {
    await mongoose.connect(mongodbUri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}