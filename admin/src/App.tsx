import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import QRGenerator from './pages/QRGenerator';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import Shipments from './pages/Shipments';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#e2e8f0',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Space Grotesk, sans-serif',
              },
              success: {
                iconTheme: { primary: '#00f0ff', secondary: '#0a0a1a' },
              },
              error: {
                iconTheme: { primary: '#f43f5e', secondary: '#0a0a1a' },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="clients" element={<Clients />} />
              <Route path="qr-generator" element={<QRGenerator />} />
              <Route path="shipments" element={<Shipments />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
