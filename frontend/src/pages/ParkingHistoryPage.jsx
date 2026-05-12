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

  // Filter state for operator
  const [plateFilter, setPlateFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const activeSession = useMemo(() => {
    return parkingHistory.find((entry) => !entry.exitTime);
  }, [parkingHistory]);

  const completedRecords = useMemo(() => {
    return parkingHistory.filter((entry) => entry.exitTime).length;
  }, [parkingHistory]);

  // Filtered history with AND logic
  const filteredHistory = useMemo(() => {
    return parkingHistory.filter((entry) => {
      // Plate filter (case-insensitive partial match)
      if (plateFilter && !entry.plateNumber?.toLowerCase().includes(plateFilter.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (dateFrom) {
        const entryDate = new Date(entry.entryTime);
        const fromDate = new Date(dateFrom);
        if (entryDate < fromDate) return false;
      }
      if (dateTo) {
        const entryDate = new Date(entry.entryTime);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (entryDate > toDate) return false;
      }

      return true;
    });
  }, [parkingHistory, plateFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setPlateFilter('');
    setDateFrom('');
    setDateTo('');
  };

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

  // Determine title/subtitle based on role
  const isOperator = role === 'operator';
  const pageTitle = isOperator ? 'All Sessions' : 'Parking History';
  const pageSubtitle = isOperator ? 'View and filter all parking sessions' : 'Track your parking';

  // Filter bar for operator only
  const filterBar = isOperator && (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      alignItems: 'flex-end',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: '1', minWidth: '150px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
          Plate Number
        </label>
        <input
          type="text"
          placeholder="Search plate..."
          value={plateFilter}
          onChange={(e) => setPlateFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>
      <div style={{ flex: '1', minWidth: '150px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
          From Date
        </label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>
      <div style={{ flex: '1', minWidth: '150px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
          To Date
        </label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>
      <button
        onClick={clearFilters}
        style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          height: '38px'
        }}
      >
        Clear Filters
      </button>
    </div>
  );

  // Use filtered history for operator, full history for others
  const displayHistory = isOperator ? filteredHistory : parkingHistory;

  const content = (
    <>
      {error && <div className="error">{error}</div>}

      {filterBar}

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <p>Total Records</p>
          <h3>{isOperator ? `${filteredHistory.length} of ${parkingHistory.length}` : parkingHistory.length}</h3>
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
      ) : displayHistory.length === 0 ? (
        <div className="empty-state card">
          {isOperator && (plateFilter || dateFrom || dateTo)
            ? 'No sessions found matching your filters.'
            : 'No parking history available.'}
        </div>
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((entry, index) => {
                const status = getParkingStatus(entry.exitTime);
                return (
                  <tr key={entry._id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="badge badge-active">{entry.plateNumber}</span>
                    </td>
                    <td>{formatDateTime(entry.entryTime)}</td>
                    <td>{formatDateTime(entry.exitTime)}</td>
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
    <AppLayout title={pageTitle} subtitle={pageSubtitle}>
      {content}
    </AppLayout>
  );
}

export default ParkingHistoryPage;
