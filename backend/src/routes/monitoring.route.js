import express from 'express';
import {
  getSummary,
  getSlots,
  getActiveVehicles,
} from '../controllers/monitoring.controller.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/summary', requireRole('operator', 'admin', 'finance'), getSummary);
router.get('/slots', requireRole('operator', 'admin', 'finance'), getSlots);
router.get('/active-vehicles', requireRole('operator', 'admin', 'finance'), getActiveVehicles);

export default router;
