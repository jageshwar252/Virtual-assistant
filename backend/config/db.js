import mongoose from "mongoose";

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    return false;
  }
};

export default connectdb;
