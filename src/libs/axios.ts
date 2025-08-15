// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://booking-api.hyge.web.id';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 [${config.method?.toUpperCase()}] Request to ${config.url}`);
    if (config.data) {
      console.log('   -> Request Body:', JSON.stringify(config.data, null, 2));
    }
    
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] Response from ${response.config.url}`);
    console.log('   -> Response Data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response) {
      console.error(`❌ [${error.response.status}] Error from ${error.response.config.url}`);
      console.error('   -> Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Network Error:', error.message);
    }
    
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('   -> Token expired. Attempting to refresh...');

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) {
          console.error('   -> No refresh token found. Aborting.');
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        console.log('   -> ✅ Token refreshed successfully.');

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

        await SecureStore.setItemAsync('accessToken', newAccessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        console.log('   -> Retrying original request...');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('   -> ❌ Failed to refresh token. Logging out.', refreshError);
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;