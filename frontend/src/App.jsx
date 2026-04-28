import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
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
      <Route path="/parking-history" element={<ParkingHistoryPage role={role} userId={userId} />} />
      <Route path="/info" element={<InfoPage />} />
      <Route path="/staff-dashboard" element={<StaffDashboardPage />} />
      <Route path="*" element={<Navigate to="/auth" />} />
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
