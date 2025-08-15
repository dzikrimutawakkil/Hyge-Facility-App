// src/features/auth/stores/authStore.ts
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken, isAuthenticated: true });
      }
    } catch (e) {
      console.error("Failed to initialize auth state", e);
    } finally {
      set({ isInitializing: false });
    }
  },
}));