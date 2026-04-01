import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const portalAPI = {
  getOrder: (hash: string) => api.get(`/portal/${hash}`),
  getTracking: (hash: string) => api.get(`/portal/${hash}/tracking`),
  getInvoice: (hash: string) => api.get(`/portal/${hash}/invoice`),
  getTaxInvoice: (hash: string) => api.get(`/portal/${hash}/tax-invoice`),
  getHistory: (hash: string) => api.get(`/portal/${hash}/history`),
};

export default api;
