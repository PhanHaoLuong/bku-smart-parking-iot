import { useEffect, useState } from 'react';

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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/apiv1/billing/policies', {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

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
        res = await fetch(`/apiv1/billing/policies/${editingPolicy}`, {
          method: 'PUT', headers, body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/apiv1/billing/policies', {
          method: 'POST', headers, body: JSON.stringify(body),
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
    if (!window.confirm('Deactivate this policy?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/apiv1/billing/policies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to deactivate');
      await fetchPolicies();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatRate = (p) => {
    if (p.isFree) return 'Free';
    if (p.pricingMode === 'per-hour') return `${(p.firstHourRate || 0).toLocaleString()} /hr`;
    return `${(p.daytimeRate || 0).toLocaleString()} / ${(p.eveningRate || 0).toLocaleString()}`;
  };

  if (loading) return <div className="page-container"><p>Loading policies...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Pricing Policy Configuration</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          Add New Policy
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPolicy ? 'Edit Policy' : 'New Policy'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>User Type:
                  <select value={formData.userType} onChange={(e) => setFormData({ ...formData, userType: e.target.value })}>
                    <option value="learner">Learner</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                    <option value="visitor">Visitor</option>
                  </select>
                </label>
                <label>Vehicle:
                  <select value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="bicycle">Bicycle</option>
                    <option value="car">Car</option>
                  </select>
                </label>
                <label>Pricing Mode:
                  <select value={formData.pricingMode} onChange={(e) => setFormData({ ...formData, pricingMode: e.target.value })}>
                    <option value="per-session">Per Session</option>
                    <option value="per-hour">Per Hour</option>
                  </select>
                </label>
              </div>

              {formData.pricingMode === 'per-session' ? (
                <div className="form-row">
                  <label>Daytime Rate (VND):
                    <input type="number" value={formData.daytimeRate} onChange={(e) => setFormData({ ...formData, daytimeRate: Number(e.target.value) })} />
                  </label>
                  <label>Evening Rate (VND):
                    <input type="number" value={formData.eveningRate} onChange={(e) => setFormData({ ...formData, eveningRate: Number(e.target.value) })} />
                  </label>
                  <label>Discount %:
                    <input type="number" min="0" max="100" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })} />
                  </label>
                  <label>
                    <input type="checkbox" checked={formData.isFree} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })} />
                    Free
                  </label>
                </div>
              ) : (
                <div className="form-row">
                  <label>First Hour (VND):
                    <input type="number" value={formData.firstHourRate} onChange={(e) => setFormData({ ...formData, firstHourRate: Number(e.target.value) })} />
                  </label>
                  <label>Subsequent Hour (VND):
                    <input type="number" value={formData.subsequentHourlyRate} onChange={(e) => setFormData({ ...formData, subsequentHourlyRate: Number(e.target.value) })} />
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {policies.length === 0 ? (
        <p className="empty-state">No policies configured. Click "Add New Policy" to start.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>User Type</th>
              <th>Vehicle</th>
              <th>Mode</th>
              <th>Day / Evening / Discount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.filter((p) => p.isActive).map((p) => (
              <tr key={p._id}>
                <td>{p.userType}</td>
                <td>{p.vehicleType}</td>
                <td>{p.pricingMode}</td>
                <td>{formatRate(p)}{p.discountPercent > 0 ? ` (${p.discountPercent}% off)` : ''}</td>
                <td><span className={`badge ${p.isActive ? 'active' : ''}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <button className="btn-small" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => handleDeactivate(p._id)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PricingConfigPage;
