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
  if (!value) return 'Đang đỗ';
  return new Date(value).toLocaleString('vi-VN');
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
  return exitTime ? 'Hoàn thành' : 'Đang đỗ';
}

function getLotDisplayName(parkingLot) {
  return LOT_NAME_MAP[parkingLot] || parkingLot || 'N/A';
}

function ParkingHistoryPage({ role, userId }) {
  const [parkingHistory, setParkingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Filter state for operator
  const [plateFilter, setPlateFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const activeSession = useMemo(() => {
    return parkingHistory.filter((entry) => !entry.exitTime).length;
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
  const pageTitle = isOperator ? 'Tất cả phiên' : 'Lịch sử đỗ xe';
  const pageSubtitle = isOperator ? 'Xem và lọc tất cả phiên đỗ xe' : 'Theo dõi đỗ xe của bạn';

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
          Biển số
        </label>
        <input
          type="text"
          placeholder="Tìm biển số..."
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
          Từ ngày
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
          Đến ngày
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
        Xóa bộ lọc
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
          <p>Tổng số bản ghi</p>
          <h3>{isOperator ? `${filteredHistory.length} trên ${parkingHistory.length}` : parkingHistory.length}</h3>
          <span>Tất cả hoạt động đỗ xe</span>
        </div>

        <div className="stat-card">
          <p>Phiên đang hoạt động</p>
          <h3>{activeSession}</h3>
          <span>Phương tiện đang đỗ</span>
        </div>

        <div className="stat-card">
          <p>Hoàn thành</p>
          <h3>{completedRecords}</h3>
          <span>Phiên đỗ xe đã kết thúc</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải lịch sử đỗ xe...</div>
      ) : displayHistory.length === 0 ? (
        <div className="empty-state card">
          {isOperator && (plateFilter || dateFrom || dateTo)
            ? 'Không tìm thấy phiên phù hợp với bộ lọc.'
            : 'Không có lịch sử đỗ xe.'}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>Bản ghi đỗ xe gần đây</h2>
            <p>Biển số, giờ vào, giờ ra, và trạng thái đỗ xe.</p>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Biển số</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Phí</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.map((entry, index) => {
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
                      <span className={`badge ${entry.exitTime ? 'badge-paid' : 'badge-pending'}`}>
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
              <h2>Chi tiết phiên</h2>
              <button className="modal-close" onClick={() => setSelectedEntry(null)}>
                ×
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-section">
                <h4>Phương tiện</h4>
                <div className="detail-item">
                  <span className="detail-label">Biển số</span>
                  <span className="detail-value">{selectedEntry.plateNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Loại phương tiện</span>
                  <span className="detail-value">{selectedEntry.vehicleType || 'Không có'}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thời gian</h4>
                <div className="detail-item">
                  <span className="detail-label">Giờ vào</span>
                  <span className="detail-value">{formatDateTime(selectedEntry.entryTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Giờ ra</span>
                  <span className="detail-value">{formatDateTime(selectedEntry.exitTime)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Thời lượng</span>
                  <span className="detail-value">
                    {calculateDuration(selectedEntry.entryTime, selectedEntry.exitTime)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Vị trí & Trạng thái</h4>
                <div className="detail-item">
                  <span className="detail-label">Bãi đỗ</span>
                  <span className="detail-value">{getLotDisplayName(selectedEntry.parkingLot)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ID chỗ</span>
                  <span className="detail-value">{selectedEntry.slotId || 'Không có'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trạng thái</span>
                  <span className={`badge ${selectedEntry.exitTime ? 'badge-paid' : 'badge-pending'}`}>
                    {selectedEntry.exitTime ? 'Hoàn thành' : 'Đang đỗ'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thanh toán</h4>
                <div className="detail-item">
                  <span className="detail-label">Phí</span>
                  <span className="detail-value" style={{ fontWeight: '600' }}>
                    {selectedEntry.fee ? selectedEntry.fee.toLocaleString() + ' VND' : '0 VND'}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Thông tin</h4>
                <div className="detail-item">
                  <span className="detail-label">ID phiên</span>
                  <span className="detail-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                    {selectedEntry._id}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ID người dùng</span>
                  <span className="detail-value">{selectedEntry.userId || 'Không có'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tạo lúc</span>
                  <span className="detail-value">
                    {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleString('vi-VN') : 'Không có'}
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
    <AppLayout title={pageTitle} subtitle={pageSubtitle}>
      {content}
    </AppLayout>
  );
}

export default ParkingHistoryPage;
