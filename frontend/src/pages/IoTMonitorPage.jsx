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
  entry_gate: { label: 'Entry Gate', icon: '🚗' },
  exit_gate: { label: 'Exit Gate', icon: '🚙' },
};

function IoTMonitorPage() {
  const [selectedLot, setSelectedLot] = useState('lot-1');
  const [iotDevices, setIotDevices] = useState([]);
  const [lotStats, setLotStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch lot stats using query param
      const statsRes = await authedFetch(`/apiv1/monitoring/summary?lotId=${selectedLot}`);
      if (!statsRes.ok) {
        throw new Error('Failed to fetch lot stats');
      }
      const statsData = await statsRes.json();
      setLotStats(statsData);

      // Fetch IoT events for this lot to determine device status
      const eventsRes = await authedFetch(`/apiv1/iot/events?lotId=${selectedLot}&limit=100`);
      let eventsData = [];
      if (eventsRes.ok) {
        eventsData = await eventsRes.json();
      }

      // Build IoT device list based on slot states - filter by lot
      const slotsRes = await authedFetch(`/apiv1/monitoring/slots?lotId=${selectedLot}`);
      let slotsData = [];
      if (slotsRes.ok) {
        slotsData = await slotsRes.json();
      }

      // Filter slots for selected lot and build IoT device list
      const lotSlots = slotsData.filter(s => s.iotId && s.iotId.includes(selectedLot));
      const slotDevices = lotSlots.map(slot => {
        // Find latest event for this slot by matching slotId
        const latestEvent = eventsData.find(e => e.slotId === slot.slotId);
        const lastUpdateTime = latestEvent?.timestamp || slot.updatedAt || slot.lastChangeTime;
        const eventAge = lastUpdateTime
          ? Date.now() - new Date(lastUpdateTime).getTime()
          : null;

        // Determine status based on event age
        let status = 'unknown';
        if (!lastUpdateTime) {
          status = 'offline';
        } else if (eventAge > 300000) { // > 5 minutes
          status = 'offline';
        } else if (eventAge > 120000) { // > 2 minutes
          status = 'warning';
        } else {
          status = 'online';
        }

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

      // Add entry/exit gate placeholders for future implementation
      const gateDevices = [
        {
          iotId: `iot-${selectedLot}-ENTRY`,
          type: 'entry_gate',
          typeLabel: IOT_TYPES.entry_gate.label,
          icon: IOT_TYPES.entry_gate.icon,
          status: 'unknown',
          slotId: null,
          currentState: 'Not implemented',
          lastUpdate: null,
          isFuture: true,
        },
        {
          iotId: `iot-${selectedLot}-EXIT`,
          type: 'exit_gate',
          typeLabel: IOT_TYPES.exit_gate.label,
          icon: IOT_TYPES.exit_gate.icon,
          status: 'unknown',
          slotId: null,
          currentState: 'Not implemented',
          lastUpdate: null,
          isFuture: true,
        },
      ];

      setIotDevices([...slotDevices, ...gateDevices]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [selectedLot]);

  const selectedLotInfo = LOT_OPTIONS.find(l => l.id === selectedLot);

  const slotDevices = iotDevices.filter(d => d.type === 'slot');
  const gateDevices = iotDevices.filter(d => d.type !== 'slot');

  return (
    <AppLayout title="IoT Monitor" subtitle="Real-time IoT device status">
      <div className="iot-monitor">
        {/* Lot Selector */}
        <div className="lot-selector">
          <label>Select Lot:</label>
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

        {/* Lot Stats */}
        <div className="iot-stats-grid">
          <div className="iot-stat-card">
            <p>Total</p>
            <h3>{lotStats?.totalSlots || 0}</h3>
          </div>
          <div className="iot-stat-card occupied">
            <p>Occupied</p>
            <h3>{lotStats?.occupiedSlots || 0}</h3>
          </div>
          <div className="iot-stat-card free">
            <p>Free</p>
            <h3>{lotStats?.freeSlots || 0}</h3>
          </div>
          <div className="iot-stat-card">
            <p>Rate</p>
            <h3>{lotStats?.occupancyRate || 0}%</h3>
          </div>
        </div>

        {/* Slot Grid - Compact */}
        <div className="slot-grid-section">
          <h3>Slot Status</h3>
          {loading ? (
            <div className="iot-loading">Loading...</div>
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
            <span><span className="legend-dot free"></span> Free</span>
            <span><span className="legend-dot occupied"></span> Occupied</span>
          </div>
        </div>

        {/* Gate Devices */}
        <div className="gate-section">
          <h3>Gate Controllers</h3>
          <div className="gate-grid">
            {gateDevices.map(gate => (
              <div key={gate.iotId} className="gate-card future">
                <span className="gate-icon">{gate.icon}</span>
                <span className="gate-name">{gate.typeLabel}</span>
                <span className="gate-status">Not implemented</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default IoTMonitorPage;