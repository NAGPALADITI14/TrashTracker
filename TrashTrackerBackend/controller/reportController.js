// controllers/reportController.js
import GarbageReport from '../models/garbageReport.js';
import { upload } from '../services/uploadService.js';
import { sendReportEmail } from '../services/emailService.js';
import fs from 'fs';
import path from 'path';

const reportUpload = upload.single('image');

/**
 * Handles garbage report creation. The email task is non-blocking 
 * to ensure a fast response to the user.
 */
export const createGarbageReport = (req, res) => {
    reportUpload(req, res, async (err) => {
        if (err || !req.file) {
            const msg = err && err.message ? err.message : 'Image upload failed. Check file type and size.';
            return res.status(400).json({ message: msg });
        }
        
        let report; 
        try {
            const userId = req.user ? req.user.id : 'anonymous_user_id'; 
            
            const { latitude, longitude, address, receiverEmail } = req.body;
            const location = { latitude, longitude };
            const imageUrl = `/uploads/${req.file.filename}`;

            report = new GarbageReport({ userId, location, address, imageUrl });
            await report.save();

            // 1. Send IMMEDIATE success response to the client (FAST RESPONSE)
            res.status(200).json({ 
                message: 'Report received and saved. Processing notification in background.',
                reportId: report._id
            });

            // 2. Execute non-blocking task (Email) AFTER sending response
            const reportData = { latitude, longitude, address, receiverEmail, reportId: report._id };
            sendReportEmail(reportData, req.file.filename).catch(e => console.error("Email send background failure:", e));

        } catch (error) {
            console.error('Error saving garbage report:', error);
            // Clean up file if database saving fails
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) console.error('Error cleaning up file:', unlinkErr);
            });
            return res.status(500).json({ message: 'Error submitting report due to server error.' });
        }
    });
};


export const updateReportStatus = async (req, res) => {
    const { id } = req.params;
    const { status, estimatedCompletionTime } = req.body;
    try {
        // Use .lean() for faster query since we don't need Mongoose Document methods
        const report = await GarbageReport.findByIdAndUpdate(
            id, 
            { status, estimatedCompletionTime }, 
            { new: true }
        ).lean(); 

        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: 'Error updating report status' });
    }
};

export const deleteReport = async (req, res) => {
    const reportId = req.params.id;
    try {
        const result = await GarbageReport.findByIdAndDelete(reportId);
        
        if (result) {
            // Cleanup the file for disk space optimization
            const imagePath = path.join(process.cwd(), 'uploads', path.basename(result.imageUrl));
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting image file:', err);
            });
            
            res.status(200).json({ message: 'Report deleted successfully' });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during deletion' });
    }
};
