// app/_layout.tsx
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/src/features/auth/stores/authStore';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

const queryClient = new QueryClient();

// Komponen untuk menangani logika autentikasi
const AuthLayout = () => {
  const { isAuthenticated, initialize, isInitializing } = useAuthStore();
  
  const segments = useSegments() as string[]; 
  
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    const inAuthPages = segments.includes('login') || segments.includes('register');

    if (isAuthenticated && inAuthPages) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthPages) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, segments]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthLayout />
    </QueryClientProvider>
  );
}