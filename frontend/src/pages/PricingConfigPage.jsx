import { useEffect, useState } from 'react';
import { authedFetch, authedJsonFetch } from '../api/authedFetch';
import AppLayout from '../components/layout/AppLayout';
import '../styles/AppLayout.css';

function PricingConfigPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    userType: 'learner',
    vehicleType: 'motorcycle',
    pricingMode: 'per-session',
    daytimeRate: 2000,
    eveningRate: 3000,
    firstHourRate: 5000,
    subsequentHourlyRate: 2000,
    discountPercent: 0,
    isFree: false,
    billingCycle: 'monthly',
    billingCycleDay: 1,
  });

  const fetchPolicies = async () => {
    try {
      const res = await authedFetch('/apiv1/billing/policies');
      if (!res.ok) throw new Error('Failed to fetch policies');
      setPolicies(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const resetForm = () => {
    setFormData({
      userType: 'learner',
      vehicleType: 'motorcycle',
      pricingMode: 'per-session',
      daytimeRate: 2000,
      eveningRate: 3000,
      firstHourRate: 5000,
      subsequentHourlyRate: 2000,
      discountPercent: 0,
      isFree: false,
      billingCycle: 'monthly',
      billingCycleDay: 1,
    });
    setEditingPolicy(null);
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy._id);
    setFormData({
      userType: policy.userType,
      vehicleType: policy.vehicleType,
      pricingMode: policy.pricingMode,
      daytimeRate: policy.daytimeRate || 0,
      eveningRate: policy.eveningRate || 0,
      firstHourRate: policy.firstHourRate || 0,
      subsequentHourlyRate: policy.subsequentHourlyRate || 0,
      discountPercent: policy.discountPercent || 0,
      isFree: policy.isFree || false,
      billingCycle: policy.billingCycle || 'monthly',
      billingCycleDay: policy.billingCycleDay || 1,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const body = { ...formData };
      if (formData.pricingMode === 'per-hour') {
        body.daytimeRate = undefined;
        body.eveningRate = undefined;
      } else {
        body.firstHourRate = undefined;
        body.subsequentHourlyRate = undefined;
      }

      let res;
      if (editingPolicy) {
        res = await authedJsonFetch(`/apiv1/billing/policies/${editingPolicy}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        res = await authedJsonFetch('/apiv1/billing/policies', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) throw new Error('Failed to save policy');
      await fetchPolicies();
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Hủy kích hoạt chính sách này?')) return;
    try {
      const res = await authedFetch(`/apiv1/billing/policies/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to deactivate');
      await fetchPolicies();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatRate = (p) => {
    if (p.isFree) return 'Miễn phí';
    if (p.pricingMode === 'per-hour') return `${(p.firstHourRate || 0).toLocaleString()} /giờ`;
    return `${(p.daytimeRate || 0).toLocaleString()} / ${(p.eveningRate || 0).toLocaleString()}`;
  };

  if (loading) return <AppLayout title="Cấu hình giá"><div className="loading">Đang tải chính sách...</div></AppLayout>;

  return (
    <AppLayout title="Cấu hình giá" subtitle="Quản lý chính sách giá">
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          Thêm chính sách mới
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPolicy ? 'Sửa chính sách' : 'Chính sách mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Loại người dùng:
                  <select value={formData.userType} onChange={(e) => setFormData({ ...formData, userType: e.target.value })}>
                    <option value="learner">Học viên</option>
                    <option value="faculty">Giảng viên</option>
                    <option value="staff">Nhân viên</option>
                    <option value="visitor">Khách</option>
                    <option value="default">Mặc định</option>
                  </select>
                </label>
                <label>Phương tiện:
                  <select value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}>
                    <option value="motorcycle">Xe máy</option>
                    <option value="bicycle">Xe đạp</option>
                    <option value="car">Ô tô</option>
                    <option value="any">Bất kỳ (Mặc định)</option>
                  </select>
                </label>
                <label>Chế độ tính giá:
                  <select value={formData.pricingMode} onChange={(e) => setFormData({ ...formData, pricingMode: e.target.value })}>
                    <option value="per-session">Theo phiên</option>
                    <option value="per-hour">Theo giờ</option>
                  </select>
                </label>
              </div>

              {formData.pricingMode === 'per-session' ? (
                <div className="form-row">
                  <label>Giá ban ngày (VND):
                    <input type="number" value={formData.daytimeRate} onChange={(e) => setFormData({ ...formData, daytimeRate: Number(e.target.value) })} />
                  </label>
                  <label>Giá ban đêm (VND):
                    <input type="number" value={formData.eveningRate} onChange={(e) => setFormData({ ...formData, eveningRate: Number(e.target.value) })} />
                  </label>
                  <label>Giảm giá %:
                    <input type="number" min="0" max="100" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })} />
                  </label>
                  <label>
                    <input type="checkbox" checked={formData.isFree} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })} />
                    Miễn phí
                  </label>
                </div>
              ) : (
                <div className="form-row">
                  <label>Giá giờ đầu (VND):
                    <input type="number" value={formData.firstHourRate} onChange={(e) => setFormData({ ...formData, firstHourRate: Number(e.target.value) })} />
                  </label>
                  <label>Giá giờ tiếp theo (VND):
                    <input type="number" value={formData.subsequentHourlyRate} onChange={(e) => setFormData({ ...formData, subsequentHourlyRate: Number(e.target.value) })} />
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {policies.length === 0 ? (
        <p className="empty-state">Chưa có chính sách nào. Nhấn "Thêm chính sách mới" để bắt đầu.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Loại người dùng</th>
              <th>Phương tiện</th>
              <th>Chế độ</th>
              <th>Ban ngày / Ban đêm / Giảm giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {policies.filter((p) => p.isActive).map((p) => {
              const isGlobalDefault = p.userType === 'default';
              return (
                <tr key={p._id} style={isGlobalDefault ? { background: '#fcfcfc', borderLeft: '4px solid #6c757d' } : {}}>
                  <td>{isGlobalDefault ? <strong>MẶC ĐỊNH HỆ THỐNG</strong> : p.userType}</td>
                  <td>{p.vehicleType === 'any' ? 'BẤT KỲ' : p.vehicleType}</td>
                  <td>{p.pricingMode === 'per-session' ? 'Theo phiên' : 'Theo giờ'}</td>
                  <td>{formatRate(p)}{p.discountPercent > 0 ? ` (${p.discountPercent}% off)` : ''}</td>
                  <td>
                    <span className={`badge ${p.isActive ? 'active' : ''}`}>
                      {isGlobalDefault ? 'Hệ thống' : (p.isActive ? 'Hoạt động' : 'Không hoạt động')}
                    </span>
                  </td>
                  <td>
                    <button className="btn-small" onClick={() => handleEdit(p)}>Sửa</button>
                    {!isGlobalDefault && (
                      <button className="btn-small btn-danger" onClick={() => handleDeactivate(p._id)}>Hủy kích hoạt</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </AppLayout>
  );
}

export default PricingConfigPage;
