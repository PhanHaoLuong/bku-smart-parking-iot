import { getParkingSessionByUserId, getAllParkingSessions } from '../utils/parkinghistory.util.js';

export const getParkingHistory = async (req, res) => {
  const { id } = req.params;

  try {
    let parkingHistories;
    if (id) {
      parkingHistories = await getParkingSessionByUserId(id);
    } else {
      if (req.user.role === 'admin' || req.user.role === 'operator') {
        parkingHistories = await getAllParkingSessions();
      } else {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }
    res.status(200).json(parkingHistories);
  } catch (error) {
    console.error('Error fetching parking history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};