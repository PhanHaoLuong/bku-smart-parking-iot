import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import AuthPage from './pages/AuthPage';
import LogoutButton from './components/LogoutButton';

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
              isAuthenticated ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />
            }
          />

          {/* Protected Route */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <div>
                  <h2>Welcome to the Dashboard</h2>
                  <LogoutButton onLogout={handleLogout} />
                </div>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
