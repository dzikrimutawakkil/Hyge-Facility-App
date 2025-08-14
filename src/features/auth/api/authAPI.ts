import api from '../../../libs/axios';
import { LoginFormValues, RegisterFormValues } from '../types';

export const loginUser = async (data: LoginFormValues) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (data: RegisterFormValues) => {
  return api.post('/auth/register', data);
};