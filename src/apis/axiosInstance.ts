import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API configuration from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

console.log('🔧 API_URL:', API_URL);

// Create axios instance with basic config
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - add token automatically
axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add accessToken automatically if available
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - handle response and errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const { response, config } = error;

        console.error(`❌ API Error: ${response?.status} ${config?.url}`, {
            status: response?.status,
            data: response?.data,
            message: response?.data?.message,
        });

        // Handle common errors
        switch (response?.status) {
            case 401:
                // Token expired - clear token and redirect to login
                console.log('🔒 Unauthorized - Token expired');
                localStorage.removeItem('access_token');
                // Redirect to login page if needed
                // window.location.href = '/login';
                break;
            case 403:
                console.log('🚫 Forbidden - Insufficient permissions');
                break;
            case 404:
                console.log('🔍 Not Found');
                break;
            case 500:
                console.log('🔥 Server Error');
                break;
            default:
                console.log('🌐 Network or Unknown Error');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
