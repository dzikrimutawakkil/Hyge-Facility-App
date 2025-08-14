// src/store/authStore.ts
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

// Define the shape of the store's state
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  // Action to set tokens in state and secure store
  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  // Action to clear tokens and log out
  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  // Action to check for tokens on app startup
  initialize: async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, isAuthenticated: true });
    }
  },
}));