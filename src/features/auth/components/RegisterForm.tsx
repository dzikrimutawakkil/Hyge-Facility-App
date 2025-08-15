// src/features/auth/components/RegisterForm.tsx
import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router, Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { loginUser, registerUser } from '../api/authAPI';
import { registerSchema, RegisterFormValues } from '../types';
import { useAuthStore } from '../stores/authStore';

export const RegisterForm = () => {
  const { setTokens } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      await registerUser(data);
      const { email, password } = data;
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      > 
        <View style={styles.formContainer}>
          <Image 
            source={require('../../../../assets/images/app-logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Let's get you started</Text>
          <View style={styles.inputContainer}><Feather name="user" size={20} color="#888" style={styles.inputIcon} /><Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#888" onBlur={onBlur} onChangeText={onChange} value={value} autoCapitalize="words"/>)}/></View>
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          <View style={styles.inputContainer}><Feather name="mail" size={20} color="#888" style={styles.inputIcon} /><Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="email-address" autoCapitalize="none"/>)}/></View>
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          <View style={styles.inputContainer}><Feather name="lock" size={20} color="#888" style={styles.inputIcon} /><Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (<TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" onBlur={onBlur} onChangeText={onChange} value={value} secureTextEntry/>)}/></View>
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          <Pressable style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]} onPress={handleSubmit(onSubmit)} disabled={mutation.isPending}>
            {mutation.isPending ? (<ActivityIndicator color="#fff" />) : (<Text style={styles.buttonText}>Create Account</Text>)}
          </Pressable>
          <View style={styles.footer}><Text style={styles.footerText}>Already have an account? </Text><Link href="/login"><Text style={styles.link}>Login</Text></Link></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 8,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#2D3748',
  },
  errorText: {
    color: '#E53E3E',
    marginBottom: 10,
    marginTop: -6,
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#718096',
  },
  link: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: 'bold',
  },
});
