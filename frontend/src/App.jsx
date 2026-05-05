import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import AuthPage from './pages/AuthPage';
import LogoutButton from './components/LogoutButton';
import DashboardPage from './pages/DashboardPage';
import ParkingHistoryPage from './pages/ParkingHistoryPage';
import InfoPage from './pages/InfoPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import { useAuth } from './stores/authStore';

// ✅ Moved outside to avoid re-creating on every render
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth" />;

  if (requiredRole && role !== 'admin' && role !== 'operator') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, role, userId, handleLogin, handleLogout, syncFromSession } = useAuth();

  useEffect(() => {
    void syncFromSession();
  }, [syncFromSession]);

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />}
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <div>
              <h2>Welcome to the Dashboard</h2>
              <DashboardPage />
              <LogoutButton onLogout={handleLogout} />
            </div>
          ) : (
            <Navigate to="/auth" />
          )
        }
      />
      <Route
        path="/parking-history"
        element={
          <ProtectedRoute>
            <ParkingHistoryPage role={role} userId={userId} />
          </ProtectedRoute>
        }
      />
      <Route path="/info" element={<InfoPage />} />
      <Route
        path="/staff-dashboard"
        element={
          <ProtectedRoute requiredRole="admin-or-operator">
            {role === 'admin' || role === 'operator' ? (
              <div>
                <StaffDashboardPage />
                <LogoutButton onLogout={handleLogout} />
              </div>
            ) : (
              <Navigate to="/dashboard" />
            )}
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;