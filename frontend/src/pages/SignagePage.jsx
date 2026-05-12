import { useEffect, useState } from 'react';
import { getSignageStatus } from '../api/signageApi';
import '../styles/SignagePage.css';

const LOT_NAMES = {
  'lot-1': 'Khu vực A',
  'lot-3': 'Khu vực B',
};

const STATUS_CONFIG = {
  available: { label: 'CÒN CHỖ', color: '#10b981', bgColor: '#059669', icon: '✓' },
  nearly_full: { label: 'GẦN ĐẦY', color: '#f59e0b', bgColor: '#d97706', icon: '⚠' },
  full: { label: 'ĐÃ ĐẦY', color: '#ef4444', bgColor: '#dc2626', icon: '✕' },
};

function SignageCard({ lot }) {
  const statusConfig = STATUS_CONFIG[lot.status] || STATUS_CONFIG.available;
  const occupancyRate = lot.occupancyRate || 0;

  return (
    <div className="signage-card">
      <div className="signage-header">
        <h2 className="lot-name">{LOT_NAMES[lot.lotId] || lot.lotId}</h2>
        <span className="lot-id">{lot.lotId}</span>
      </div>

      <div className="status-badge" style={{ backgroundColor: statusConfig.bgColor }}>
        <span className="status-icon">{statusConfig.icon}</span>
        <span className="status-text">{statusConfig.label}</span>
      </div>

      <div className="free-slots-display">
        <span className="free-slots-number">{lot.freeSlots}</span>
        <span className="free-slots-label">chỗ trống</span>
      </div>

      <div className="occupancy-section">
        <div className="occupancy-bar">
          <div
            className="occupancy-fill"
            style={{
              width: `${occupancyRate}%`,
              backgroundColor: statusConfig.color,
            }}
          />
        </div>
        <span className="occupancy-text">{occupancyRate}% đã sử dụng</span>
      </div>

      <div className="last-updated">
        Cập nhật: {lot.lastUpdated ? new Date(lot.lastUpdated).toLocaleTimeString('vi-VN') : 'N/A'}
      </div>
    </div>
  );
}

function SignagePage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await getSignageStatus();
      if (!res.ok) {
        throw new Error('Failed to fetch signage data');
      }
      const json = await res.json();
      // API returns { success: true, data: [...] }
      const lotsData = json.data || json;
      setLots(Array.isArray(lotsData) ? lotsData : []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="signage-container">
      {error && <div className="signage-error">{error}</div>}

      {loading ? (
        <div className="signage-loading">Đang tải...</div>
      ) : (
        <div className="signage-grid">
          {lots.map((lot) => (
            <SignageCard key={lot.lotId} lot={lot} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="signage-page">
      <header className="signage-page-header">
        <h1 className="signage-title">Bảng Thông Tin Bãi Đỗ Xe</h1>
        <div className="header-decoration"></div>
      </header>
      {content}
    </div>
  );
}

export default SignagePage;