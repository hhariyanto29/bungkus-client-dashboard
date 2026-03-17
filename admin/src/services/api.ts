import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  verifyToken: () =>
    api.post('/auth/verify'),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (name: string) =>
    api.put('/auth/profile', { name }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Clients API
export const clientsAPI = {
  getAll: (params?: any) =>
    api.get('/clients', { params }),
  
  getById: (id: number) =>
    api.get(`/clients/${id}`),
  
  create: (clientData: any) =>
    api.post('/clients', clientData),
  
  update: (id: number, clientData: any) =>
    api.put(`/clients/${id}`, clientData),
  
  delete: (id: number) =>
    api.delete(`/clients/${id}`),
  
  getStats: (id: number) =>
    api.get(`/clients/${id}/stats`),
  
  search: (query: string) =>
    api.get(`/clients/search/${query}`),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: any) =>
    api.get('/orders', { params }),
  
  getById: (id: number) =>
    api.get(`/orders/${id}`),
  
  create: (orderData: any) =>
    api.post('/orders', orderData),
  
  update: (id: number, orderData: any) =>
    api.put(`/orders/${id}`, orderData),
  
  updateStatus: (id: number, status: string, notes?: string) =>
    api.patch(`/orders/${id}/status`, { status, notes }),
  
  delete: (id: number) =>
    api.delete(`/orders/${id}`),
  
  getStats: () =>
    api.get('/orders/stats/overview'),
  
  getRecent: (limit?: number) =>
    api.get(`/orders/recent/${limit || ''}`),
};

// QR Codes API
export const qrAPI = {
  generate: (qrData: any) =>
    api.post('/qr/generate', qrData),
  
  getAll: (params?: any) =>
    api.get('/qr', { params }),
  
  getById: (id: number) =>
    api.get(`/qr/${id}`),
  
  updateStatus: (id: number, status: string) =>
    api.patch(`/qr/${id}/status`, { status }),
  
  delete: (id: number) =>
    api.delete(`/qr/${id}`),
  
  validate: (qrData: string) =>
    api.post('/qr/validate', { qr_data: qrData }),
  
  getStats: () =>
    api.get('/qr/stats/overview'),
  
  bulkGenerate: (clientId: number, tableNumbers: string[], validUntil?: string) =>
    api.post('/qr/bulk-generate', { client_id: clientId, table_numbers: tableNumbers, valid_until: validUntil }),
};

// Health check
export const healthAPI = {
  check: () => axios.get(`${API_BASE_URL.replace('/api', '')}/health`),
};

export default api;