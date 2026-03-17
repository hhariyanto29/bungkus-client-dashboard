// API Base URL - will be configured for backend integration in Phase 3
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Application Constants
export const APP_NAME = 'Bungkus Admin Dashboard';
export const COMPANY_NAME = 'PT Bungkus Indonesia';

// Status Types
export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Page Size for Tables
export const DEFAULT_PAGE_SIZE = 10;