import { useAuth } from '../../stores/authStore';

function LogoutButton({ onLogout }) {
  const handleStoreLogout = useAuth((state) => state.handleLogout);

  const handleLogout = async () => {
    try {
      await handleStoreLogout();
      onLogout?.();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;