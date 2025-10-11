// server.js - Main Entry Point for the Scalable API

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Modular Imports
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import municipalRoutes from './routes/municipalRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// --- 1. Database Connection ---
connectDB();

// --- 2. Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 3. Static File Serving ---
// CRITICAL: Makes files in the 'uploads' directory accessible via /uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); 

// --- 4. Routes ---
app.use('/api', authRoutes);
app.use('/api', reportRoutes);
app.use('/api/municipal', municipalRoutes);

// Root Route
app.get("/", (req, res) => {
    res.send("TrashTracker API Server is operational.");
});

// --- 5. Server Start ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`API Server is running on port ${PORT}`);
});
