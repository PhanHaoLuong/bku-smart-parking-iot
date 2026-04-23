import ParkingHistory from '../models/parkinghistory.model.js';
import { seedDemoUsers } from './user.util.js';

const demoParkingHistories = [
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

    const operations = demoParkingHistories
        .map((history) => {
            const user = usersByUsername.get(history.username);

            if (!user) {
                return null;
            }

            const historyToInsert = {
                userId: user._id,
                plateNumber: history.plateNumber,
                entryTime: history.entryTime,
                exitTime: history.exitTime,
                status: history.status,
                parkingLot: history.parkingLot,
            };

            return {
                updateOne: {
                    filter: {
                        userId: user._id,
                        plateNumber: history.plateNumber,
                        entryTime: history.entryTime,
                    },
                    update: { $setOnInsert: historyToInsert },
                    upsert: true,
                },
            };
        })
        .filter(Boolean);

    if (operations.length > 0) {
        await ParkingHistory.bulkWrite(operations);
    }
};

export const addParkingHistory = async (history) => ParkingHistory.create(history);

export const getParkingHistoryByUserId = async (userId) =>
  ParkingHistory.find({ userId }).lean();

export const getAllParkingHistories = async () => ParkingHistory.find().lean();

export const updateParkingHistoryExitTime = async (id, exitTime) =>
    ParkingHistory.findByIdAndUpdate(
        id,
        { exitTime, status: 'exited' },
        { new: true }
    ).lean();
