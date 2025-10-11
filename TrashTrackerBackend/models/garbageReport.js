// models/GarbageReport.js - Example
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    address: { type: String, required: true },
    imageUrl: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'completed', 'failed'],
        default: 'pending'
    },
    estimatedCompletionTime: { type: Date, default: null }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// CRITICAL INDEX FOR SCALABILITY
// Indexing the creation date makes the paginated reports query (getMunicipalReports) much faster.
reportSchema.index({ createdAt: -1 }); 

const GarbageReport = mongoose.model('GarbageReport', reportSchema);
export default GarbageReport;