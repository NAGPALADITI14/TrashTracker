// controllers/municipalController.js
import GarbageReport from '../models/garbageReport.js';

/**
 * Fetches reports with pagination, crucial for dashboard performance.
 */
export const getMunicipalReports = async (req, res) => {
    try {
        // Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 
        const skip = (page - 1) * limit;

        // Fetch reports and total count concurrently using Promise.all
        const [reports, totalReports] = await Promise.all([
            GarbageReport.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(), // Use .lean() for faster read operations
            GarbageReport.countDocuments({})
        ]);

        res.json({
            reports,
            totalPages: Math.ceil(totalReports / limit),
            currentPage: page,
            totalCount: totalReports
        });

    } catch (error) {
        console.error('Error fetching municipal reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};
