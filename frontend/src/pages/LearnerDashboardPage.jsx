import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import AppLayout from '../components/layout/AppLayout';
import { authedFetch } from '../api/authedFetch';
import '../styles/AppLayout.css';
import './LearnerDashboard.css';

function LearnerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { username } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [historyRes, invoiceRes] = await Promise.all([
          authedFetch('/apiv1/parking-history'),
          authedFetch('/apiv1/billing/invoices'),
        ]);

        if (!historyRes.ok || !invoiceRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const history = await historyRes.json();
        const invoices = await invoiceRes.json();

        const activeSession = history.find(s => !s.exitTime);
        const completedSessions = history.filter(s => s.exitTime).length;
        const pendingInvoices = invoices.filter(i => i.status === 'pending');
        const totalDebt = pendingInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

        setStats({
          totalSessions: history.length,
          activeSession: activeSession ? 1 : 0,
          activePlate: activeSession?.plateNumber || null,
          completedSessions,
          pendingPayments: pendingInvoices.length,
          totalDebt,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatVND = (n) => (n || 0).toLocaleString() + ' VND';

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-greeting">Hello, {username || 'Learner'}! 👋</span>
          <h1 className="hero-title">Ready to park?</h1>
          <p className="hero-subtitle">
            {stats?.activeSession
              ? `Your vehicle (${stats.activePlate}) is parked`
              : 'No active parking session'}
          </p>
        </div>
        <div className="hero-illustration">
          <div className="parking-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 17v-3a2 2 0 012-2h4a2 2 0 012 2v3M5 17H3a2 2 0 00-2 2v4a2 2 0 002 2h2M21 17h-2a2 2 0 00-2 2v4a2 2 0 002 2h2M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M7 17a2 2 0 104 0M15 17a2 2 0 104 0"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Stats - Display Only (no hover) */}
      <div className="dashboard-stats">
        <div className={`stat-tile ${stats?.activeSession ? 'active' : ''}`}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 17v-3a2 2 0 012-2h4a2 2 0 012 2v3"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.activeSession ? 'Active' : 'None'}</span>
            <span className="stat-label">{stats?.activePlate || 'No vehicle'}</span>
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalSessions || 0}</span>
            <span className="stat-label">Total Sessions</span>
          </div>
        </div>

        <div className="stat-tile">
          <div className="stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.completedSessions || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className={`stat-tile ${stats?.totalDebt > 0 ? 'warning' : 'success'}`}>
          <div className={`stat-icon ${stats?.totalDebt > 0 ? 'amber' : 'green'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.pendingPayments || 0}</span>
            <span className="stat-label">{formatVND(stats?.totalDebt)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Navigation Cards Only */}
      <section className="actions-section">
        <h2 className="section-title">Navigate</h2>
        <div className="actions-grid">
          <Link to="/parking-history" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4l3 3"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </div>
            <div className="action-content">
              <h3>Parking History</h3>
              <p>View your past parking sessions</p>
            </div>
            <span className="action-arrow">→</span>
          </Link>

          <Link to="/info" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="action-content">
              <h3>My Profile</h3>
              <p>View your account details</p>
            </div>
            <span className="action-arrow">→</span>
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

export default LearnerDashboardPage;