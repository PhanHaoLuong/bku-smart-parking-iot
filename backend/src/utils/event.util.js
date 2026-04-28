import Event from '../models/event.model.js';
import SlotState from '../models/slotstate.model.js';
import ParkingSession from '../models/parkingsession.model.js';

const EVENT_TYPES = {
  VEHICLE_ENTRY: 'vehicle_entry',
  VEHICLE_EXIT: 'vehicle_exit',
  SLOT_OCCUPIED: 'slot_occupied',
  SLOT_FREED: 'slot_freed',
  HEARTBEAT: 'heartbeat',
};

const toDurationSeconds = (entryTime, exitTime) => {
  if (!entryTime || !exitTime) return null;
  return Math.max(0, Math.floor((new Date(exitTime).getTime() - new Date(entryTime).getTime()) / 1000));
};

async function applySlotProjection(event) {
  if (!event.slotId) return;

  const nextStatus = event.eventType === EVENT_TYPES.SLOT_OCCUPIED
    ? 'occupied'
    : event.eventType === EVENT_TYPES.SLOT_FREED
      ? 'free'
      : null;

  if (!nextStatus) return;

  const update = {
    iotId: event.lotId,
    status: nextStatus,
    plateNumber: nextStatus === 'free' ? null : event.plateNumber || null,
    lastEventId: event.eventId,
    lastEventType: event.eventType,
    lastChangeTime: event.timestamp,
    updatedAt: new Date(),
  };

  await SlotState.findOneAndUpdate(
    { slotId: event.slotId },
    { $set: update, $setOnInsert: { currentSessionId: null } },
    { upsert: true, new: true }
  );
}

async function applyParkingSessionProjection(event) {
  if (!event.plateNumber) return;

  if (event.eventType === EVENT_TYPES.VEHICLE_ENTRY) {
    const existingOpenSession = await ParkingSession.findOne({
      plateNumber: event.plateNumber,
      parkingLot: event.lotId,
      status: 'parked',
    }).lean();

    if (existingOpenSession) {
      return;
    }

    const newSession = await ParkingSession.create({
      plateNumber: event.plateNumber,
      entryTime: event.timestamp,
      status: 'parked',
      slotId: event.slotId || undefined,
      parkingLot: event.lotId,
    });

    if (event.slotId) {
      await SlotState.findOneAndUpdate(
        { slotId: event.slotId },
        {
          $set: { currentSessionId: newSession._id, plateNumber: event.plateNumber, iotId: event.lotId },
          $setOnInsert: { status: 'occupied', lastChangeTime: event.timestamp },
        },
        { upsert: true }
      );
    }
    return;
  }

  if (event.eventType === EVENT_TYPES.VEHICLE_EXIT) {
    const openSession = await ParkingSession.findOne({
      plateNumber: event.plateNumber,
      parkingLot: event.lotId,
      status: 'parked',
    }).sort({ entryTime: -1 });

    if (!openSession) {
      return;
    }

    openSession.exitTime = event.timestamp;
    openSession.status = 'exited';
    openSession.duration = toDurationSeconds(openSession.entryTime, event.timestamp);
    if (!openSession.slotId && event.slotId) {
      openSession.slotId = event.slotId;
    }

    await openSession.save();

    if (openSession.slotId) {
      await SlotState.findOneAndUpdate(
        { slotId: openSession.slotId },
        { $set: { currentSessionId: null, plateNumber: null } }
      );
    }
  }
}

async function applyProjections(events) {
  for (const event of events) {
    await applySlotProjection(event);
    await applyParkingSessionProjection(event);

    if (event.eventType === EVENT_TYPES.HEARTBEAT && event.slotId) {
      await SlotState.findOneAndUpdate(
        { slotId: event.slotId },
        {
          $set: {
            iotId: event.lotId,
            lastEventId: event.eventId,
            lastEventType: event.eventType,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            status: 'free',
            lastChangeTime: event.timestamp,
          },
        },
        { upsert: true }
      );
    }
  }
}

export async function ingestEvents(events) {
  if (!events.length) return { accepted: 0 };

  const insertedEvents = await Event.insertMany(events, { ordered: true });

  if (insertedEvents.length > 0) {
    await applyProjections(insertedEvents);
  }

  return { accepted: insertedEvents.length };
}

export async function fetchLatestEvents(limit = 50) {
  return Event.find().sort({ timestamp: -1 }).limit(limit).lean();
}

export async function getEventCountByRange(start, end) {
  return Event.countDocuments({ timestamp: { $gte: start, $lt: end } });
}