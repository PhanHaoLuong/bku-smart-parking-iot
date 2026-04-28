import express from 'express';
import {
  getSummary,
  getSlots,
  getActiveVehicles,
} from '../controllers/monitoring.controller.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/slots', getSlots);
router.get('/active-vehicles', getActiveVehicles);

export default router;
