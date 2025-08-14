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

// Request Interceptor: Add the access token to every request
api.interceptors.request.use(
  async (config) => {
    // ✅ LOG THE OUTGOING REQUEST
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
    // ✅ LOG ANY ERROR THAT HAPPENS BEFORE THE REQUEST IS SENT
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration and refresh
api.interceptors.response.use(
  (response) => {
    // ✅ LOG A SUCCESSFUL RESPONSE
    console.log(`✅ [${response.status}] Response from ${response.config.url}`);
    console.log('   -> Response Data:', JSON.stringify(response.data, null, 2));
    return response; // Simply return the response if it's successful
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ LOG THE INITIAL ERROR RESPONSE
    if (error.response) {
      console.error(`❌ [${error.response.status}] Error from ${error.response.config.url}`);
      console.error('   -> Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Network Error:', error.message);
    }
    
    // Check if the error is 401 Unauthorized and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've tried to refresh
      console.log('   -> Token expired. Attempting to refresh...');

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) {
          console.error('   -> No refresh token found. Aborting.');
          return Promise.reject(error);
        }

        // Call the refresh token endpoint
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        console.log('   -> ✅ Token refreshed successfully.');

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

        // Save the new tokens
        await SecureStore.setItemAsync('accessToken', newAccessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);

        // Update the header of the original request and retry it
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        console.log('   -> Retrying original request...');
        return api(originalRequest);
      } catch (refreshError) {
        // ✅ LOG THE REFRESH TOKEN FAILURE
        console.error('   -> ❌ Failed to refresh token. Logging out.', refreshError);
        
        // If refresh fails, logout the user (clear tokens)
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // You might want to redirect to the login screen here
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;