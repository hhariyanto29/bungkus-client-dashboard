import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, LoginFormData, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      if (token) {
        try {
          const response = await api.get('/admin/me');
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('admin_token');
          sessionStorage.removeItem('admin_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (data: LoginFormData) => {
    const response = await api.post<AuthResponse>('/admin/login', data);
    const { token, user } = response.data;
    
    if (data.rememberMe) {
      localStorage.setItem('admin_token', token);
    } else {
      sessionStorage.setItem('admin_token', token);
    }
    
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};