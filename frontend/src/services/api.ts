import axios from 'axios';

// Strictly use the backend for everything
const USE_MOCK_DATA = false;
const USE_MOCK_AUTH = false;

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions for authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/users', {
      full_name: name,
      email,
      password,
    });
    return response.data;
  },
};

// API functions for content repurposing
export const contentAPI = {
  // Submit content for repurposing
  submitContent: async (data: {
    title: string;
    content: string;
    content_types: string[];
    metadata?: Record<string, any>;
  }) => {
    const response = await api.post('/content', data);
    return response.data;
  },

  // Get all jobs
  getJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  // Get job by ID
  getJob: async (jobId: string) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },
};

export default api;
