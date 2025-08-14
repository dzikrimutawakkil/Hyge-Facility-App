// app/_layout.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';

// 1. Create a new QueryClient instance
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    // 2. Wrap your entire app with the QueryClientProvider
    <QueryClientProvider client={queryClient}>
      {/* Slot renders the current page */}
      <Slot />
    </QueryClientProvider>
  );
}