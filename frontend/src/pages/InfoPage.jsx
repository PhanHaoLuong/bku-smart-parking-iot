import { useEffect, useState } from 'react';
import LearnerLayout from '../components/learner/LearnerLayout';
import '../styles/InfoPage.css';

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value || 'Not available'}</strong>
    </div>
  );
}

function InfoPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch('/apiv1/auth/user-info', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userData = await response.json();
        setUserInfo(userData);
      } catch (fetchError) {
        console.error('Error fetching user info:', fetchError);
        setError('Unable to load personal information.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <LearnerLayout
      title="Personal Information"
      subtitle="View your learner profile"
    >
      {loading && (
        <div className="info-state-card">
          Loading personal information...
        </div>
      )}

      {error && (
        <div className="info-error-card">
          {error}
        </div>
      )}

      {!loading && !error && !userInfo && (
        <div className="info-state-card">
          No user information available.
        </div>
      )}

      {!loading && !error && userInfo && (
        <div className="info-page-grid">
          <section className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {userInfo.fullName
                  ? userInfo.fullName.charAt(0).toUpperCase()
                  : 'U'}
              </div>

              <div>
                <h2>{userInfo.fullName || 'Learner User'}</h2>
                <p>{userInfo.email || 'No email available'}</p>
              </div>
            </div>

            <div className="profile-role-badge">
              {userInfo.role || 'learner'}
            </div>
          </section>

          <section className="info-card">
            <div className="info-card-header">
              <h2>Account Details</h2>
              <p>Basic information connected to your BKU Parking account.</p>
            </div>

            <div className="info-list">
              <InfoItem label="Username" value={userInfo.username} />
              <InfoItem label="Full Name" value={userInfo.fullName} />
              <InfoItem label="Email" value={userInfo.email} />
              <InfoItem label="Role" value={userInfo.role} />
            </div>
          </section>

          <section className="info-card">
            <div className="info-card-header">
              <h2>Vehicle Information</h2>
              <p>Your registered vehicle information.</p>
            </div>

            <div className="info-list">
              <InfoItem
                label="Plate Number"
                value={userInfo.plateNumber || '50H-10962'}
              />

              <InfoItem
                label="Vehicle Type"
                value={userInfo.vehicleType || 'Motorbike'}
              />

              <InfoItem
                label="Registration Status"
                value={userInfo.vehicleStatus || 'Registered'}
              />
            </div>
          </section>

          <section className="info-card full-width">
            <div className="info-card-header">
              <h2>Account Status</h2>
              <p>Current status of your learner account.</p>
            </div>

            <div className="status-panel">
              <div>
                <span className="status-dot"></span>
                <strong>Active account</strong>
              </div>

              <p>
                Your account is currently active and allowed to access learner
                parking services.
              </p>
            </div>
          </section>
        </div>
      )}
    </LearnerLayout>
  );
}

export default InfoPage;