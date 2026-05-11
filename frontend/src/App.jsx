import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

import ParkingHistoryPage from './pages/ParkingHistoryPage';
import InfoPage from './pages/InfoPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import FinanceDashboardPage from './pages/FinanceDashboardPage';
import PricingConfigPage from './pages/PricingConfigPage';
import InvoiceListPage from './pages/InvoiceListPage';
import AuditTrailPage from './pages/AuditTrailPage';
import LoginPage from "./pages/LoginPage";
import LogoutButton from "./components/LogoutButton";
import DashboardPage from "./pages/DashboardPage";
import LearnerDashboardPage from "./pages/LearnerDashboardPage";

import { useAuth } from './stores/authStore';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;  
}

function AppRoutes() {
  const { isAuthenticated, role, userId, handleLogin, handleLogout, syncFromSession } = useAuth();

  // Role to dashboard route mapping
  const roleConfig = {
    finance: { dashboard: '/finance-dashboard', redirect: '/finance-dashboard' },
    operator: { dashboard: '/staff-dashboard', redirect: '/staff-dashboard' },
    learner: { dashboard: '/dashboard', redirect: null },
    faculty: { dashboard: '/dashboard', redirect: null },
  };

  const config = roleConfig[role] || roleConfig.learner;
  const isFinance = role === 'finance';

  // Redirect after login based on role
  const getLoginRedirect = () => config.redirect || '/dashboard';

  useEffect(() => {
    void syncFromSession();
  }, [syncFromSession]);

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          isAuthenticated ? (
            <Navigate to={getLoginRedirect()} replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {isFinance ? (
              <Navigate to="/finance-dashboard" replace />
            ) : (
              <LearnerDashboardPage role={role} userId={userId} />
            )}
          </ProtectedRoute>
        }
      />
      <Route path="/parking-history" element={<ProtectedRoute><ParkingHistoryPage role={role} userId={userId} /></ProtectedRoute>} />
      <Route path="/info" element={<ProtectedRoute><InfoPage /></ProtectedRoute>} />
      <Route path="/staff-dashboard" element={<ProtectedRoute><StaffDashboardPage /></ProtectedRoute>} />

      {isFinance && (
        <>
          <Route path="/finance-dashboard" element={<ProtectedRoute><FinanceDashboardPage /></ProtectedRoute>} />
          <Route path="/finance/pricing" element={<ProtectedRoute><PricingConfigPage /></ProtectedRoute>} />
          <Route path="/finance/invoices" element={<ProtectedRoute><InvoiceListPage /></ProtectedRoute>} />
          <Route path="/finance/audit" element={<ProtectedRoute><AuditTrailPage /></ProtectedRoute>} />
        </>
      )}

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