// app/login.tsx
import React from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { router, Link } from 'expo-router';
import api from '../src/services/api';
import { useAuthStore } from '../src/store/authStore';

// 1. Define the validation schema with Zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// 2. Define the API call function
const loginUser = async (data: LoginFormValues) => {
  const response = await api.post('/auth/login', data);
  return response.data; // Contains accessToken and refreshToken
};

export default function LoginScreen() {
  // Get the setTokens action from our Zustand store
  const { setTokens } = useAuthStore();

  // 3. Set up the form with React Hook Form
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // 4. Set up the mutation with React Query
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      // On successful login, save the tokens using our store's action
      await setTokens(data.accessToken, data.refreshToken);
      // Redirect user to the main app (the tabs layout)
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      // Show an error message
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Error', message);
    },
  });

  // 5. This function is called when the form is submitted
  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      <Button
        title={mutation.isPending ? 'Logging In...' : 'Login'}
        onPress={handleSubmit(onSubmit)}
        disabled={mutation.isPending}
      />

      <Link href="/register" style={styles.link}>
         <Text>Don't have an account? Register</Text>
      </Link>
    </View>
  );
}

// A simple stylesheet for the form
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: { color: 'red', marginBottom: 10 },
  link: { marginTop: 15, textAlign: 'center', color: 'blue' },
});