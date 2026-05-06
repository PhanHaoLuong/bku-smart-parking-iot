import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import LoginPage from "./pages/LoginPage";
import LearnerDashboardPage from "./pages/LearnerDashboardPage";
import ParkingHistoryPage from "./pages/ParkingHistoryPage";
import InfoPage from "./pages/InfoPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppRoutes() {
  const { isAuthenticated, role, userId, handleLogin } = useAuth();

  const isStaffRole =
    role === "admin" || role === "operator" || role === "staff";

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isStaffRole ? (
              <Navigate to="/staff-dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/auth"
        element={
          isAuthenticated ? (
            isStaffRole ? (
              <Navigate to="/staff-dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            isStaffRole ? (
              <Navigate to="/staff-dashboard" replace />
            ) : (
              <LearnerDashboardPage />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/parking-history"
        element={
          isAuthenticated ? (
            isStaffRole ? (
              <Navigate to="/staff-dashboard" replace />
            ) : (
              <ParkingHistoryPage role={role} userId={userId} />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/info"
        element={
          isAuthenticated ? (
            isStaffRole ? (
              <Navigate to="/staff-dashboard" replace />
            ) : (
              <InfoPage />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route
        path="/staff-dashboard"
        element={
          isAuthenticated ? (
            isStaffRole ? (
              <StaffDashboardPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
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