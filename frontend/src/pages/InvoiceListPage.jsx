import { useEffect, useState } from 'react';
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
  const role = useAuth((state) => state.role);
  const isFinance = role === 'finance';

  const fetchInvoices = async () => {
    try {
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

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this invoice as paid?')) return;
    try {
      const res = await authedJsonFetch(`/apiv1/billing/invoices/${id}/pay`, {
        method: 'PUT',
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Failed to mark paid');
      await fetchInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatVND = (n) => (n || 0).toLocaleString() + ' VND';

  if (loading) return <AppLayout title="Invoices"><div className="loading">Loading invoices...</div></AppLayout>;

  return (
    <AppLayout title="Invoices" subtitle="Manage invoices">
      <div className="page-header">
        <h1>Invoices</h1>
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

      {error && <p className="error">{error}</p>}

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
              {isFinance && <th>Actions</th>}
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
                {isFinance && (
                  <td>
                    {inv.status === 'pending' && (
                      <button className="btn-small" onClick={() => handleMarkPaid(inv._id)}>Mark Paid</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {invoices.length > 0 && (
        <div className="invoice-details">
          <h3>Invoice Items</h3>
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
