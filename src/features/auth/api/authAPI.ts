import api from '../../../libs/axios';
import { LoginFormValues, RegisterFormValues, UserProfile } from '../types';

export const loginUser = async (data: LoginFormValues) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (data: RegisterFormValues) => {
  return api.post('/auth/register', data);
};

export const getUserProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.user;
};

export const logOutUser = async () => {
  return api.post('/auth/logout');
};