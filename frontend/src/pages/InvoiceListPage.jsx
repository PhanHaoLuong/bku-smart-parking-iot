import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import { authedFetch, authedJsonFetch } from '../api/authedFetch';
import AppLayout from '../components/layout/AppLayout';
import '../styles/AppLayout.css';

function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [generating, setGenerating] = useState(false);
  const { role, username } = useAuth();
  const isFinance = role === 'finance';
  const isEndUser = role === 'learner' || role === 'faculty';

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = statusFilter
        ? `/apiv1/billing/invoices?status=${statusFilter}`
        : '/apiv1/billing/invoices';
      const res = await authedFetch(url);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      setInvoices(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [statusFilter]);

  const handleGenerate = async () => {
    if (!window.confirm('Generate invoices for current billing cycle?')) return;
    setGenerating(true);
    try {
      const res = await authedJsonFetch('/apiv1/billing/invoices/generate', {
        method: 'POST',
        body: JSON.stringify({ cycleEndDate: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to generate invoices');
      const result = await res.json();
      alert(`Generated ${result.generatedCount} invoices`);
      await fetchInvoices();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSettleInvoice = async (invoice) => {
    const confirmMessage = isFinance
      ? 'Mark this invoice as paid?'
      : `Pay ${formatVND(invoice.totalAmount)} now?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await authedJsonFetch(`/apiv1/billing/invoices/${invoice._id}/pay`, {
        method: 'PUT',
        body: JSON.stringify({ paidAmount: invoice.totalAmount }),
      });
      if (!res.ok) throw new Error('Failed to mark paid');
      await fetchInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatVND = (n) => (n || 0).toLocaleString() + ' VND';
  const totalBilled = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const outstandingInvoices = invoices.filter((inv) => ['pending', 'overdue'].includes(inv.status));
  const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.paidAmount || inv.totalAmount || 0), 0);

  if (loading) return <AppLayout title="Invoices"><div className="loading">Loading invoices...</div></AppLayout>;

  return (
    <AppLayout title="Invoices" subtitle="Manage invoices">
      <div className="page-header">
        <div>
          <h1>{isFinance ? 'Invoices' : 'My Billing'}</h1>
          <p>{isFinance ? 'Manage billing cycles and settle invoices.' : 'Your bill is calculated from completed parking sessions in parking history.'}</p>
        </div>
        <div className="header-actions">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          {isFinance && (
            <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Invoices'}
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>{isFinance ? 'Total Billed' : 'Current Bill'}</h3>
          <p className="card-value">{formatVND(totalBilled)}</p>
        </div>
        <div className="dashboard-card">
          <h3>{isFinance ? 'Open Invoices' : 'Outstanding Balance'}</h3>
          <p className="card-value warning">{formatVND(outstandingAmount)}</p>
        </div>
        <div className="dashboard-card">
          <h3>{isFinance ? 'Settled Invoices' : 'Paid Amount'}</h3>
          <p className="card-value">{formatVND(paidAmount)}</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {isEndUser && (
        <div className="card">
          <h3>How payment works</h3>
          <p>
            {username ? `${username}, your bill is generated ` : 'Your bill is generated '}
            from completed parking sessions and shows the exact session breakdown.
            Use the billing page to review the amount due, then pay the open invoice directly.
          </p>
          <p>
            <Link to="/parking-history">View parking history</Link> to compare the sessions that fed the bill.
          </p>
        </div>
      )}

      {invoices.length === 0 ? (
        <p className="empty-state">No invoices found</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Total</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Sessions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td>{new Date(inv.billingPeriodStart).toLocaleDateString()} - {new Date(inv.billingPeriodEnd).toLocaleDateString()}</td>
                <td>{formatVND(inv.totalAmount)}</td>
                <td><span className={`badge badge-${inv.status}`}>{inv.status}</span></td>
                <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td>{(inv.items || []).length}</td>
                <td>
                  {(inv.status === 'pending' || inv.status === 'overdue') && (
                    <button className="btn-small" onClick={() => handleSettleInvoice(inv)}>
                      {isFinance ? 'Mark Paid' : 'Pay Now'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {invoices.length > 0 && (
        <div className="invoice-details">
          <h3>{isFinance ? 'Invoice Items' : 'How Your Bill Was Calculated'}</h3>
          {invoices.filter((inv) => (inv.items || []).length > 0).slice(0, 3).map((inv) => (
            <div key={inv._id} className="card">
              <h4>Invoice #{inv._id.slice(-6)} ({inv.status})</h4>
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>Plate</th>
                    <th>Entry</th>
                    <th>Exit</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(inv.items || []).map((item, i) => (
                    <tr key={i}>
                      <td>{item.plateNumber}</td>
                      <td>{new Date(item.entryTime).toLocaleString()}</td>
                      <td>{new Date(item.exitTime).toLocaleString()}</td>
                      <td>{formatVND(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default InvoiceListPage;
