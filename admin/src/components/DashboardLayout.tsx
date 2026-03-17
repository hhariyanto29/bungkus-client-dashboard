import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠', color: 'from-purple-500 to-pink-500' },
    { name: 'Orders', href: '/orders', icon: '🛍️', color: 'from-orange-500 to-red-500' },
    { name: 'QR Generator', href: '/qr-generator', icon: '📱', color: 'from-blue-500 to-cyan-500' },
    { name: 'Clients', href: '/clients', icon: '👥', color: 'from-green-500 to-emerald-500' },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-dark-100 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-hero-pattern opacity-[0.03] dark:opacity-[0.02] pointer-events-none"></div>
      
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl opacity-10 dark:opacity-5"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto"
            >
              <div className="h-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-2xl border-r border-white/20 dark:border-dark-700/20">
                <div className="p-6">
                  {/* Logo */}
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center space-x-3 mb-8"
                  >
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                        Bungkus Admin
                      </h2>
                      <p className="text-xs text-dark-500 dark:text-dark-400">Dashboard v2.0</p>
                    </div>
                  </motion.div>

                  {/* Navigation */}
                  <nav className="space-y-2">
                    {navigation.map((item, index) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Link
                            to={item.href}
                            className={`
                              relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
                              ${isActive 
                                ? 'text-white' 
                                : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
                              }
                            `}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeNav"
                                className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl shadow-lg`}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                            
                            <div className={`
                              relative flex items-center space-x-3 z-10
                              ${!isActive && 'group-hover:translate-x-1 transition-transform duration-300'}
                            `}>
                              <span className={`text-2xl ${isActive ? 'animate-pulse' : ''}`}>
                                {item.icon}
                              </span>
                              <span>{item.name}</span>
                            </div>

                            {isActive && (
                              <motion.div
                                className="absolute right-0 w-1 h-8 bg-white rounded-l-full"
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </nav>
                </div>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                  {/* Dark Mode Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between px-4 py-3 bg-dark-100/50 dark:bg-dark-700/50 rounded-xl transition-colors"
                  >
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                      Dark Mode
                    </span>
                    <div className="relative w-12 h-6 bg-dark-300 dark:bg-dark-600 rounded-full transition-colors">
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                        animate={{ x: isDarkMode ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </motion.button>

                  {/* User Profile */}
                  <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark-900 dark:text-white">Admin User</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">admin@bungkus.com</p>
                      </div>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    Logout
                  </motion.button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'pl-64' : 'pl-0'} transition-all duration-300`}>
          {/* Top Bar */}
          <header className="sticky top-0 z-20 bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl border-b border-white/20 dark:border-dark-700/20">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-dark-100/50 dark:hover:bg-dark-700/50 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
                
                <div className="hidden sm:block">
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-2 hover:bg-dark-100/50 dark:hover:bg-dark-700/50 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </motion.button>

                {/* Settings */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-dark-100/50 dark:hover:bg-dark-700/50 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6 text-dark-600 dark:text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;