import { getParkingSessionByUserId, getAllParkingSessions } from '../utils/parkinghistory.util.js';

export const getParkingHistory = async (req, res) => {
  const { id: paramUserId } = req.params;
  const requesterId = req.user?.userId || req.user?.id;
  const requesterRole = req.user?.role;
  const canAccessAll = ['operator', 'admin', 'finance'].includes(requesterRole);

  try {
    let parkingHistories;
    if (!paramUserId) {
      if (!requesterId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      parkingHistories = canAccessAll
        ? await getAllParkingSessions()
        : await getParkingSessionByUserId(requesterId);
    } else {
      const isSelfRequest = String(paramUserId) === String(requesterId);
      const canAccessAnyUser = canAccessAll;

      if (!isSelfRequest && !canAccessAnyUser) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      parkingHistories = await getParkingSessionByUserId(paramUserId);
    }
    res.status(200).json(parkingHistories);
  } catch (error) {
    console.error('Error fetching parking history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};