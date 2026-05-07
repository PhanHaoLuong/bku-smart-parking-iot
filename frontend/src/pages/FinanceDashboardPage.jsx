import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function FinanceDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [outstanding, setOutstanding] = useState(null);
  const [auditLog, setAuditLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [summaryRes, outstandingRes, auditRes] = await Promise.all([
        fetch('/apiv1/billing/dashboard/revenue-summary', { headers }),
        fetch('/apiv1/billing/invoices/outstanding/list', { headers }),
        fetch('/apiv1/billing/audit', { headers }),
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

  if (loading) return <div className="page-container"><p>Loading dashboard...</p></div>;
  if (error) return (
    <div className="page-container">
      <p className="error">Error: {error}</p>
      <button onClick={fetchData}>Retry</button>
    </div>
  );

  const formatVND = (n) => (n || 0).toLocaleString() + ' VND';

  return (
    <div className="page-container">
      <h1>Finance Dashboard</h1>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Collected Revenue</h3>
          <p className="card-value">{formatVND(summary?.collectedRevenue)}</p>
        </div>
        <div className="dashboard-card">
          <h3>Outstanding Revenue</h3>
          <p className="card-value warning">{formatVND(summary?.outstandingRevenue)}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Revenue</h3>
          <p className="card-value">{formatVND(summary?.totalRevenue)}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Revenue Breakdown</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Collected</th>
              <th>Outstanding/Pending</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Learner Invoices</td>
              <td>{formatVND(summary?.learnerRevenue?.paid)}</td>
              <td>{formatVND(summary?.learnerRevenue?.outstanding)}</td>
              <td>{formatVND(summary?.learnerRevenue?.total)}</td>
            </tr>
            <tr>
              <td>Visitor Payments</td>
              <td>{formatVND(summary?.visitorRevenue?.paid)}</td>
              <td>{formatVND(summary?.visitorRevenue?.pending)}</td>
              <td>{formatVND(summary?.visitorRevenue?.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h2>Outstanding Balances</h2>
        {outstanding?.learners?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Total Debt</th>
                <th>Invoices</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.learners.map((l) => (
                <tr key={l.userId}>
                  <td>{l.userName}</td>
                  <td className="warning">{formatVND(l.totalDebt)}</td>
                  <td>{l.invoiceCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No outstanding balances</p>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        {auditLog?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.slice(0, 10).map((entry) => (
                <tr key={entry._id}>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td><span className="badge">{entry.action}</span></td>
                  <td>{entry.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No audit entries</p>
        )}
      </div>

      <div className="dashboard-actions">
        <Link to="/finance/pricing" className="nav-link">Configure Pricing</Link>
        <Link to="/finance/invoices" className="nav-link">Manage Invoices</Link>
        <Link to="/finance/audit" className="nav-link">View Audit Trail</Link>
      </div>
    </div>
  );
}

export default FinanceDashboardPage;
