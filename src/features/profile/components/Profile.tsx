// src/features/profile/components/Profile.tsx
import React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';

// Impor semua yang dibutuhkan dari fitur auth
import { useAuthStore } from '../../auth/stores/authStore';
import { getUserProfile, logOutUser } from '../../auth/api/authAPI';
import { UserProfile } from '../../auth/types';
import { Redirect } from 'expo-router';

export const Profile = () => {
  const { logout: clearLocalTokens } = useAuthStore();

  const { data: user, isLoading, error } = useQuery<UserProfile, Error>({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  const logoutMutation = useMutation({
    mutationFn: logOutUser,
    onSuccess: () => {
      console.log('Server logout successful, clearing local tokens...');
      clearLocalTokens();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Logout failed. Please try again.';
      Alert.alert('Logout Error', message);
    },
  });

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", style: "destructive", onPress: () => logoutMutation.mutate() }
      ]
    );
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return <Text style={styles.errorText}>Gagal memuat profil: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <Pressable 
        style={styles.logoutButton} 
        onPress={handleLogout} 
        disabled={logoutMutation.isPending}
      >
        <Text style={styles.logoutButtonText}>
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  button: {
    marginTop: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});