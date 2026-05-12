import express from 'express';
import SlotState from '../models/slotstate.model.js';

const router = express.Router();

// PATCH /apiv1/demo/slot/:iotId - Update single slot status
// Body: { status: 'free' | 'occupied' }
router.patch('/slot/:iotId', async (req, res) => {
  try {
    const { iotId } = req.params;
    const { status } = req.body;

    if (!['free', 'occupied'].includes(status)) {
      return res.status(400).json({ error: 'Status must be free or occupied' });
    }

    const slot = await SlotState.findOneAndUpdate(
      { iotId },
      { status, lastChangeTime: new Date(), updatedAt: new Date() },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /apiv1/demo/lot/:lotId - Update all slots in a lot
// Body: { status: 'free' | 'occupied', count?: number }
// If count provided, update only that many slots (for demo purposes)
router.patch('/lot/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    const { status, count } = req.body;

    if (!['free', 'occupied'].includes(status)) {
      return res.status(400).json({ error: 'Status must be free or occupied' });
    }

    const filter = { iotId: { $regex: `^iot-${lotId}` } };

    let result;
    if (count !== undefined) {
      // Get slots and update only the first 'count' slots
      const slots = await SlotState.find(filter).sort({ slotId: 1 }).limit(count);
      const iotIds = slots.map(s => s.iotId);

      result = await SlotState.updateMany(
        { iotId: { $in: iotIds } },
        { status, lastChangeTime: new Date(), updatedAt: new Date() }
      );
    } else {
      // Update all slots in the lot
      result = await SlotState.updateMany(
        filter,
        { status, lastChangeTime: new Date(), updatedAt: new Date() }
      );
    }

    res.json({
      success: true,
      data: {
        lotId,
        status,
        updatedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /apiv1/demo/slots/:lotId - View current slots in a lot
router.get('/slots/:lotId', async (req, res) => {
  try {
    const { lotId } = req.params;
    const slots = await SlotState.find({ iotId: { $regex: `^iot-${lotId}` } })
      .sort({ slotId: 1 })
      .lean();

    const summary = {
      lotId,
      total: slots.length,
      occupied: slots.filter(s => s.status === 'occupied').length,
      free: slots.filter(s => s.status === 'free').length,
      slots: slots.map(s => ({ iotId: s.iotId, status: s.status }))
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;