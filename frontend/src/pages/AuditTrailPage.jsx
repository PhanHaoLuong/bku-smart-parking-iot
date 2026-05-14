import { useEffect, useState } from 'react';
import { authedFetch } from '../api/authedFetch';
import AppLayout from '../components/layout/AppLayout';
import '../styles/AppLayout.css';

function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchLogs = async () => {
    try {
      const url = actionFilter
        ? `/apiv1/billing/audit?action=${actionFilter}`
        : '/apiv1/billing/audit';
      const res = await authedFetch(url);
      if (!res.ok) throw new Error('Failed to fetch audit log');
      setLogs(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [actionFilter]);

  const actionOptions = [
    'pricing_created',
    'pricing_updated',
    'pricing_deactivated',
    'invoice_generated',
    'invoice_paid',
    'visitor_paid',
  ];

  if (loading) return <AppLayout title="Nhật ký kiểm tra"><div className="loading">Đang tải nhật ký kiểm tra...</div></AppLayout>;

  return (
    <AppLayout title="Nhật ký kiểm tra" subtitle="Hoạt động hệ thống">
      <div className="page-header">
        <h1>Nhật ký kiểm tra</h1>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="">Tất cả hành động</option>
          {actionOptions.map((opt) => (
            <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {logs.length === 0 ? (
        <p className="empty-state">Chưa có mục kiểm tra nào</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Hành động</th>
              <th>Người thực hiện</th>
              <th>Mô tả</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((entry) => (
              <>
                <tr key={entry._id} className="clickable" onClick={() => setExpandedRow(expandedRow === entry._id ? null : entry._id)}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td><span className="badge">{entry.action.replace(/_/g, ' ')}</span></td>
                  <td>{entry.performedByRole}:{entry.performedBy?.slice(-6) || 'system'}</td>
                  <td>{entry.description}</td>
                  <td>{expandedRow === entry._id ? '▲' : '▼'}</td>
                </tr>
                {expandedRow === entry._id && entry.details && (
                  <tr key={`${entry._id}-details`}>
                    <td colSpan="5">
                      <pre className="details-json">{JSON.stringify(entry.details, null, 2)}</pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </AppLayout>
  );
}

export default AuditTrailPage;
