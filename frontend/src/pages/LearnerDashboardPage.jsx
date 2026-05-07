import { Link } from 'react-router-dom';
import { useAuth } from '../stores/authStore.js';
import '../styles/LearnerDashboardPage.css';

function LearnerDashboardPage() {
  const { userId, role, handleLogout } = useAuth();

  return (
    <div className="learner-dashboard">
      <aside className="learner-sidebar">
        <div className="learner-logo">
          <h2>BKU Parking</h2>
          <p>Learner Portal</p>
        </div>

        <nav className="learner-nav">
          <Link to="/dashboard" className="learner-nav-link active">
            Dashboard
          </Link>

          <Link to="/parking-history" className="learner-nav-link">
            Parking History
          </Link>

          <Link to="/info" className="learner-nav-link">
            Personal Info
          </Link>
        </nav>

        <button className="learner-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="learner-main">
        <header className="learner-header">
          <div>
            <p className="learner-subtitle">Welcome back</p>
            <h1>Learner Dashboard</h1>
          </div>

          <div className="learner-user-badge">
            <span>{role || 'learner'}</span>
          </div>
        </header>

        <section className="learner-welcome-card">
          <div>
            <h2>Hello, {userId || 'Learner'}</h2>
            <p>
              Manage your parking information, check your history, and follow
              your parking activities in BKU Smart Parking.
            </p>
          </div>
        </section>

        <section className="learner-stats-grid">
          <div className="learner-stat-card">
            <p>Current Session</p>
            <h3>None</h3>
            <span>No active parking session</span>
          </div>

          <div className="learner-stat-card">
            <p>Parking Records</p>
            <h3>12</h3>
            <span>Total parking records</span>
          </div>

          <div className="learner-stat-card">
            <p>Pending Payment</p>
            <h3>1</h3>
            <span>Payment waiting for action</span>
          </div>

          <div className="learner-stat-card">
            <p>Vehicle Status</p>
            <h3>Registered</h3>
            <span>Your vehicle is active</span>
          </div>
        </section>

        <section className="learner-section">
          <div className="learner-section-header">
            <h2>Quick Actions</h2>
            <p>Common actions for learner users</p>
          </div>

          <div className="learner-action-grid">
            <Link to="/parking-history" className="learner-action-card">
              <h3>View Parking History</h3>
              <p>Check your previous parking sessions and details.</p>
            </Link>

            <Link to="/info" className="learner-action-card">
              <h3>Personal Information</h3>
              <p>View your account and vehicle information.</p>
            </Link>

            <Link to="/dashboard" className="learner-action-card">
              <h3>Find Parking Slot</h3>
              <p>Search for available parking slots near your area.</p>
            </Link>

            <Link to="/dashboard" className="learner-action-card">
              <h3>Payment</h3>
              <p>Review and complete your pending parking payments.</p>
            </Link>
          </div>
        </section>

        <section className="learner-recent-card">
          <div className="learner-section-header">
            <h2>Recent Activity</h2>
            <p>Your latest parking activities will appear here</p>
          </div>

          <div className="learner-empty-state">
            No recent activity available.
          </div>
        </section>
      </main>
    </div>
  );
}

export default LearnerDashboardPage;