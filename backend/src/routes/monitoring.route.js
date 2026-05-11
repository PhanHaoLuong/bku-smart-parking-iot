import express from 'express';
import {
  getSummary,
  getSlots,
  getActiveVehicles,
} from '../controllers/monitoring.controller.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/summary', requireRole('operator', 'finance'), getSummary);
router.get('/slots', requireRole('operator', 'finance'), getSlots);
router.get('/active-vehicles', requireRole('operator', 'finance'), getActiveVehicles);

export default router;
