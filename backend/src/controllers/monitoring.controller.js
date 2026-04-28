import {
  getMonitoringSummary,
  getMonitoringSlots,
  getActiveParkingSessions,
} from '../utils/monitoring.util.js';

export async function getSummary(req, res) {
  try {
    const { lotId } = req.query;
    const summary = await getMonitoringSummary(lotId);
    return res.status(200).json(summary);
  } catch (error) {
    console.error('getSummary error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSlots(req, res) {
  try {
    const { lotId, status, limit } = req.query;
    const slots = await getMonitoringSlots({ lotId, status, limit });
    return res.status(200).json(slots);
  } catch (error) {
    console.error('getSlots error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getActiveVehicles(req, res) {
  try {
    const { lotId, limit } = req.query;
    const sessions = await getActiveParkingSessions({ lotId, limit });
    return res.status(200).json(sessions);
  } catch (error) {
    console.error('getActiveVehicles error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
