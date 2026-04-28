import User from '../models/user.model.js';
import ParkingSession from '../models/parkingsession.model.js';
import SlotState from '../models/slotstate.model.js';
import Event from '../models/event.model.js';

const LOTS = [
  { lotId: 'lot-1', slotPrefix: 'L1' },
  { lotId: 'lot-3', slotPrefix: 'L3' },
];

const SLOTS_PER_LOT = 20;
const HISTORY_DAYS = 10;
const ACTIVE_SESSION_RATIO = 0.45;
const EXPIRED_SESSION_RATIO = 0.3;

const demoUsers = [
  {
    username: '2452712',
    password: '123',
    role: 'learner',
    cardActive: true,
    fullName: 'Phan Van A',
    email: 'a.phanvan@hcmut.edu.vn',
  },
  {
    username: 'fstaff',
    password: '123',
    role: 'operator',
    cardActive: true,
    fullName: 'Facility Staff',
    email: 'staff@hcmut.edu.vn',
  },
  {
    username: 'admin',
    password: '123',
    role: 'admin',
    cardActive: true,
    fullName: 'Admin User',
    email: 'admin@hcmut.edu.vn',
  },
  {
    username: 'parkingop',
    password: '123',
    role: 'operator',
    cardActive: true,
    fullName: 'Parking Operator',
    email: 'parking@hcmut.edu.vn',
  },
  {
    username: 'faculty01',
    password: '123',
    role: 'faculty',
    cardActive: true,
    fullName: 'Faculty Member',
    email: 'faculty01@hcmut.edu.vn',
  },
  {
    username: 'learner02',
    password: '123',
    role: 'learner',
    cardActive: true,
    fullName: 'Learner Two',
    email: 'learner02@hcmut.edu.vn',
  },
];

const firstNames = ['An', 'Binh', 'Chi', 'Duc', 'Em', 'Giang', 'Hanh', 'Khanh', 'Linh', 'Minh', 'Ngoc', 'Phuong', 'Quang', 'Tam', 'Vy'];
const lastNames = ['Le', 'Nguyen', 'Tran', 'Pham', 'Hoang', 'Vo', 'Huynh', 'Ngo', 'Dang', 'Bui'];
const carPrefixes = ['59A', '51C', '50H', '61A', '72B'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(values) {
  return values[randomInt(0, values.length - 1)];
}

function shuffle(values) {
  return [...values].sort(() => Math.random() - 0.5);
}

function createPlateNumber(index) {
  const prefix = pickRandom(carPrefixes);
  const suffix = String(10000 + index * 37 + randomInt(0, 899)).slice(-5);
  return `${prefix}-${suffix}`;
}

function createPersonName(index) {
  const first = pickRandom(firstNames);
  const last = pickRandom(lastNames);
  return `${last} ${first} ${index + 1}`;
}

function buildSlots() {
  return LOTS.flatMap(({ lotId, slotPrefix }) =>
    Array.from({ length: SLOTS_PER_LOT }, (_, index) => ({
      lotId,
      slotPrefix,
      slotNumber: index + 1,
      slotId: `${slotPrefix}-${String(index + 1).padStart(2, '0')}`,
    }))
  );
}

function randomHistoryBaseTime() {
  const now = Date.now();
  const windowMs = HISTORY_DAYS * 24 * 60 * 60 * 1000;
  return new Date(now - randomInt(1, windowMs));
}

function makeEventId(prefix, slotId, suffix) {
  return `${prefix}-${slotId}-${suffix}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildParkingTimeline(slot, user, state, baseTime, eventSeed) {
  const plateNumber = createPlateNumber(eventSeed);
  const entryTime = new Date(baseTime.getTime());
  entryTime.setMinutes(entryTime.getMinutes() + randomInt(5, 45));

  const slotOccupiedTime = new Date(entryTime.getTime() + randomInt(30, 180) * 1000);
  const heartbeatTime = new Date(slotOccupiedTime.getTime() + randomInt(2, 8) * 60 * 1000);
  const entryEvent = {
    eventId: makeEventId('evt', slot.slotId, 'entry'),
    eventType: 'vehicle_entry',
    deviceId: `${slot.lotId}-gate-in`,
    lotId: slot.lotId,
    slotId: slot.slotId,
    plateNumber,
    timestamp: entryTime,
  };
  const occupiedEvent = {
    eventId: makeEventId('evt', slot.slotId, 'slot-occupied'),
    eventType: 'slot_occupied',
    deviceId: `${slot.lotId}-slot-${slot.slotId}`,
    lotId: slot.lotId,
    slotId: slot.slotId,
    plateNumber,
    timestamp: slotOccupiedTime,
  };
  const heartbeatEvent = {
    eventId: makeEventId('evt', slot.slotId, 'heartbeat'),
    eventType: 'heartbeat',
    deviceId: `${slot.lotId}-sensor-${slot.slotId}`,
    lotId: slot.lotId,
    slotId: slot.slotId,
    timestamp: heartbeatTime,
  };

  if (state === 'occupied') {
    return {
      session: {
        userId: user._id,
        plateNumber,
        entryTime,
        status: 'parked',
        slotId: slot.slotId,
        parkingLot: slot.lotId,
      },
      slotState: {
        slotId: slot.slotId,
        iotId: slot.lotId,
        status: 'occupied',
        plateNumber,
        currentSessionId: null,
        lastEventId: heartbeatEvent.eventId,
        lastEventType: heartbeatEvent.eventType,
        lastChangeTime: heartbeatEvent.timestamp,
      },
      events: [entryEvent, occupiedEvent, heartbeatEvent],
    };
  }

  const exitTime = new Date(entryTime.getTime() + randomInt(20, 240) * 60 * 1000);
  const slotFreedTime = new Date(exitTime.getTime() + randomInt(20, 90) * 1000);
  const durationSeconds = Math.max(0, Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000));
  const exitEvent = {
    eventId: makeEventId('evt', slot.slotId, 'exit'),
    eventType: 'vehicle_exit',
    deviceId: `${slot.lotId}-gate-out`,
    lotId: slot.lotId,
    slotId: slot.slotId,
    plateNumber,
    timestamp: exitTime,
  };
  const freedEvent = {
    eventId: makeEventId('evt', slot.slotId, 'slot-freed'),
    eventType: 'slot_freed',
    deviceId: `${slot.lotId}-slot-${slot.slotId}`,
    lotId: slot.lotId,
    slotId: slot.slotId,
    timestamp: slotFreedTime,
  };

  return {
    session: {
      userId: user._id,
      plateNumber,
      entryTime,
      exitTime,
      status: 'exited',
      slotId: slot.slotId,
      duration: durationSeconds,
      parkingLot: slot.lotId,
    },
    slotState: {
      slotId: slot.slotId,
      iotId: slot.lotId,
      status: 'free',
      plateNumber: null,
      currentSessionId: null,
      lastEventId: freedEvent.eventId,
      lastEventType: freedEvent.eventType,
      lastChangeTime: freedEvent.timestamp,
    },
    events: [entryEvent, occupiedEvent, exitEvent, freedEvent],
  };
}

function buildFreeSlotState(slot) {
  const heartbeatEvent = buildHeartbeatEvent(slot);

  return {
    slotState: {
      slotId: slot.slotId,
      iotId: slot.lotId,
      status: 'free',
      plateNumber: null,
      currentSessionId: null,
      lastEventId: heartbeatEvent.eventId,
      lastEventType: heartbeatEvent.eventType,
      lastChangeTime: heartbeatEvent.timestamp,
    },
    event: heartbeatEvent,
  };
}

function buildHeartbeatEvent(slot) {
  return {
    eventId: makeEventId('evt', slot.slotId, 'heartbeat'),
    eventType: 'heartbeat',
    deviceId: `${slot.lotId}-sensor-${slot.slotId}`,
    lotId: slot.lotId,
    slotId: slot.slotId,
    timestamp: randomHistoryBaseTime(),
  };
}

export const seedDemoUsers = async () => {
  await User.deleteMany({});
  const insertedUsers = await User.insertMany(demoUsers, { ordered: true });

  return insertedUsers.map((user) => ({
    _id: user._id,
    username: user.username,
  }));
};

export const seedDemoParkingInfrastructure = async () => {
  await Promise.all([
    Event.deleteMany({}),
    SlotState.deleteMany({}),
    ParkingSession.deleteMany({}),
  ]);

  const users = await seedDemoUsers();
  const usersByIndex = shuffle(users);
  const slots = buildSlots();

  const slotStateDocs = [];
  const sessionDocs = [];
  const eventDocs = [];

  let userCursor = 0;
  let seedCounter = 1;

  for (const slot of slots) {
    const baseTime = randomHistoryBaseTime();
    const roll = Math.random();
    const user = usersByIndex[userCursor % usersByIndex.length];
    userCursor += 1;

    let timeline;

    if (roll < ACTIVE_SESSION_RATIO) {
      timeline = buildParkingTimeline(slot, user, 'occupied', baseTime, seedCounter);
    } else if (roll < ACTIVE_SESSION_RATIO + EXPIRED_SESSION_RATIO) {
      timeline = buildParkingTimeline(slot, user, 'exited', baseTime, seedCounter);
    } else {
      const freeSlot = buildFreeSlotState(slot);
      slotStateDocs.push(freeSlot.slotState);
      eventDocs.push(freeSlot.event);
      seedCounter += 1;
      continue;
    }

    slotStateDocs.push(timeline.slotState);
    sessionDocs.push(timeline.session);
    eventDocs.push(...timeline.events);
    seedCounter += 1;
  }

  if (sessionDocs.length > 0) {
    const createdSessions = await ParkingSession.insertMany(sessionDocs, { ordered: true });

    createdSessions.forEach((session) => {
      const matchingSlot = slotStateDocs.find((slotState) => slotState.slotId === session.slotId);
      if (matchingSlot && session.status === 'parked') {
        matchingSlot.currentSessionId = session._id;
        matchingSlot.plateNumber = session.plateNumber;
        matchingSlot.status = 'occupied';
      }
    });
  }

  if (slotStateDocs.length > 0) {
    await SlotState.insertMany(slotStateDocs, { ordered: true });
  }

  if (eventDocs.length > 0) {
    await Event.insertMany(eventDocs, { ordered: true });
  }

  return {
    users: users.length,
    slots: slotStateDocs.length,
    sessions: sessionDocs.length,
    events: eventDocs.length,
  };
};

export const seedDemoData = async () => {
  return seedDemoParkingInfrastructure();
};
