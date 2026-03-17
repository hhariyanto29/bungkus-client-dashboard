export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface QRCode {
  id: string;
  orderId: string;
  code: string;
  expiresAt: string;
  isActive: boolean;
  accessCount: number;
  createdAt: string;
}