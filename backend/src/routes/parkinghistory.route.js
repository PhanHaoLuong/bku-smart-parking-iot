import express from 'express';
import { getParkingHistory } from '../controllers/parkinghistory.controller.js';
import { protectedRoute, requireAdminOrOperator } from '../middlewares/protectedroute.js';

const router = express.Router();

router.get('/', requireAdminOrOperator, getParkingHistory);
router.get('/:id', protectedRoute, getParkingHistory);

export default router;