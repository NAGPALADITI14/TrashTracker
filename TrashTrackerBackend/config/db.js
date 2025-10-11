// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        console.error("FATAL ERROR: MONGODB_URI is not defined in .env");
        process.exit(1);
    }
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
