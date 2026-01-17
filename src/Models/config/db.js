import mongoose from 'mongoose';
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return; 

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;