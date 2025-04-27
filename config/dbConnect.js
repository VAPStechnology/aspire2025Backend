import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
    });
    console.log(`MongoDB Connected Successfully!!!!!!!: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;