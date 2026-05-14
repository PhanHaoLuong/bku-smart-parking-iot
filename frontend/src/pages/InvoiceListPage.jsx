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
    if (!window.confirm('Tạo hóa đơn cho chu kỳ thanh toán hiện tại?')) return;
    setGenerating(true);
    try {
      const res = await authedJsonFetch('/apiv1/billing/invoices/generate', {
        method: 'POST',
        body: JSON.stringify({ cycleEndDate: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to generate invoices');
      const result = await res.json();
      alert(`Đã tạo ${result.generatedCount} hóa đơn`);
      await fetchInvoices();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSettleInvoice = async (invoice) => {
    const confirmMessage = isFinance
      ? 'Đánh dấu hóa đơn này là đã thanh toán?'
      : `Thanh toán ${formatVND(invoice.totalAmount)} ngay?`;

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

  if (loading) return <AppLayout title="Hóa đơn"><div className="loading">Đang tải hóa đơn...</div></AppLayout>;

  return (
    <AppLayout title="Hóa đơn" subtitle="Quản lý hóa đơn">
      <div className="page-header">
        <div>
          <h1>{isFinance ? 'Hóa đơn' : 'Hóa đơn của tôi'}</h1>
          <p>{isFinance ? 'Quản lý chu kỳ thanh toán và thanh toán hóa đơn.' : 'Hóa đơn được tính từ các phiên đỗ xe đã hoàn thành trong lịch sử đỗ xe.'}</p>
        </div>
        <div className="header-actions">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="overdue">Quá hạn</option>
          </select>
          {isFinance && (
            <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Đang tạo...' : 'Tạo hóa đơn'}
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>{isFinance ? 'Tổng tiền' : 'Hóa đơn hiện tại'}</h3>
          <p className="card-value">{formatVND(totalBilled)}</p>
        </div>
        <div className="dashboard-card">
          <h3>{isFinance ? 'Hóa đơn chưa thanh toán' : 'Số dư chưa thanh toán'}</h3>
          <p className="card-value warning">{formatVND(outstandingAmount)}</p>
        </div>
        <div className="dashboard-card">
          <h3>{isFinance ? 'Hóa đơn đã thanh toán' : 'Đã thanh toán'}</h3>
          <p className="card-value">{formatVND(paidAmount)}</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {isEndUser && (
        <div className="card">
          <h3>Cách thanh toán</h3>
          <p>
            {username ? `${username}, hóa đơn của bạn được tạo ` : 'Hóa đơn của bạn được tạo '}
            từ các phiên đỗ xe đã hoàn thành và hiển thị chi tiết từng phiên.
            Sử dụng trang thanh toán để xem số tiền cần trả, sau đó thanh toán hóa đơn đang mở.
          </p>
          <p>
            <Link to="/parking-history">Xem lịch sử đỗ xe</Link> để so sánh các phiên đã tạo hóa đơn.
          </p>
        </div>
      )}

      {invoices.length === 0 ? (
        <p className="empty-state">Không tìm thấy hóa đơn</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Kỳ</th>
              <th>Tổng</th>
              <th>Trạng thái</th>
              <th>Hạn thanh toán</th>
              <th>Phiên</th>
              <th>Thao tác</th>
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
                      {isFinance ? 'Đánh dấu đã trả' : 'Thanh toán'}
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
          <h3>{isFinance ? 'Chi tiết hóa đơn' : 'Chi tiết tính tiền'}</h3>
          {invoices.filter((inv) => (inv.items || []).length > 0).slice(0, 3).map((inv) => (
            <div key={inv._id} className="card">
              <h4>Invoice #{inv._id.slice(-6)} ({inv.status})</h4>
              <table className="data-table compact">
                <thead>
                  <tr>
                    <th>Biển số</th>
                    <th>Giờ vào</th>
                    <th>Giờ ra</th>
                    <th>Số tiền</th>
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
