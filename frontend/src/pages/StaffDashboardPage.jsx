import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { authedFetch } from '../api/authedFetch';
import '../styles/AppLayout.css';

function StaffDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [summaryRes, slotsRes, vehiclesRes] = await Promise.all([
        authedFetch('/apiv1/monitoring/summary'),
        authedFetch('/apiv1/monitoring/slots'),
        authedFetch('/apiv1/monitoring/active-vehicles'),
      ]);

      if (!summaryRes.ok || !slotsRes.ok || !vehiclesRes.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      setSummary(await summaryRes.json());
      setSlots(await slotsRes.json());
      setVehicles(await vehiclesRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  const formatVND = (n) => (n || 0).toLocaleString() + ' VND';

  const content = (
    <>
      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải bảng điều khiển...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Tổng số chỗ</p>
              <h3>{summary?.totalSlots || 0}</h3>
              <span>Chỗ đỗ xe</span>
            </div>

            <div className="stat-card">
              <p>Đã đỗ</p>
              <h3>{summary?.occupiedSlots || 0}</h3>
              <span>{summary?.occupancyRate || 0}% đã sử dụng</span>
            </div>

            <div className="stat-card">
              <p>Trống</p>
              <h3 style={{ color: '#10b981' }}>{summary?.freeSlots || 0}</h3>
              <span>Còn trống</span>
            </div>

            <div className="stat-card">
              <p>Phương tiện hoạt động</p>
              <h3>{summary?.activeSessions || 0}</h3>
              <span>Phương tiện đang đỗ</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h2>Chỗ đỗ xe</h2>
                <p>Tình trạng chỗ hiện tại</p>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Chỗ</th>
                    <th>Trạng thái</th>
                    <th>Biển số</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.slice(0, 10).map((slot) => (
                    <tr key={slot.slotId}>
                      <td>{slot.slotId}</td>
                      <td>
                        <span className={`badge ${slot.status === 'occupied' ? 'badge-pending' : 'badge-active'}`}>
                          {slot.status}
                        </span>
                      </td>
                      <td>{slot.plateNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Phương tiện hoạt động</h2>
                <p>Phương tiện đang đỗ</p>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Biển số</th>
                    <th>Giờ vào</th>
                    <th>Chỗ</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 10).map((v) => (
                    <tr key={v._id}>
                      <td>{v.plateNumber}</td>
                      <td>{formatDate(v.entryTime)}</td>
                      <td>{v.slotId || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h2>Hoạt động hôm nay</h2>
            </div>
            <div style={{ display: 'flex', gap: '32px', padding: '16px 0' }}>
              <div>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Lượt vào</p>
                <h3 style={{ margin: '4px 0 0' }}>{summary?.entriesToday || 0}</h3>
              </div>
              <div>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Lượt ra</p>
                <h3 style={{ margin: '4px 0 0' }}>{summary?.exitsToday || 0}</h3>
              </div>
              <div>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Cập nhật lần cuối</p>
                <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{formatDate(summary?.lastUpdated)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <AppLayout title="Bảng điều khiển nhân viên" subtitle="Giám sát bãi đỗ">
      {content}
    </AppLayout>
  );
}

export default StaffDashboardPage;