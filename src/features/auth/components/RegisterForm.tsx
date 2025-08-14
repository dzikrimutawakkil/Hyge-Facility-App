// src/features/auth/components/RegisterForm.tsx
import React from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router, Link } from 'expo-router';

// DIIMPOR dari lokasi baru yang terpusat
import { loginUser, registerUser } from '../api/authAPI';
import { registerSchema, RegisterFormValues } from '../types';
import { useAuthStore } from '../stores/authStore';

// Nama komponen diubah menjadi RegisterForm dan diekspor
export const RegisterForm = () => {
  const { setTokens } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      // Menggunakan fungsi API yang sudah diimpor
      await registerUser(data);
      const { email, password } = data;
      // Memanggil fungsi login setelah registrasi berhasil
      const tokenData = await loginUser({ email, password });
      return tokenData;
    },
    onSuccess: async (tokenData) => {
      await setTokens(tokenData.accessToken, tokenData.refreshToken);
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message[0] || 'Registration failed. The email might already be in use.';
      Alert.alert('Registration Error', message);
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  // Bagian JSX (return) tidak ada perubahan
  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Full Name" onBlur={onBlur} onChangeText={onChange} value={value}/>)}/>
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Email" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none"/>)}/>
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Password" onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry/>)}/>
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        <Button title={mutation.isPending ? 'Registering...' : 'Create Account'} onPress={handleSubmit(onSubmit)} disabled={mutation.isPending}/>
        <Link href="/login" style={styles.link}><Text>Already have an account? Login</Text></Link>
    </ScrollView>
  );
}

// Styles tidak ada perubahan
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10, },
  errorText: { color: 'red', marginBottom: 10, marginTop: -5 },
  link: { marginTop: 15, textAlign: 'center', color: 'blue' },
});