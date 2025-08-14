// app/register.tsx
import React from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { router, Link } from 'expo-router';
import api from '../src/services/api';
import { useAuthStore } from '../src/store/authStore';

// 1. Define the validation schema for the registration form
const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// API function to register a new user
const registerUser = async (data: RegisterFormValues) => {
  return api.post('/auth/register', data);
};

// API function to log in a user (we'll call this after successful registration)
const loginUser = async (data: Pick<RegisterFormValues, 'email' | 'password'>) => {
    const response = await api.post('/auth/login', data);
    return response.data; // This part contains the tokens
};


export default function RegisterScreen() {
  const { setTokens } = useAuthStore();

  // 2. Set up the form
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  // 3. Set up the mutation to handle the register-then-login flow
  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      // Step 1: Attempt to register the new user
      await registerUser(data);

      // Step 2: If registration is successful, automatically log them in
      const { email, password } = data;
      const tokenData = await loginUser({ email, password });
      return tokenData;
    },  
    onSuccess: async (tokenData) => {
      // Step 3: If login is successful, save tokens and redirect
      await setTokens(tokenData.accessToken, tokenData.refreshToken);
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed. The email might already be in use.';
      Alert.alert('Registration Error', message);
    },
  });

  // This function passes the form data to our mutation
  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

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
        title={mutation.isPending ? 'Registering...' : 'Create Account'}
        onPress={handleSubmit(onSubmit)}
        disabled={mutation.isPending}
      />
      
      <Link href="/login" style={styles.link}>
          <Text>Already have an account? Login</Text>
      </Link>
    </ScrollView>
  );
}

// Using the same styles as the login screen for consistency
const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: { color: 'red', marginBottom: 10, marginTop: -5 },
  link: { marginTop: 15, textAlign: 'center', color: 'blue' },
});