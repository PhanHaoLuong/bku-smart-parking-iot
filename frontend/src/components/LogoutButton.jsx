import { useAuth } from '../stores/authStore';

function LogoutButton({ onLogout }) {
  const handleStoreLogout = useAuth((state) => state.handleLogout);

  const handleLogout = async () => {
    try {
      await fetch('/apiv1/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      handleStoreLogout();
      onLogout(); // Clear frontend state
    } catch (error) {
      console.error('Logout failed:', error);
      handleStoreLogout();
      onLogout(); // Clear frontend state anyway
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;