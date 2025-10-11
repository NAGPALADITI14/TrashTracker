// routes/reportRoutes.js
import express from 'express';
import { createGarbageReport, updateReportStatus, deleteReport } from '../controllers/reportController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/garbage-report', authenticateToken, createGarbageReport);

// These operations require authentication and municipal committee role
router.put('/garbage-report/:id/status', authenticateToken, authorizeRoles(['committee']), updateReportStatus);
router.delete('/garbage-report/:id', authenticateToken, authorizeRoles(['committee']), deleteReport); 

export default router;
