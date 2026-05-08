import ParkingSession from '../models/parkingsession.model.js';
import { seedDemoUsers } from './user.util.js';

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
