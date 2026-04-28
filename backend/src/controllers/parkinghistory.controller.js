import { getParkingSessionByUserId, getAllParkingSessions } from '../utils/parkinghistory.util.js';

export const getParkingHistory = async (req, res) => {
  const { id } = req.params;

  try {
    let parkingHistories;
    if (id) {
      parkingHistories = await getParkingSessionByUserId(id);
      if (!parkingHistories) {
        return res.status(404).json({ message: 'Parking history not found for user' });
      }
    } else {
      parkingHistories = await getAllParkingSessions();
    }
    res.status(200).json(parkingHistories);
  } catch (error) {
    console.error('Error fetching parking history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};