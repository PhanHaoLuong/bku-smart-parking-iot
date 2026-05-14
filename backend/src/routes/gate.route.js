import express from 'express';
import { listGates, getGate, controlGate } from '../controllers/gate.controller.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', requireRole('operator'), listGates);
router.get('/:gateId', requireRole('operator'), getGate);
router.patch('/:gateId/control', requireRole('operator'), controlGate);

export default router;
