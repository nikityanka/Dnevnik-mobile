import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://84.242.245.112:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_KEY = 'auth_token';

export const setAuthToken = async (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const getAuthToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
    }

    return Promise.reject(error);
  }
);

export default api;