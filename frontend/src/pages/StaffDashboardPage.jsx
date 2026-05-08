//https://www.figma.com/make/WzzgIHWqZ9dV8XokiMAR02/Operator-Dashboard-Design?p=f
//Dashboard page for monitoring real-time statuses
//Includes: Entry/Exit camera, Exception alerts - queue, Logs, Parking space availability
import { useEffect, useMemo, useState } from 'react';
import { getMonitoringSummary, getSlots, getActiveVehicles } from '../api/monitoringApi.js';
import { getLatestEvents } from '../api/iotApi.js';

function formatDateTime(value) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

function StaffDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function fetchStaffDashboardData() {
      try {
        setError('');

        const [summaryData, slotData, activeVehicleData, eventData] = await Promise.all([
          getMonitoringSummary(),
          getSlots({ limit: 300 }),
          getActiveVehicles({ limit: 100 }),
          getLatestEvents(20),
        ]);

        if (!ignore) {
          setSummary(summaryData);
          setSlots(slotData);
          setActiveVehicles(activeVehicleData);
          setEvents(eventData);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching staff dashboard:', err);
          setError(err.message || 'Unable to load staff dashboard data.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchStaffDashboardData();
    const interval = setInterval(fetchStaffDashboardData, 20000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  const occupiedSlots = useMemo(
    () => slots.filter((slot) => slot.status === 'occupied'),
    [slots]
  );

  const freeSlots = useMemo(
    () => slots.filter((slot) => slot.status === 'free'),
    [slots]
  );

  return (
    <div className="staff-dashboard-page" style={{ padding: 24 }}>
      <h1>Staff Dashboard</h1>
      <p>MongoDB API data: monitoring summary, slot states, active vehicles, and IoT events.</p>

      {loading && <p>Loading staff dashboard data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {summary && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginTop: 20 }}>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Total Slots</p>
            <h2>{summary.totalSlots}</h2>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Occupied Slots</p>
            <h2>{summary.occupiedSlots}</h2>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Free Slots</p>
            <h2>{summary.freeSlots}</h2>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Occupancy Rate</p>
            <h2>{summary.occupancyRate}%</h2>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Active Sessions</p>
            <h2>{summary.activeSessions}</h2>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Entries Today</p>
            <h2>{summary.entriesToday}</h2>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Exits Today</p>
            <h2>{summary.exitsToday}</h2>
          </div>
          <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 12 }}>
            <p>Last Updated</p>
            <h2 style={{ fontSize: 16 }}>{formatDateTime(summary.lastUpdated)}</h2>
          </div>
        </section>
      )}

      <section style={{ marginTop: 28 }}>
        <h2>Slot States</h2>
        <p>Free: {freeSlots.length} | Occupied: {occupiedSlots.length}</p>
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Slot ID</th>
                <th>Lot ID</th>
                <th>Status</th>
                <th>Plate Number</th>
                <th>Last Event</th>
                <th>Last Change</th>
              </tr>
            </thead>
            <tbody>
              {slots.slice(0, 50).map((slot) => (
                <tr key={slot._id || slot.slotId}>
                  <td>{slot.slotId}</td>
                  <td>{slot.iotId}</td>
                  <td>{slot.status}</td>
                  <td>{slot.plateNumber || '-'}</td>
                  <td>{slot.lastEventType || '-'}</td>
                  <td>{formatDateTime(slot.lastChangeTime || slot.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Active Vehicles</h2>
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Vehicle Type</th>
                <th>Slot</th>
                <th>Parking Lot</th>
                <th>Entry Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeVehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  <td>{vehicle.plateNumber}</td>
                  <td>{vehicle.vehicleType || 'N/A'}</td>
                  <td>{vehicle.slotId}</td>
                  <td>{vehicle.parkingLot}</td>
                  <td>{formatDateTime(vehicle.entryTime)}</td>
                  <td>{vehicle.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Latest IoT Events</h2>
        <div style={{ overflowX: 'auto' }}>
          <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Type</th>
                <th>Device</th>
                <th>Lot</th>
                <th>Slot</th>
                <th>Plate</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id || event.eventId}>
                  <td>{event.eventId}</td>
                  <td>{event.eventType}</td>
                  <td>{event.deviceId}</td>
                  <td>{event.lotId}</td>
                  <td>{event.slotId || '-'}</td>
                  <td>{event.plateNumber || '-'}</td>
                  <td>{formatDateTime(event.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default StaffDashboardPage;