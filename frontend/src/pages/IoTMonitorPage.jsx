import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { authedFetch } from '../api/authedFetch';
import '../styles/IoTMonitorPage.css';

const LOT_OPTIONS = [
  { id: 'lot-1', name: 'Lý Thường Kiệt', gate: 'Cổng 1' },
  { id: 'lot-3', name: 'Tô Hiến Thành', gate: 'Cổng 3' },
];

const IOT_TYPES = {
  slot: { label: 'Slot Sensor', icon: '📍' },
  entry: { label: 'Entry Gate', icon: '🚗' },
  exit: { label: 'Exit Gate', icon: '🚙' },
};

function IoTMonitorPage() {
  const [selectedLot, setSelectedLot] = useState('lot-1');
  const [iotDevices, setIotDevices] = useState([]);
  const [gates, setGates] = useState([]);
  const [lotStats, setLotStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controllingGate, setControllingGate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsRes = await authedFetch(`/apiv1/monitoring/summary?lotId=${selectedLot}`);
      if (!statsRes.ok) throw new Error('Failed to fetch lot stats');
      const statsData = await statsRes.json();
      setLotStats(statsData);

      const eventsRes = await authedFetch(`/apiv1/iot/events?lotId=${selectedLot}&limit=100`);
      const eventsData = eventsRes.ok ? await eventsRes.json() : [];

      const slotsRes = await authedFetch(`/apiv1/monitoring/slots?lotId=${selectedLot}`);
      const slotsData = slotsRes.ok ? await slotsRes.json() : [];

      const lotSlots = slotsData.filter(s => s.iotId && s.iotId.includes(selectedLot));
      const slotDevices = lotSlots.map(slot => {
        const latestEvent = eventsData.find(e => e.slotId === slot.slotId);
        const lastUpdateTime = latestEvent?.timestamp || slot.updatedAt || slot.lastChangeTime;
        const eventAge = lastUpdateTime ? Date.now() - new Date(lastUpdateTime).getTime() : null;
        let status = 'unknown';
        if (!lastUpdateTime) status = 'offline';
        else if (eventAge > 300000) status = 'offline';
        else if (eventAge > 120000) status = 'warning';
        else status = 'online';

        return {
          iotId: slot.iotId,
          type: 'slot',
          typeLabel: IOT_TYPES.slot.label,
          icon: IOT_TYPES.slot.icon,
          status,
          slotId: slot.slotId,
          currentState: slot.status,
          lastUpdate: lastUpdateTime,
        };
      });

      const gatesRes = await authedFetch(`/apiv1/gates?lotId=${selectedLot}`);
      const gatesData = gatesRes.ok ? await gatesRes.json() : [];
      setGates(gatesData);

      const gateDevices = gatesData.map(gate => {
        const gateType = gate.type === 'entry' ? 'entry' : 'exit';
        let status = gate.isOnline ? 'online' : 'offline';
        if (gate.status === 'opening' || gate.status === 'closing') status = 'warning';

        return {
          gateId: gate.gateId,
          type: gateType,
          typeLabel: IOT_TYPES[gateType].label,
          icon: IOT_TYPES[gateType].icon,
          status,
          currentState: gate.status,
          position: gate.position,
          lastUpdate: gate.lastCommandAt || gate.updatedAt,
        };
      });

      setIotDevices([...slotDevices, ...gateDevices]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGateControl = async (gateId, command) => {
    try {
      setControllingGate(gateId);
      const res = await authedFetch(`/apiv1/gates/${gateId}/control`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!res.ok) throw new Error('Failed to control gate');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setControllingGate(null);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [selectedLot]);

  const slotDevices = iotDevices.filter(d => d.type === 'slot');
  const gateDevices = iotDevices.filter(d => d.type !== 'slot');

  const getGateStatusColor = (status) => {
    switch (status) {
      case 'open': return '#10b981';
      case 'closed': return '#ef4444';
      case 'opening':
      case 'closing': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <AppLayout title="Giám sát IoT" subtitle="Trạng thái thiết bị IoT thời gian thực">
      <div className="iot-monitor">
        <div className="lot-selector">
          <label>Chọn bãi đỗ:</label>
          <div className="lot-buttons">
            {LOT_OPTIONS.map(lot => (
              <button
                key={lot.id}
                className={`lot-btn ${selectedLot === lot.id ? 'active' : ''}`}
                onClick={() => setSelectedLot(lot.id)}
              >
                <span className="lot-btn-number">{lot.id === 'lot-1' ? '1' : '3'}</span>
                <span className="lot-btn-name">{lot.name}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="iot-error">{error}</div>}

        <div className="iot-stats-grid">
          <div className="iot-stat-card">
            <p>Tổng</p>
            <h3>{lotStats?.totalSlots || 0}</h3>
          </div>
          <div className="iot-stat-card occupied">
            <p>Đã đỗ</p>
            <h3>{lotStats?.occupiedSlots || 0}</h3>
          </div>
          <div className="iot-stat-card free">
            <p>Trống</p>
            <h3>{lotStats?.freeSlots || 0}</h3>
          </div>
          <div className="iot-stat-card">
            <p>Tỷ lệ</p>
            <h3>{lotStats?.occupancyRate || 0}%</h3>
          </div>
        </div>

        <div className="slot-grid-section">
          <h3>Tình trạng chỗ đỗ</h3>
          {loading ? (
            <div className="iot-loading">Đang tải...</div>
          ) : (
            <div className="slot-grid">
              {slotDevices.map(slot => (
                <div
                  key={slot.iotId}
                  className={`slot-dot ${slot.currentState}`}
                  title={`${slot.slotId}: ${slot.currentState}`}
                >
                  <span className="slot-name">{slot.slotId?.replace('L1', '').replace('L3', '') || slot.iotId}</span>
                  <span className="slot-indicator"></span>
                </div>
              ))}
            </div>
          )}
          <div className="slot-legend">
            <span><span className="legend-dot free"></span> Trống</span>
            <span><span className="legend-dot occupied"></span> Đã đỗ</span>
          </div>
        </div>

        <div className="gate-section">
          <h3>Điều khiển cổng</h3>
          <div className="gate-grid">
            {gateDevices.map(gate => (
              <div key={gate.gateId} className="gate-card">
                <div className="gate-header">
                  <span className="gate-icon">{gate.icon}</span>
                  <div className="gate-info">
                    <span className="gate-name">{gate.typeLabel}</span>
                    <span className="gate-id">{gate.gateId}</span>
                  </div>
                </div>
                <div className="gate-status-row">
                  <span className="gate-status-label">Trạng thái:</span>
                  <span 
                    className="gate-status-badge"
                    style={{ backgroundColor: getGateStatusColor(gate.currentState) }}
                  >
                    {gate.currentState}
                  </span>
                </div>
                <div className="gate-position-row">
                  <span className="gate-status-label">Vị trí:</span>
                  <span className="gate-position-value">{gate.position}</span>
                </div>
                <div className="gate-controls">
                  <button
                    className="gate-btn open"
                    onClick={() => handleGateControl(gate.gateId, 'open')}
                    disabled={controllingGate === gate.gateId || gate.currentState === 'open'}
                  >
                    Mở
                  </button>
                  <button
                    className="gate-btn close"
                    onClick={() => handleGateControl(gate.gateId, 'close')}
                    disabled={controllingGate === gate.gateId || gate.currentState === 'closed'}
                  >
                    Đóng
                  </button>
                </div>
                {controllingGate === gate.gateId && (
                  <div className="gate-controlling">Đang điều khiển...</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default IoTMonitorPage;
