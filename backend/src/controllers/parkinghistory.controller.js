import { getParkingSessionByUserId, getAllParkingSessions } from '../utils/parkinghistory.util.js';

export const getParkingHistory = async (req, res) => {
  const { id } = req.params;
  const requesterId = req.user?.id;
  const requesterRole = req.user?.role;

  try {
    let parkingHistories;
    if (id) {
      // Learners/faculty can only see their own history
      if ((requesterRole === 'learner' || requesterRole === 'faculty') && id !== requesterId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      parkingHistories = await getParkingSessionByUserId(id);
      if (!parkingHistories) {
        return res.status(404).json({ message: 'Parking history not found for user' });
      }
    } else {
      // Only operators/admins/finance can list all
      if (requesterRole !== 'operator' && requesterRole !== 'admin' && requesterRole !== 'finance') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      parkingHistories = await getAllParkingSessions();
    }
    res.status(200).json(parkingHistories);
  } catch (error) {
    console.error('Error fetching parking history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};