import { create } from 'zustand';
import { logout } from '../api/authApi';

export const useAuth = create((set) => ({
  userId: null,
  role: null,
  isAuthenticated: false,
  handleLogin: (user) =>
    set({
      userId: user?.id ?? null,
      role: user?.role ?? null,
      isAuthenticated: !!user?.id && !!user?.role,
    }),
  handleLogout: async () => {
    try {
      await logout();
    } finally {
      set({
        userId: null,
        role: null,
        isAuthenticated: false,
      });
    }
  },
  syncFromSession: async () => {
    try {
      const response = await fetch('/apiv1/auth/user-info', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        set({ userId: null, role: null, isAuthenticated: false });
        return;
      }

      const user = await response.json();
      set({
        userId: user?.id ?? null,
        role: user?.role ?? null,
        isAuthenticated: !!user?.id && !!user?.role,
      });
    } catch {
      set({ userId: null, role: null, isAuthenticated: false });
    }
  },
}));