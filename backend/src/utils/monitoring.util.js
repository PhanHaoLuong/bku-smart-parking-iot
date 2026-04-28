import SlotState from '../models/slotstate.model.js';
import ParkingSession from '../models/parkingsession.model.js';

const getUtcDayRange = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

export async function getMonitoringSummary(lotId) {
  const lotFilter = lotId ? { iotId: lotId } : {};
  const sessionLotFilter = lotId ? { parkingLot: lotId } : {};
  const { start, end } = getUtcDayRange();

  const [totalSlots, occupiedSlots, activeSessions, lastSlotUpdate, entriesToday, exitsToday] = await Promise.all([
    SlotState.countDocuments(lotFilter),
    SlotState.countDocuments({ ...lotFilter, status: 'occupied' }),
    ParkingSession.countDocuments({ ...sessionLotFilter, status: 'parked' }),
    SlotState.findOne(lotFilter).sort({ updatedAt: -1 }).lean(),
    ParkingSession.countDocuments({
      ...sessionLotFilter,
      entryTime: { $gte: start, $lt: end },
    }),
    ParkingSession.countDocuments({
      ...sessionLotFilter,
      exitTime: { $gte: start, $lt: end },
    }),
  ]);

  return {
    lotId: lotId || 'all',
    totalSlots,
    occupiedSlots,
    freeSlots: Math.max(totalSlots - occupiedSlots, 0),
    occupancyRate: totalSlots > 0 ? Number(((occupiedSlots / totalSlots) * 100).toFixed(2)) : 0,
    activeSessions,
    entriesToday,
    exitsToday,
    lastUpdated: lastSlotUpdate?.updatedAt || null,
  };
}

export async function getMonitoringSlots({ lotId, status, limit = 300 }) {
  const query = {};

  if (lotId) {
    query.iotId = lotId;
  }

  if (status) {
    query.status = status;
  }

  return SlotState.find(query)
    .sort({ slotId: 1 })
    .limit(Math.min(Number(limit) || 300, 1000))
    .lean();
}

export async function getActiveParkingSessions({ lotId, limit = 200 }) {
  const query = { status: 'parked' };

  if (lotId) {
    query.parkingLot = lotId;
  }

  return ParkingSession.find(query)
    .sort({ entryTime: -1 })
    .limit(Math.min(Number(limit) || 200, 1000))
    .lean();
}
