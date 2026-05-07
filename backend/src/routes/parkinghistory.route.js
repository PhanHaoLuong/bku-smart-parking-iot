import express from 'express';
import { getParkingHistory } from '../controllers/parkinghistory.controller.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', requireRole('operator', 'admin', 'finance'), getParkingHistory);
router.get('/:id', requireRole('learner', 'faculty', 'operator', 'admin', 'finance'), getParkingHistory);

export default router;