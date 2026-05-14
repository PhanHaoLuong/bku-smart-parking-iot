import { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { authedFetch } from '../api/authedFetch';
import '../styles/AppLayout.css';

function InfoItem({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e1e5eb' }}>
      <span style={{ color: '#6b7280' }}>{label}</span>
      <strong style={{ color: '#1a1a2e' }}>{value || 'Không có'}</strong>
    </div>
  );
}

function InfoPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const response = await authedFetch('/apiv1/auth/user-info');

        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userData = await response.json();
        setUserInfo(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const content = (
    <>
      {error && <div className="error">Error: {error}</div>}

      {loading ? (
        <div className="loading">Đang tải thông tin cá nhân...</div>
      ) : !userInfo ? (
        <div className="empty-state">Không có thông tin người dùng.</div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#2563eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {userInfo.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>{userInfo.fullName || 'Người dùng học viên'}</h2>
                <p style={{ margin: '4px 0 0', color: '#6b7280' }}>{userInfo.email || 'Không có email'}</p>
                <span className="badge badge-active" style={{ marginTop: '8px' }}>{userInfo.role || 'learner'}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Chi tiết tài khoản</h2>
            </div>
            <div style={{ marginTop: '8px' }}>
              <InfoItem label="Tên đăng nhập" value={userInfo.username} />
              <InfoItem label="Họ và tên" value={userInfo.fullName} />
              <InfoItem label="Email" value={userInfo.email} />
              <InfoItem label="Vai trò" value={userInfo.role} />
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <AppLayout title="Thông tin cá nhân" subtitle="Xem hồ sơ của bạn">
      {content}
    </AppLayout>
  );
}

export default InfoPage;