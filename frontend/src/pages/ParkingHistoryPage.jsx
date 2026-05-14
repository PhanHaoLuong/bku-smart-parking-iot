import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { authedFetch } from '../api/authedFetch';
import '../styles/AppLayout.css';
import '../styles/ParkingHistoryPage.css';

const LOT_NAME_MAP = {
  'lot-1': 'Lý Thường Kiệt',
  'lot-3': 'Tô Hiến Thành',
};

const LOT_GATE_MAP = {
  'lot-1': 'Cổng 1',
  'lot-3': 'Cổng 3',
};

function formatDateTime(value) {
  if (!value) return 'Still parked';
  return new Date(value).toLocaleString();
}

function calculateDuration(entryTime, exitTime) {
  if (!entryTime) return null;

  const entry = new Date(entryTime);
  const end = exitTime ? new Date(exitTime) : new Date();

  const diffMs = end - entry;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes} min`;
}

function getParkingStatus(exitTime) {
  return exitTime ? 'Completed' : 'Active';
}

function getLotDisplayName(parkingLot) {
  return LOT_NAME_MAP[parkingLot] || parkingLot || 'N/A';
}

function ParkingHistoryPage({ role, userId }) {
  const [parkingHistory, setParkingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const activeSessions = useMemo(() => {
    return parkingHistory.filter((entry) => !entry.exitTime);
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
          <p>Active Sessions</p>
          <h3>{activeSessions.length}</h3>
          <span>Currently parked vehicles</span>
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
                  <tr
                    key={entry._id || index}
                    onClick={() => setSelectedEntry(entry)}
                    style={{ cursor: 'pointer' }}
                  >
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

      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Session Details</h2>
              <button className="modal-close" onClick={() => setSelectedEntry(null)}>
                ×
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-section">
                <h4>Vehicle</h4>
                <div className="detail-item">
                  <span className="detail-label">Plate Number</span>
                  <span className="detail-value">{selectedEntry.plateNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehicle Type</span>
                  <span className="detail-value">{selectedEntry.vehicleType || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Timing</h4>
                <div className="detail-item">
                  <span className="detail-label">Entry Time</span>
                  <span className="detail-value">{formatDateTime(selectedEntry.entryTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Exit Time</span>
                  <span className="detail-value">{formatDateTime(selectedEntry.exitTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">
                    {calculateDuration(selectedEntry.entryTime, selectedEntry.exitTime)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Location & Status</h4>
                <div className="detail-item">
                  <span className="detail-label">Parking Lot</span>
                  <span className="detail-value">{getLotDisplayName(selectedEntry.parkingLot)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Slot ID</span>
                  <span className="detail-value">{selectedEntry.slotId || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`badge ${selectedEntry.exitTime ? 'badge-paid' : 'badge-pending'}`}>
                    {selectedEntry.exitTime ? 'Completed' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Billing</h4>
                <div className="detail-item">
                  <span className="detail-label">Fee</span>
                  <span className="detail-value" style={{ fontWeight: '600' }}>
                    {selectedEntry.fee ? selectedEntry.fee.toLocaleString() + ' VND' : '0 VND'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Metadata</h4>
                <div className="detail-item">
                  <span className="detail-label">Session ID</span>
                  <span className="detail-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                    {selectedEntry._id}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">{selectedEntry.userId || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created At</span>
                  <span className="detail-value">
                    {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
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