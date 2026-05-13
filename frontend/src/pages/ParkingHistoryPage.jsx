import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { authedFetch } from '../api/authedFetch';
import '../styles/AppLayout.css';

function formatDateTime(value) {
  if (!value) return 'Still parked';
  return new Date(value).toLocaleString();
}

function getParkingStatus(exitTime) {
  return exitTime ? 'Completed' : 'Active';
}

function ParkingHistoryPage({ role, userId }) {
  const [parkingHistory, setParkingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeSession = useMemo(() => {
    return parkingHistory.find((entry) => !entry.exitTime);
  }, [parkingHistory]);

  const completedRecords = useMemo(() => {
    return parkingHistory.filter((entry) => entry.exitTime).length;
  }, [parkingHistory]);

  useEffect(() => {
    const fetchParkingHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const endpoint =
          role === 'operator' || role === 'finance'
            ? '/apiv1/parking-history'
            : `/apiv1/parking-history/${userId}`;

        const response = await authedFetch(endpoint);

        if (!response.ok) {
          throw new Error('Failed to fetch parking history');
        }

        const data = await response.json();
        setParkingHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingHistory();
  }, [role, userId]);

  const content = (
    <>
      {error && <div className="error">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <p>Total Records</p>
          <h3>{parkingHistory.length}</h3>
          <span>All parking activities</span>
        </div>

        <div className="stat-card">
          <p>Active Session</p>
          <h3>{activeSession ? '1' : '0'}</h3>
          <span>{activeSession?.plateNumber || 'No active vehicle'}</span>
        </div>

        <div className="stat-card">
          <p>Completed</p>
          <h3>{completedRecords}</h3>
          <span>Finished parking sessions</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading parking history...</div>
      ) : parkingHistory.length === 0 ? (
        <div className="empty-state card">No parking history available.</div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>Recent Parking Records</h2>
            <p>Plate number, entry time, exit time, and parking status.</p>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Plate Number</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {parkingHistory.map((entry, index) => {
                const status = getParkingStatus(entry.exitTime);
                return (
                  <tr key={entry._id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="badge badge-active">{entry.plateNumber}</span>
                    </td>
                    <td>{formatDateTime(entry.entryTime)}</td>
                    <td>{formatDateTime(entry.exitTime)}</td>
                    <td style={{ fontWeight: '500' }}>
                      {entry.fee ? entry.fee.toLocaleString() + ' VND' : '-'}
                    </td>
                    <td>
                      <span className={`badge ${status === 'Active' ? 'badge-pending' : 'badge-paid'}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <AppLayout title="Parking History" subtitle="Track your parking">
      {content}
    </AppLayout>
  );
}

export default ParkingHistoryPage;