import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      <h1>{isLogin ? 'Login' : 'Signup'}</h1>
      {isLogin ? <LoginForm onLogin={onLogin} /> : <SignupForm />}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Switch to Signup' : 'Switch to Login'}
      </button>
    </div>
  );
}

export default AuthPage;