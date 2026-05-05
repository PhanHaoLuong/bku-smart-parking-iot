import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/LoginPage';
import LogoutButton from './components/LogoutButton';
import DashboardPage from './pages/DashboardPage';
import ParkingHistoryPage from './pages/ParkingHistoryPage';
import InfoPage from './pages/InfoPage';
import StaffDashboardPage from './pages/StaffDashboardPage';

import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { isAuthenticated, role, userId, handleLogin, handleLogout } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
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
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/parking-history"
        element={
          isAuthenticated ? (
            <ParkingHistoryPage role={role} userId={userId} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/info"
        element={
          isAuthenticated ? (
            <InfoPage />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/staff-dashboard"
        element={
          isAuthenticated && (role === 'admin' || role === 'operator') ? (
            <StaffDashboardPage />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;