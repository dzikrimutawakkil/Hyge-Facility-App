// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs, Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabsLayout() {
  const ProfileIcon = () => (
    <Link href="/profile" asChild>
      <Pressable>
        {({ pressed }) => (
          <FontAwesome
            name="user-circle"
            size={25}
            color="#fff"
            style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
          />
        )}
      </Pressable>
    </Link>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          backgroundColor: '#000',
          position: 'absolute',
          bottom: 12,
          left: 20,
          right: 20,
          elevation: 0,
          borderRadius: 24,
          height: 60,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          marginHorizontal: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: 5,
        },
        tabBarIconStyle: {
            marginTop: 5,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Facility',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'Booking List',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="list" color={color} />,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => <ProfileIcon />,
        }}
      />
    </Tabs>
  );
}
