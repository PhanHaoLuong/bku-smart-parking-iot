import { create } from 'zustand';
import { logout } from '../api/authApi';
import { persist } from 'zustand/middleware';
import { authedFetch } from '../api/authedFetch';

const normalizeUser = (user) => ({
  id: user?.id ?? user?.userId ?? null,
  userId: user?.userId ?? user?.id ?? null,
  username: user?.username ?? null,
  role: user?.role ?? null,
});

export const useAuth = create(persist((set) => ({
  username: null,
  id: null,
  userId: null,
  role: null,
  isAuthenticated: false,
  handleLogin: (user) =>
    set((state) => {
      const normalizedUser = normalizeUser(user);

      return {
        ...state,
        ...normalizedUser,
        isAuthenticated: !!normalizedUser.id && !!normalizedUser.role,
      };
    }),
  handleLogout: async () => {
    try {
      await logout();
    } finally {
      set({
        username: null,
        id: null,
        userId: null,
        role: null,
        isAuthenticated: false,
      });
    }
  },
  syncFromSession: async () => {
    try {
      const response = await authedFetch('/apiv1/auth/user-info');

      if (!response.ok) {
        set({ username: null, id: null, userId: null, role: null, isAuthenticated: false });
        return;
      }

      const user = await response.json();
      const normalizedUser = normalizeUser(user);

      set({
        ...normalizedUser,
        isAuthenticated: !!normalizedUser.id && !!normalizedUser.role,
      });
    } catch {
      set({ username: null, id: null, userId: null, role: null, isAuthenticated: false });
    }
  },
}))); 