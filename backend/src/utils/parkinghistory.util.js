import ParkingSession from '../models/parkingsession.model.js';
import { seedDemoUsers } from './user.util.js';

const demoParkingSessions = [
    {
        username: '2452712',
        plateNumber: '59A-12345',
        entryTime: new Date('2024-06-01T08:00:00Z'),
        exitTime: new Date('2024-06-01T10:00:00Z'),
        status: 'exited',
        parkingLot: '1',
    },
    {
        username: 'fstaff',
        plateNumber: '59A-23051',
        entryTime: new Date('2024-06-02T09:00:00Z'),
        status: 'parked',
        parkingLot: '3',
    },
];

export const seedDemoParkingHistories = async () => {
    const users = await seedDemoUsers();
    const usersByUsername = new Map(users.map((user) => [user.username, user]));

    const operations = demoParkingSessions
        .map((session) => {
            const user = usersByUsername.get(session.username);

            if (!user) {
                return null;
            }

            const sessionToInsert = {
                userId: user._id,
                plateNumber: session.plateNumber,
                entryTime: session.entryTime,
                exitTime: session.exitTime,
                status: session.status,
                parkingLot: session.parkingLot,
            };

            return {
                updateOne: {
                    filter: {
                        userId: user._id,
                        plateNumber: session.plateNumber,
                        entryTime: session.entryTime,
                    },
                    update: { $setOnInsert: sessionToInsert },
                    upsert: true,
                },
            };
        })
        .filter(Boolean);

    if (operations.length > 0) {
        await ParkingSession.bulkWrite(operations);
    }
};

export const addParkingSession = async (session) => ParkingSession.create(session);

export const getParkingSessionByUserId = async (userId) =>
  ParkingSession.find({ userId }).lean();

export const getAllParkingSessions = async () => ParkingSession.find().lean();

export const updateParkingSessionExitTime = async (id, exitTime) =>
    ParkingSession.findByIdAndUpdate(
        id,
        { exitTime, status: 'exited' },
        { new: true }
    ).lean();
