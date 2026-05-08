import express from 'express';
import { getParkingHistory } from '../controllers/parkinghistory.controller.js';
import { protectedRoute } from '../middlewares/protectedroute.js';

const router = express.Router();

router.get('/', protectedRoute, getParkingHistory);
router.get('/:id', protectedRoute, getParkingHistory);

export default router;