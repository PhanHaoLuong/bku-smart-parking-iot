import { useState } from 'react';

function LoginForm({ onSubmit, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      username,
      password,
    });
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Tên đăng nhập</label>
        <input
          id="username"
          type="text"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Mật khẩu</label>
        <input
          id="password"
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && <p className="error-message">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
}

export default LoginForm;