import express from 'express';
import { getParkingHistory } from '../controllers/parkinghistory.controller.js';

const router = express.Router();

router.get('/', getParkingHistory);
router.get('/:id', getParkingHistory);

export default router;