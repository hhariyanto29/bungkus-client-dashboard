import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  verifyToken: () => api.post('/auth/verify'),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (name: string) => api.put('/auth/profile', { name }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Clients API
export const clientsAPI = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getById: (id: number) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: number, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
  getStats: (id: number) => api.get(`/clients/${id}/stats`),
  search: (query: string) => api.get(`/clients/search/${query}`),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  update: (id: number, data: any) => api.put(`/orders/${id}`, data),
  delete: (id: number) => api.delete(`/orders/${id}`),
  calculate: (items: any[], discount?: number) => api.post('/orders/calculate', { items, discount }),
  updatePaymentStatus: (id: number, payment_status: string) =>
    api.patch(`/orders/${id}/payment-status`, { payment_status }),
  updateProductionStatus: (id: number, production_status: string) =>
    api.patch(`/orders/${id}/production-status`, { production_status }),
  getStats: () => api.get('/orders/stats/overview'),
  getRecent: (limit?: number) => api.get(`/orders/recent/${limit || 5}`),
};

// Invoices API
export const invoicesAPI = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (id: number) => api.get(`/invoices/${id}`),
  generate: (orderId: number) => api.post(`/invoices/generate/${orderId}`),
  updateStatus: (id: number, status: string) => api.patch(`/invoices/${id}/status`, { status }),
  generateTaxInvoice: (orderId: number) => api.post(`/invoices/${orderId}/tax-invoice`),
  delete: (id: number) => api.delete(`/invoices/${id}`),
};

// Shipments API
export const shipmentsAPI = {
  getAll: (params?: any) => api.get('/shipments', { params }),
  getById: (id: number) => api.get(`/shipments/${id}`),
  getByOrder: (orderId: number) => api.get(`/shipments/order/${orderId}`),
  create: (data: any) => api.post('/shipments', data),
  update: (id: number, data: any) => api.put(`/shipments/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch(`/shipments/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/shipments/${id}`),
};

// QR Codes API
export const qrAPI = {
  getAll: (params?: any) => api.get('/qr', { params }),
  getByOrder: (orderId: number) => api.get(`/qr/order/${orderId}`),
  generate: (orderId: number, expiresInDays?: number) =>
    api.post(`/qr/generate/${orderId}`, { expires_in_days: expiresInDays }),
  deliver: (id: number, method: string, recipient?: string) =>
    api.post(`/qr/${id}/deliver`, { delivery_method: method, recipient }),
  deactivate: (id: number) => api.patch(`/qr/${id}/deactivate`),
  regenerate: (id: number) => api.post(`/qr/${id}/regenerate`),
  delete: (id: number) => api.delete(`/qr/${id}`),
  getStats: () => api.get('/qr/stats/overview'),
};

// Health check
export const healthAPI = {
  check: () => axios.get(`${API_BASE_URL.replace('/api', '')}/health`),
};

export default api;
