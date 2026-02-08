import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from '../firebase/config';

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
  }
}

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
});

const toErrorMessage = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (value instanceof Error && value.message.trim()) {
    return value.message;
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    const candidates = [record.message, record.error, record.details];
    for (const candidate of candidates) {
      const message = toErrorMessage(candidate);
      if (message) {
        return message;
      }
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return null;
};

// Request interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (!isFormData && config.headers && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Add Firebase ID token when signed in
    const token = await auth.currentUser?.getIdToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle other errors
    const responseData = error.response?.data;
    const errorMessage = toErrorMessage(responseData) || toErrorMessage(error) || 'Request failed.';

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
