import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

function AuthPage({ onLogin }) {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="auth-page">
      <h1>{isLoginView ? 'Login' : 'Signup'}</h1>
      {isLoginView ? <LoginForm onLogin={onLogin} /> : <SignupForm />}
      <button onClick={() => setIsLoginView((current) => !current)}>
        {isLoginView ? 'Switch to Signup' : 'Switch to Login'}
      </button>
    </div>
  );
}

export default AuthPage;