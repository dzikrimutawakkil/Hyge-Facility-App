// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, Link } from 'expo-router';
import { Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabsLayout() {
  const ProfileIcon = () => (
    <Link href="/profile" asChild>
      <Pressable>
        {({ pressed }) => (
          <FontAwesome
            name="user-circle"
            size={25}
            color="#333"
            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          />
        )}
      </Pressable>
    </Link>
  );

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Fasilitas',
          headerRight: () => <ProfileIcon />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Booking Saya',
          headerRight: () => <ProfileIcon />,
        }}
      />
    </Tabs>
  );
}