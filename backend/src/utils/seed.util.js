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
const HISTORY_DAYS = 5;
const END_USER_TYPES = ['learner', 'faculty'];
const HISTORY_ENTRIES_PER_USER = 1;

const END_USER_VEHICLE_TYPES = {
  2452712: ['motorcycle'],
  learner02: ['motorcycle', 'bicycle'],
  learner03: ['car'],
  faculty01: ['car'],
  faculty02: ['motorcycle', 'car'],
};

const demoUsers = [
  {
    username: '2452712',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'learner',
    userType: 'learner',
    vehicleType: 'motorcycle',
    cardActive: true,
    fullName: 'Phan Van A',
    email: 'a.phanvan@hcmut.edu.vn',
  },
  {
    username: 'learner02',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'learner',
    userType: 'learner',
    vehicleType: 'motorcycle',
    cardActive: true,
    fullName: 'Learner Two',
    email: 'learner02@hcmut.edu.vn',
  },
  {
    username: 'learner03',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'learner',
    userType: 'learner',
    vehicleType: 'car',
    cardActive: true,
    fullName: 'Learner Three',
    email: 'learner03@hcmut.edu.vn',
  },
  {
    username: 'parkingop',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'operator',
    userType: 'staff',
    vehicleType: 'motorcycle',
    cardActive: true,
    fullName: 'Parking Operator',
    email: 'parking@hcmut.edu.vn',
  },
  {
    username: 'faculty01',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'faculty',
    userType: 'faculty',
    vehicleType: 'car',
    cardActive: true,
    fullName: 'Faculty Member One',
    email: 'faculty01@hcmut.edu.vn',
  },
  {
    username: 'faculty02',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'faculty',
    userType: 'faculty',
    vehicleType: 'motorcycle',
    cardActive: true,
    fullName: 'Faculty Member Two',
    email: 'faculty02@hcmut.edu.vn',
  },
  {
    username: 'finance01',
    password: String(bcrypt.hashSync('123', 10)),
    role: 'finance',
    userType: 'staff',
    vehicleType: 'motorcycle',
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
      iotId: `iot-${lotId}-${slotPrefix}${String(index + 1).padStart(2, '0')}`,
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
        userId: user._id.toString(),
        slotId: slot.slotId,
        parkingLot: slot.lotId,
        plateNumber,
        vehicleType: assignedVehicleType,
        entryTime,
        status: 'parked',
      },
      events: [entryEvent, occupiedEvent, heartbeatEvent],
    };
  } else if (state === 'exited') {
    const exitTime = new Date(heartbeatTime.getTime() + randomInt(15, 240) * 60 * 1000);
    const exitEvent = {
      eventId: makeEventId('evt', slot.slotId, 'exit'),
      eventType: 'vehicle_exit',
      deviceId: `${slot.lotId}-gate-out`,
      lotId: slot.lotId,
      slotId: slot.slotId,
      plateNumber,
      timestamp: exitTime,
    };
    const slotFreeEvent = {
      eventId: makeEventId('evt', slot.slotId, 'slot-free'),
      eventType: 'slot_freed',
      deviceId: `${slot.lotId}-sensor-${slot.slotId}`,
      lotId: slot.lotId,
      slotId: slot.slotId,
      timestamp: new Date(exitTime.getTime() + 60000),
    };
    return {
      session: {
        userId: user._id.toString(),
        slotId: slot.slotId,
        parkingLot: slot.lotId,
        plateNumber,
        vehicleType: assignedVehicleType,
        entryTime,
        exitTime,
        status: 'exited',
        fee: calculateSessionFee(entryTime, exitTime, assignedVehicleType),
      },
      events: [entryEvent, occupiedEvent, exitEvent, slotFreeEvent],
    };
  }
  return null;
}

const seedDemoParkingInfrastructure = async () => {
  await Promise.all([
    Event.deleteMany({}),
    SlotState.deleteMany({}),
    ParkingSession.deleteMany({}),
    User.deleteMany({}),
  ]);

  await User.create(demoUsers);

  const slots = buildSlots();
  await SlotState.create(slots);

  const users = await User.find({}).lean();
  const endUsers = users.filter((u) => END_USER_TYPES.includes(u.userType));

  const endUsersWithVehicleTypes = endUsers.map((u, i) => ({
    user: u,
    vehicleTypes: getEndUserVehicleTypes(u.username, i),
  }));

  const allEvents = [];
  const allSessions = [];

  for (let dayOffset = 0; dayOffset < HISTORY_DAYS; dayOffset++) {
    const shuffledUsers = shuffle(endUsersWithVehicleTypes);

    for (let userIndex = 0; userIndex < shuffledUsers.length; userIndex++) {
      const { user, vehicleTypes } = shuffledUsers[userIndex];

      for (let sessionIndex = 0; sessionIndex < HISTORY_ENTRIES_PER_USER; sessionIndex++) {
        const baseTime = buildHistorySessionStart(dayOffset, userIndex, sessionIndex);
        const slot = slots[randomInt(0, slots.length - 1)];
        const state = sessionIndex % 3 === 0 ? 'occupied' : 'exited';

        const timeline = buildParkingTimeline(
          slot,
          user,
          state,
          baseTime,
          userIndex * HISTORY_ENTRIES_PER_USER + sessionIndex,
          vehicleTypes[sessionIndex % vehicleTypes.length]
        );

        if (!timeline) continue;
        allEvents.push(...timeline.events);
        allSessions.push(timeline.session);
      }
    }
  }

  await Promise.all([
    Event.insertMany(allEvents),
    ParkingSession.insertMany(allSessions),
  ]);

  return { users: users.length, slots: slots.length, sessions: allSessions.length };
};

// ─── Billing ────────────────────────────────────────────────────────────────

const defaultPolicies = [
  { userType: 'learner', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 10000 },
  { userType: 'learner', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 5000 },
  { userType: 'learner', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 20000, subsequentHourlyRate: 10000 },
  { userType: 'faculty', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 15000 },
  { userType: 'faculty', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 5000 },
  { userType: 'faculty', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 30000, subsequentHourlyRate: 15000 },
  { userType: 'staff', vehicleType: 'motorcycle', pricingMode: 'per-session', daytimeRate: 15000 },
  { userType: 'staff', vehicleType: 'bicycle', pricingMode: 'per-session', daytimeRate: 5000 },
  { userType: 'staff', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 30000, subsequentHourlyRate: 15000 },
  { userType: 'visitor', vehicleType: 'car', pricingMode: 'per-hour', firstHourRate: 10000, subsequentHourlyRate: 5000 },
];

const seedDefaultPolicies = async () => {
  const operator = await User.findOne({ role: 'operator' }).lean();
  const operatorId = operator?._id?.toString() || 'system';

  for (const policy of defaultPolicies) {
    await PricingPolicy.findOneAndUpdate(
      { userType: policy.userType, vehicleType: policy.vehicleType, isActive: true },
      { $setOnInsert: { ...policy, isActive: true, createdBy: operatorId, updatedBy: operatorId } },
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
  const userMap = {};
  for (const u of users) userMap[u.username] = u;

  const operatorUser = users.find((u) => u.role === 'operator');
  const operatorId = operatorUser?._id?.toString() || 'system';

  const learner1 = userMap['2452712'];
  const learner2 = userMap['learner02'];

  const sessions = await ParkingSession.find({ status: 'exited' }).lean();

  if (learner1) {
    const learner1Sessions = sessions.filter((s) => s.userId === learner1._id.toString()).slice(0, 3);
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 15);

    if (learner1Sessions.length > 0) {
      const items = learner1Sessions.map((s) => ({
        sessionId: s._id,
        plateNumber: s.plateNumber,
        entryTime: s.entryTime,
        exitTime: s.exitTime,
        fee: s.fee,
      }));
      const total1 = items.reduce((sum, i) => sum + (Number(i.fee) || 0), 0);

      await Invoice.create({
        userId: learner1._id.toString(),
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        totalAmount: Number(total1) || 0,
        status: 'pending',
        dueDate,
        items,
      });
    }
  }

  if (learner2) {
    const learner2Sessions = sessions.filter((s) => s.userId === learner2._id.toString()).slice(0, 2);
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 15);

    if (learner2Sessions.length > 0) {
      const items = learner2Sessions.map((s) => ({
        sessionId: s._id,
        plateNumber: s.plateNumber,
        entryTime: s.entryTime,
        exitTime: s.exitTime,
        fee: s.fee,
      }));
      const total2 = items.reduce((sum, i) => sum + (Number(i.fee) || 0), 0);

      await Invoice.create({
        userId: learner2._id.toString(),
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        totalAmount: Number(total2) || 0,
        status: 'paid',
        dueDate,
        paidAt: new Date(),
        paidAmount: Number(total2) || 0,
        paidBy: operatorId,
        items,
      });
    }
  }

  const visitors = ['59A-12345', '51C-67890', '50H-11111'];
  for (const plate of visitors) {
    const hours = randomInt(1, 5);
    await VisitorTransaction.create({
      sessionId: `visitor-${plate}`,
      plateNumber: plate,
      entryTime: new Date(Date.now() - hours * 24 * 60 * 60 * 1000),
      exitTime: new Date(),
      durationHours: hours,
      totalAmount: hours * 10000,
      status: randomInt(0, 1) ? 'paid' : 'pending',
    });
  }

  await AuditLog.create({
    action: 'pricing_created',
    performedBy: operatorId,
    performedByRole: 'operator',
    description: 'Seeded default pricing policies',
    details: { count: defaultPolicies.length },
    timestamp: new Date(),
  });

  await AuditLog.create({
    action: 'invoice_generated',
    performedBy: operatorId,
    performedByRole: 'operator',
    description: 'Seeded demo invoices for learners 2452712 and learner02',
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