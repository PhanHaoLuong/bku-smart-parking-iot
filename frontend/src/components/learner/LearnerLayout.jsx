import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/LearnerLayout.css';

function LearnerLayout({ children, title, subtitle }) {
  const { role, handleLogout } = useAuth();

  return (
    <div className="learner-layout">
      <aside className="learner-layout-sidebar">
        <div className="learner-layout-logo">
          <h2>BKU Parking</h2>
          <p>Learner Portal</p>
        </div>

        <nav className="learner-layout-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'learner-layout-nav-link active'
                : 'learner-layout-nav-link'
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/parking-history"
            className={({ isActive }) =>
              isActive
                ? 'learner-layout-nav-link active'
                : 'learner-layout-nav-link'
            }
          >
            Parking History
          </NavLink>

          <NavLink
            to="/info"
            className={({ isActive }) =>
              isActive
                ? 'learner-layout-nav-link active'
                : 'learner-layout-nav-link'
            }
          >
            Personal Info
          </NavLink>
        </nav>

        <button className="learner-layout-logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="learner-layout-main">
        <header className="learner-layout-header">
          <div>
            <p className="learner-layout-subtitle">{subtitle}</p>
            <h1>{title}</h1>
          </div>

          <div className="learner-layout-role-badge">
            {role || 'learner'}
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default LearnerLayout;