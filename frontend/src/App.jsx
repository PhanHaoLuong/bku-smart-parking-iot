import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import AuthPage from './pages/AuthPage';
import LogoutButton from './components/LogoutButton';
import DashboardPage from './pages/DashboardPage';
import ParkingHistoryPage from './pages/ParkingHistoryPage';
import InfoPage from './pages/InfoPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <main className="app">
        <h1>BKU Smart Parking IoT</h1>
        <Routes>
          {/* Public Route */}
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />
            }
          />

          {/* Protected Route */}
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
            path="parking-history"
            element={
              <ParkingHistoryPage />
            }
          />

          <Route
            path="personal-info"
            element={
              <InfoPage />
            }
          />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
