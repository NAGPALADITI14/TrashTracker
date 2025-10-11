// routes/municipalRoutes.js
import express from 'express';
import { getMunicipalReports } from '../controllers/municipalController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Optimized route for fetching reports with pagination
router.get('/reports', authenticateToken, authorizeRoles(['committee']), getMunicipalReports);

export default router;
