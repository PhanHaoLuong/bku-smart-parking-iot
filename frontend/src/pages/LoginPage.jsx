import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import { login } from "../api/authApi";
import { saveToken } from "../utils/authStorage";
import "../styles/LoginPage.css";

function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin({ username, password }) {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(username, password);

      saveToken(data.token);

      if (onLogin) {
        onLogin();
      }

      const [, role] = data.token.split("-");

      if (role === "admin" || role === "operator" || role === "staff") {
        navigate("/staff-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>BKU Smart Parking</h1>
          <p>Login to manage your parking account</p>
        </div>

        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
      </div>
    </div>
  );
}

export default LoginPage;