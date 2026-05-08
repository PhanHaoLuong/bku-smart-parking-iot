import { create } from 'zustand';
import { logout } from '../api/authApi';
import { persist } from 'zustand/middleware';

export const useAuth = create(persist((set) => ({
  username: null,
  userId: null,
  role: null,
  isAuthenticated: false,
  handleLogin: (user) =>
    set({
      username: user?.username ?? null,
      userId: user?.id ?? null,
      role: user?.role ?? null,
      isAuthenticated: !!user?.id && !!user?.role,
    }),
  handleLogout: async () => {
    try {
      await logout();
    } finally {
      set({
        username: null,
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
        set({ username: null, userId: null, role: null, isAuthenticated: false });
        return;
      }

      const user = await response.json();
      set({
        username: user?.username ?? null,
        userId: user?.id ?? null,
        role: user?.role ?? null,
        isAuthenticated: !!user?.id && !!user?.role,
      });
    } catch {
      set({ username: null, userId: null, role: null, isAuthenticated: false });
    }
  },
}))); 