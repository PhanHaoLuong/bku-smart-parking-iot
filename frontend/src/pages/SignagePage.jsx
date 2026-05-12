import { useEffect, useState } from 'react';
import { getSignageStatus } from '../api/signageApi';
import campusMap from '../assets/Campus-Map-HCMUT.jpg';
import '../styles/PublicSignageLayout.css';

const LOT_NAMES = {
  'lot-1': 'Lý Thường Kiệt',
  'lot-3': 'Tô Hiến Thành',
};

const LOT_ALLIAS = {
  'lot-1': 'Cổng 1',
  'lot-3': 'Cổng 3',
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
        <span className="lot-id">{LOT_ALLIAS[lot.lotId] || lot.lotId}</span>
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
  const [selectedLot, setSelectedLot] = useState(null);

  // Marker positions - adjust these percentages to position on your map
  // Values are percentage from left,percentage from top
  const markerPositions = {
    'lot-1': { left: '40%', top: '50%' },
    'lot-3': { left: '80%', top: '76%' },
  };

  const handleMarkerClick = (lotId) => {
    // Toggle: if clicking already selected lot, close it; otherwise open it
    setSelectedLot(selectedLot === lotId ? null : lotId);
  };

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

    // Expose lot selection function for image map
    window.selectLot = (lotId) => {
      setSelectedLot(lotId);
    };

    return () => {
      clearInterval(interval);
      delete window.selectLot;
    };
  }, []);

  const handleCloseLot = () => {
    setSelectedLot(null);
  };

  const content = (
    <div className="signage-container">
      <div className="signage-map">
        <img src={campusMap} alt="Campus Map" className="signage-map-img" />
        <div className="signage-markers">
          {Object.entries(markerPositions).map(([lotId, pos]) => (
            <button
              key={lotId}
              className={`signage-marker ${selectedLot === lotId ? 'active' : ''}`}
              style={{ left: pos.left, top: pos.top }}
              onClick={() => handleMarkerClick(lotId)}
              title={LOT_NAMES[lotId]}
            >
              {lotId === 'lot-1' ? '1' : '3'}
            </button>
          ))}
        </div>

        {selectedLot && markerPositions[selectedLot] && (
          <div
            className="signage-lot-modal"
            style={{
              left: markerPositions[selectedLot].left,
              top: markerPositions[selectedLot].top,
            }}
          >
            <button className="signage-lot-close" onClick={handleCloseLot}>
              ✕
            </button>
            {loading ? (
              <div className="signage-loading">Đang tải...</div>
            ) : (
              lots.filter(lot => lot.lotId === selectedLot).map((lot) => (
                <SignageCard key={lot.lotId} lot={lot} />
              ))
            )}
          </div>
        )}
      </div>

      {error && <div className="signage-error">{error}</div>}
    </div>
  );

  return (
    <div className="public-signage-layout">
      <header className="signage-page-header">
        <h1 className="signage-title">Bảng Thông Tin Bãi Đỗ Xe</h1>
        <div className="header-decoration"></div>
      </header>
      {content}
    </div>
  );
}

export default SignagePage;