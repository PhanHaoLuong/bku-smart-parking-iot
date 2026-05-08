import bcrypt from 'bcrypt';

import User from '../models/user.model.js';
import ParkingSession from '../models/parkingsession.model.js';
import SlotState from '../models/slotstate.model.js';
import Event from '../models/event.model.js';
import PricingPolicy from '../models/pricingpolicy.model.js';
import Invoice from '../models/invoice.model.js';
import VisitorTransaction from '../models/visitortransaction.model.js';
import AuditLog from '../models/auditlog.model.js';
import { calculateSessionFee } from './billing.util.js';

const LOTS = [
  { lotId: 'lot-1', slotPrefix: 'L1' },
  { lotId: 'lot-3', slotPrefix: 'L3' },
];

const SLOTS_PER_LOT = 20;
const HISTORY_DAYS = 10;
const END_USER_TYPES = ['learner', 'faculty'];
const HISTORY_ENTRIES_PER_USER = 10;

const END_USER_VEHICLE_TYPES = {
  2452712: ['motorcycle'],
  learner02: ['motorcycle', 'bicycle'],
  learner03: ['car'],
  fstaff: ['motorcycle'],
  faculty01: ['car'],
  faculty02: ['motorcycle', 'car'],
};

const demoUsers = [
  {
    username: '2452712',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'learner',
    userType: 'learner',
    cardActive: true,
    fullName: 'Phan Van A',
    email: 'a.phanvan@hcmut.edu.vn',
  },
  {
    username: 'learner02',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'learner',
    userType: 'learner',
    cardActive: true,
    fullName: 'Learner Two',
    email: 'learner02@hcmut.edu.vn',
  },
  {
    username: 'learner03',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'learner',
    userType: 'learner',
    cardActive: true,
    fullName: 'Learner Three',
    email: 'learner03@hcmut.edu.vn',
  },
  {
    username: 'fstaff',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'faculty',
    userType: 'faculty',
    cardActive: true,
    fullName: 'Faculty Staff',
    email: 'staff@hcmut.edu.vn',
  },
  {
    username: 'faculty01',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'faculty',
    userType: 'faculty',
    cardActive: true,
    fullName: 'Faculty Member One',
    email: 'faculty01@hcmut.edu.vn',
  },
  {
    username: 'faculty02',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'faculty',
    userType: 'faculty',
    cardActive: true,
    fullName: 'Faculty Member Two',
    email: 'faculty02@hcmut.edu.vn',
  },
  {
    username: 'admin',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'admin',
    userType: 'staff',
    cardActive: true,
    fullName: 'Admin User',
    email: 'admin@hcmut.edu.vn',
  },
  {
    username: 'parkingop',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'operator',
    userType: 'staff',
    cardActive: true,
    fullName: 'Parking Operator',
    email: 'parking@hcmut.edu.vn',
  },
  {
    username: 'finance01',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'finance',
    userType: 'staff',
    cardActive: true,
    fullName: 'Finance Officer',
    email: 'finance@hcmut.edu.vn',
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

function buildHistorySessionStart(dayOffset, userIndex, sessionIndex) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (HISTORY_DAYS - 1 - dayOffset));
  start.setHours(7 + (userIndex % 5), 10 + (sessionIndex * 11) % 50, 0, 0);
  return start;
}

function getEndUserVehicleTypes(username, userIndex) {
  return END_USER_VEHICLE_TYPES[username] || (userIndex % 2 === 0 ? ['motorcycle'] : ['car']);
}

function makeEventId(prefix, slotId, suffix) {
  return `${prefix}-${slotId}-${suffix}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildParkingTimeline(slot, user, state, baseTime, eventSeed, vehicleType) {
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

  const vehicleTypes = ['motorcycle', 'bicycle', 'car'];
  const assignedVehicleType = vehicleType || vehicleTypes[eventSeed % 3];

  if (state === 'occupied') {
    return {
      session: {
        userId: user._id,
        plateNumber,
        entryTime,
        status: 'parked',
        slotId: slot.slotId,
        vehicleType: assignedVehicleType,
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
      vehicleType: assignedVehicleType,
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
    role: user.role,
    userType: user.userType,
  }));
};

export const seedDemoParkingInfrastructure = async () => {
  await Promise.all([
    Event.deleteMany({}),
    SlotState.deleteMany({}),
    ParkingSession.deleteMany({}),
  ]);

  const users = await seedDemoUsers();
  const slots = buildSlots();

  const sessionDocs = [];
  const eventDocs = [];
  const slotStateDocsBySlot = new Map();

  let seedCounter = 1;

  const endUsers = users.filter((user) => END_USER_TYPES.includes(user.userType));

  endUsers.forEach((user, userIndex) => {
    const vehicleTypes = getEndUserVehicleTypes(user.username, userIndex);
    const vehiclePlates = Object.fromEntries(
      vehicleTypes.map((vehicleType, vehicleIndex) => [
        vehicleType,
        createPlateNumber(userIndex * 20 + vehicleIndex + 1),
      ])
    );

    for (let dayOffset = 0; dayOffset < HISTORY_ENTRIES_PER_USER; dayOffset += 1) {
      const vehicleType = vehicleTypes[dayOffset % vehicleTypes.length];
      const slot = slots[(userIndex * HISTORY_ENTRIES_PER_USER + dayOffset) % slots.length];
      const baseTime = buildHistorySessionStart(dayOffset, userIndex, dayOffset);
      const plateNumber = vehiclePlates[vehicleType];

      const timeline = buildParkingTimeline(
        slot,
        user,
        'exited',
        baseTime,
        seedCounter,
        vehicleType
      );

      timeline.session.plateNumber = plateNumber;
      timeline.session.vehicleType = vehicleType;
      timeline.events[0].plateNumber = plateNumber;
      timeline.events[1].plateNumber = plateNumber;
      timeline.events[2].plateNumber = plateNumber;
      timeline.events[3].plateNumber = plateNumber;

      sessionDocs.push(timeline.session);
      eventDocs.push(...timeline.events);
      slotStateDocsBySlot.set(slot.slotId, timeline.slotState);
      seedCounter += 1;
    }
  });

  for (const slot of slots) {
    if (!slotStateDocsBySlot.has(slot.slotId)) {
      const freeSlot = buildFreeSlotState(slot);
      slotStateDocsBySlot.set(slot.slotId, freeSlot.slotState);
      eventDocs.push(freeSlot.event);
    }
  }

  if (sessionDocs.length > 0) {
    await ParkingSession.insertMany(sessionDocs, { ordered: true });
  }

  const slotStateDocs = [...slotStateDocsBySlot.values()];

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

const defaultPolicies = [
  { userType: 'learner', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 2000, eveningRate: 3000, discountPercent: 0, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'learner', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 1000, eveningRate: 1000, discountPercent: 0, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'learner', vehicleType: 'car', pricingMode: 'per-session', daytimeRate: 5000, eveningRate: 7000, discountPercent: 0, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'faculty', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 2000, eveningRate: 3000, discountPercent: 50, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'faculty', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 0, eveningRate: 0, isFree: true, discountPercent: 0, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'faculty', vehicleType: 'car', pricingMode: 'per-session', daytimeRate: 5000, eveningRate: 7000, discountPercent: 30, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'staff', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 2000, eveningRate: 3000, discountPercent: 20, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'staff', vehicleType: 'car', pricingMode: 'per-session', daytimeRate: 5000, eveningRate: 7000, discountPercent: 10, billingCycle: 'monthly', billingCycleDay: 1 },
  { userType: 'visitor', vehicleType: 'motorcycle', pricingMode: 'per-hour', firstHourRate: 5000, subsequentHourlyRate: 2000 },
  { userType: 'visitor', vehicleType: 'bicycle', pricingMode: 'per-hour', firstHourRate: 2000, subsequentHourlyRate: 1000 },
  { userType: 'visitor', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 10000, subsequentHourlyRate: 5000 },
];

const seedDefaultPolicies = async () => {
  const admin = await User.findOne({ role: 'admin' }).lean();
  const adminId = admin?._id?.toString() || 'system';

  for (const policy of defaultPolicies) {
    await PricingPolicy.findOneAndUpdate(
      { userType: policy.userType, vehicleType: policy.vehicleType, isActive: true },
      { $setOnInsert: { ...policy, isActive: true, createdBy: adminId, updatedBy: adminId } },
      { upsert: true }
    );
  }
};

const seedDemoBillingData = async () => {
  await Promise.all([
    PricingPolicy.deleteMany({}),
    Invoice.deleteMany({}),
    VisitorTransaction.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  await seedDefaultPolicies();

  const users = await User.find({}).lean();
  const policyDocs = await PricingPolicy.find({ isActive: true }).lean();
  const policyMap = {};
  for (const policy of policyDocs) {
    policyMap[`${policy.userType}-${policy.vehicleType}`] = policy;
  }

  const endUsers = users.filter((user) => END_USER_TYPES.includes(user.userType));

  const adminUser = users.find((u) => u.role === 'admin');
  const adminId = adminUser?._id?.toString() || 'system';

  const sessions = await ParkingSession.find({ status: 'exited' }).lean();
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const dueDate = new Date(periodEnd);
  dueDate.setDate(dueDate.getDate() + 15);

  for (const [index, user] of endUsers.entries()) {
    const userSessions = sessions
      .filter((session) => session.userId === user._id.toString())
      .sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

    if (userSessions.length === 0) continue;

    const items = userSessions.map((session) => {
      const policyKey = `${user.userType}-${session.vehicleType || 'motorcycle'}`;
      const policy = policyMap[policyKey] || policyMap[`${user.userType}-motorcycle`];
      const amount = calculateSessionFee(session, policy);

      return {
        sessionId: session._id,
        plateNumber: session.plateNumber,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        rate: amount,
        amount,
        vehicleType: session.vehicleType || 'motorcycle',
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    await Invoice.create({
      userId: user._id.toString(),
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd,
      totalAmount,
      status: index % 2 === 0 ? 'paid' : 'pending',
      dueDate,
      paidAt: index % 2 === 0 ? new Date() : undefined,
      paidAmount: index % 2 === 0 ? totalAmount : undefined,
      paidBy: index % 2 === 0 ? adminId : undefined,
      items,
    });
  }

  if (endUsers.length > 0) {
    const visitorPlate = createPlateNumber(999);
    const entryTime = new Date(periodEnd);
    entryTime.setHours(8, 30, 0, 0);
    const exitTime = new Date(entryTime.getTime() + 2 * 60 * 60 * 1000);
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));

    await VisitorTransaction.create({
      sessionId: `visitor-seed-${Date.now()}`,
      plateNumber: visitorPlate,
      entryTime,
      exitTime,
      durationHours,
      totalAmount: 5000 + (durationHours - 1) * 2000,
      status: 'pending',
    });
  }

  await AuditLog.create({
    action: 'pricing_created',
    performedBy: adminId,
    performedByRole: 'admin',
    description: 'Seeded default pricing policies',
    details: { count: defaultPolicies.length },
    timestamp: new Date(),
  });

  await AuditLog.create({
    action: 'invoice_generated',
    performedBy: adminId,
    performedByRole: 'admin',
    description: 'Seeded demo invoices for end users',
    details: {},
    timestamp: new Date(),
  });

  const count = await Invoice.countDocuments();
  const txnCount = await VisitorTransaction.countDocuments();
  const policyCount = await PricingPolicy.countDocuments();

  return { invoices: count, visitorTxns: txnCount, policies: policyCount };
};

export const seedDemoData = async () => {
  await seedDemoParkingInfrastructure();
  await seedDemoBillingData();
};
