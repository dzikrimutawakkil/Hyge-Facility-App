// src/features/auth/components/LoginForm.tsx
import React from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router, Link } from 'expo-router';

// DIIMPOR, BUKAN DIBUAT DI SINI
import { loginUser } from '../api/authAPI';
import { loginSchema, LoginFormValues } from '../types';
import { useAuthStore } from '../stores/authStore';

export const LoginForm = () => {
  const { setTokens } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), // Menggunakan skema yang diimpor
    defaultValues: { email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: loginUser, // Menggunakan fungsi API yang diimpor
    onSuccess: async (data) => {
      await setTokens(data.accessToken, data.refreshToken);
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', message);
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  // Bagian return (JSX) tetap sama karena hanya tentang tampilan
  return (
    <View style={styles.container}>
      {/* ... semua kode JSX untuk input dan button ... */}
      <Text style={styles.title}>Welcome Back!</Text>
      <Controller name="email" control={control} render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Email" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none"/>)}/>
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      <Controller name="password" control={control} render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Password" onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry/>)}/>
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      <Button title={mutation.isPending ? 'Logging In...' : 'Login'} onPress={handleSubmit(onSubmit)} disabled={mutation.isPending}/>
      <Link href="/register" style={styles.link}><Text>Don't have an account? Register</Text></Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
  errorText: { color: 'red', marginBottom: 10, marginTop: -5 },
  link: { marginTop: 15, textAlign: 'center', color: 'blue' },
});