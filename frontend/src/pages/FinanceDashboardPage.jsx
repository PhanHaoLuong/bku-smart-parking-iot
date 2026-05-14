import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { authedFetch } from '../api/authedFetch';
import '../styles/AppLayout.css';

function FinanceDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [outstanding, setOutstanding] = useState(null);
  const [auditLog, setAuditLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [summaryRes, outstandingRes, auditRes] = await Promise.all([
        authedFetch('/apiv1/billing/dashboard/revenue-summary'),
        authedFetch('/apiv1/billing/invoices/outstanding/list'),
        authedFetch('/apiv1/billing/audit'),
      ]);

      if (!summaryRes.ok || !outstandingRes.ok || !auditRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      setSummary(await summaryRes.json());
      setOutstanding(await outstandingRes.json());
      setAuditLog(await auditRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatVND = (n) => (n || 0).toLocaleString() + ' VND';

  const content = (
    <>
      {error && (
        <div className="error">
          {error}
          <button className="btn btn-secondary" onClick={fetchData} style={{ marginLeft: '12px' }}>
            Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải bảng tài chính...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Doanh thu</p>
              <h3>{formatVND(summary?.collectedRevenue)}</h3>
              <span>Hóa đơn đã thanh toán + khách</span>
            </div>
            <div className="stat-card">
              <p>Chưa thu</p>
              <h3 style={{ color: '#f59e0b' }}>{formatVND(summary?.outstandingRevenue)}</h3>
              <span>Thanh toán đang chờ</span>
            </div>
            <div className="stat-card">
              <p>Tổng doanh thu</p>
              <h3>{formatVND(summary?.totalRevenue)}</h3>
              <span>Tất cả thời gian</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h2>Chi tiết doanh thu</h2>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nguồn</th>
                    <th>Đã thu</th>
                    <th>Chưa thu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hóa đơn học viên</td>
                    <td>{formatVND(summary?.learnerRevenue?.paid)}</td>
                    <td>{formatVND(summary?.learnerRevenue?.outstanding)}</td>
                  </tr>
                  <tr>
                    <td>Thanh toán khách</td>
                    <td>{formatVND(summary?.visitorRevenue?.paid)}</td>
                    <td>{formatVND(summary?.visitorRevenue?.pending)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-header">
                <h2>Hóa đơn chưa thanh toán</h2>
              </div>
              {outstanding?.learners?.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Người dùng</th>
                      <th>Tổng</th>
                      <th>Hóa đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstanding.learners.map((l) => (
                      <tr key={l.userId}>
                        <td>{l.userName}</td>
                        <td style={{ color: '#f59e0b' }}>{formatVND(l.totalDebt)}</td>
                        <td>{l.invoiceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">Không có công nợ</div>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h2>Hoạt động gần đây</h2>
            </div>
            {auditLog?.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Hành động</th>
                    <th>Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.slice(0, 10).map((entry) => (
                    <tr key={entry._id}>
                      <td>{new Date(entry.timestamp).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-active">{entry.action}</span>
                      </td>
                      <td>{entry.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">Không có mục kiểm tra</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Link to="/finance/pricing" className="btn btn-secondary">Cấu hình giá</Link>
            <Link to="/finance/invoices" className="btn btn-secondary">Quản lý hóa đơn</Link>
            <Link to="/finance/audit" className="btn btn-secondary">Nhật ký kiểm tra</Link>
          </div>
        </>
      )}
    </>
  );

  return (
    <AppLayout title="Bảng tài chính" subtitle="Tổng quan doanh thu">
      {content}
    </AppLayout>
  );
}

export default FinanceDashboardPage;