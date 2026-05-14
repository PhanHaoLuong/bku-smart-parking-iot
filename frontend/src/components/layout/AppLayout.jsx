import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../stores/authStore.js';
import '../../styles/AppLayout.css';

const MENU_ITEMS = {
  learner: [
    { to: '/dashboard', label: 'Bảng điều khiển', icon: '◉' },
    { to: '/parking-history', label: 'Lịch sử đỗ xe', icon: '◷' },
    { to: '/info', label: 'Thông tin cá nhân', icon: '◈' },
  ],
  operator: [
    { to: '/staff-dashboard', label: 'Bảng điều khiển', icon: '◉' },
    { to: '/iot-monitor', label: 'Giám sát IoT', icon: '◈' },
    { to: '/parking-history', label: 'Lịch sử đỗ xe', icon: '◷' },
    { to: '/info', label: 'Thông tin cá nhân', icon: '▭' },
  ],
  faculty: [
    { to: '/dashboard', label: 'Bảng điều khiển', icon: '◉' },
    { to: '/parking-history', label: 'Lịch sử đỗ xe', icon: '◷' },
    { to: '/info', label: 'Thông tin cá nhân', icon: '◈' },
  ],
  finance: [
    { to: '/finance-dashboard', label: 'Bảng điều khiển', icon: '◉' },
    { to: '/finance/pricing', label: 'Cấu hình giá', icon: '◷' },
    { to: '/finance/invoices', label: 'Hóa đơn', icon: '◈' },
    { to: '/finance/audit', label: 'Nhật ký kiểm tra', icon: '◇' },
    { to: '/info', label: 'Thông tin cá nhân', icon: '▭' },
  ],
};

function AppLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const { role, username, handleLogout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = MENU_ITEMS[role] || MENU_ITEMS.learner;

  const onLogout = async () => {
    await handleLogout();
    navigate('/auth');
  };

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <h2>BKU Parking</h2>
          <span className="role-badge">{role}</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>

          <div className="header-title">
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
            <h1>{title}</h1>
          </div>

          <div className="header-user">
            <span className="username">{username}</span>
          </div>
        </header>

        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppLayout;