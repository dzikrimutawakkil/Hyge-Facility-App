// app/(tabs)/_layout.tsx
import React, { useEffect } from 'react';
import { Tabs, Redirect } from 'expo-router'; // Import Redirect
import { useAuthStore } from '../../src/store/authStore';
import { ActivityIndicator, View } from 'react-native';

export default function TabsLayout() {
  const { isAuthenticated, initialize } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await initialize();
      setIsInitializing(false);
    };
    checkAuth();
  }, []);

  // 1. Show a loading spinner while we check for tokens
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 2. After checking, if the user is NOT authenticated, render a Redirect component
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // 3. If the user IS authenticated, render the tabs
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Facilities' }} />
      <Tabs.Screen name="bookings" options={{ title: 'My Bookings' }} />
    </Tabs>
  );
}