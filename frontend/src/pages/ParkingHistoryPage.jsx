import { useEffect, useMemo, useState } from 'react';
import LearnerLayout from '../components/learner/LearnerLayout';
import '../styles/ParkingHistoryPage.css';

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
  const [error, setError] = useState('');

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
        setError('');

        const endpoint =
          role === 'admin' || role === 'operator'
            ? '/apiv1/parking-history'
            : `/apiv1/parking-history/${userId}`;

        const response = await fetch(endpoint, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch parking history');
        }

        const data = await response.json();
        setParkingHistory(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        console.error('Error fetching parking history:', fetchError);
        setError('Unable to load parking history.');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingHistory();
  }, [role, userId]);

  return (
    <LearnerLayout
      title="Parking History"
      subtitle="Track your parking activities"
    >
      <section className="parking-history-summary-grid">
        <div className="parking-summary-card">
          <p>Total Records</p>
          <h3>{parkingHistory.length}</h3>
          <span>All parking activities</span>
        </div>

        <div className="parking-summary-card">
          <p>Active Session</p>
          <h3>{activeSession ? '1' : '0'}</h3>
          <span>{activeSession ? activeSession.plateNumber : 'No active vehicle'}</span>
        </div>

        <div className="parking-summary-card">
          <p>Completed</p>
          <h3>{completedRecords}</h3>
          <span>Finished parking sessions</span>
        </div>
      </section>

      <section className="parking-history-card">
        <div className="parking-history-card-header">
          <div>
            <h2>Recent Parking Records</h2>
            <p>Review plate number, entry time, exit time, and parking status.</p>
          </div>
        </div>

        {loading && (
          <div className="parking-state-box">
            Loading parking history...
          </div>
        )}

        {error && (
          <div className="parking-error-box">
            {error}
          </div>
        )}

        {!loading && !error && parkingHistory.length === 0 && (
          <div className="parking-state-box">
            No parking history available.
          </div>
        )}

        {!loading && !error && parkingHistory.length > 0 && (
          <div className="parking-table-wrapper">
            <table className="parking-history-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Plate Number</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
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
                        <span className="plate-badge">
                          {entry.plateNumber}
                        </span>
                      </td>

                      <td>{formatDateTime(entry.entryTime)}</td>

                      <td>{formatDateTime(entry.exitTime)}</td>

                      <td>
                        <span
                          className={
                            status === 'Active'
                              ? 'status-badge active'
                              : 'status-badge completed'
                          }
                        >
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
      </section>
    </LearnerLayout>
  );
}

export default ParkingHistoryPage;