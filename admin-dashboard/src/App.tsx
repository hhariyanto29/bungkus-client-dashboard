import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import QRGenerator from './pages/QRGenerator';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import DarkModeToggle from './components/DarkModeToggle';

function App() {
  // Temporary auth state - will be replaced with proper auth in Phase 3
  const [isAuthenticated] = React.useState(true);

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Navigation Sidebar */}
        <div className="flex">
          <nav className="w-64 min-h-screen bg-white dark:bg-gray-800 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Bungkus Admin
                </h2>
                <DarkModeToggle />
              </div>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/qr-generator" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    QR Generator
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/orders" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/clients" 
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    Clients
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
          
          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/qr-generator" element={<QRGenerator />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;