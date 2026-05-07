import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from 'react';
import "./App.css";

import LoginPage from "./pages/LoginPage";
import LogoutButton from "./components/LogoutButton";
import DashboardPage from "./pages/DashboardPage";
import LearnerDashboardPage from "./pages/LearnerDashboardPage";
import ParkingHistoryPage from "./pages/ParkingHistoryPage";
import InfoPage from "./pages/InfoPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";

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
            <LearnerDashboardPage />
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
          isAuthenticated ? <InfoPage /> : <Navigate to="/auth" replace />
        }
      />

      <Route
        path="/staff-dashboard"
        element={
          isAuthenticated &&
          (role === "admin" || role === "operator" || role === "staff") ? (
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
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;