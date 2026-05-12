import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { login } from '../api/authApi';
import logo from '../assets/logo-HCMUT.png';
import '../styles/LoginPage.css';

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin({ username, password }) {
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);

      const data = await login(username, password);

      if (onLogin) {
        onLogin(data.user);
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-back">
          <Link to="/signage" className="login-back-btn">← Bản đồ</Link>
        </div>
        <div className="login-header">
          <img src={logo} alt="HCMUT Logo" className="login-logo" />
          <h1>BKU Smart Parking</h1>
          <p>Login to manage your parking account</p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}

export default LoginPage;