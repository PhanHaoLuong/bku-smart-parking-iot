import express from "express";

import { getLatestEvents, postIotEvents } from "../controllers/event.controller.js";
import { requireRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post('/events', requireRole('operator', 'admin'), postIotEvents);
//Uses polling for periodic updates
//In a real implementation, can switch to WebSocket or Server-Sent Events for real-time updates
router.get('/events', requireRole('operator', 'admin', 'finance'), getLatestEvents);

export default router;