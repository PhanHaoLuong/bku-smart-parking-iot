import express from "express";

import { getLatestEvents, postIotEvents } from "../controllers/event.controller.js";

const router = express.Router();

router.post('/events', postIotEvents);
//Uses polling for periodic updates
//In a real implementation, can switch to WebSocket or Server-Sent Events for real-time updates
router.get('/events', getLatestEvents);

export default router;