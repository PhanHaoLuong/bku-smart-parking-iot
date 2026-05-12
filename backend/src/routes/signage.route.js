import express from 'express';
import { getSignageStatus } from '../controllers/signage.controller.js';

const router = express.Router();

// GET /apiv1/signage/status - returns array of all lots
router.get('/status', getSignageStatus);

// GET /apiv1/signage/status/:lotId - returns single lot status
router.get('/status/:lotId', getSignageStatus);

export default router;