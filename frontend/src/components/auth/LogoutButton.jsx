function LogoutButton({ onLogout }) {
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('/apiv1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      onLogout(); // Notify parent component
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;