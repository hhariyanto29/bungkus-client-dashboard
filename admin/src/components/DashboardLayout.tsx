import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    { 
      name: 'QR Generator', 
      href: '/qr-generator',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4H4v4h4z" />
        </svg>
      )
    },
    { 
      name: 'Orders', 
      href: '/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    { 
      name: 'Clients', 
      href: '/clients',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      name: 'Settings', 
      href: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 transition-colors duration-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-5 dark:opacity-[0.02]"></div>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-dark-600/75 dark:bg-dark-900/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl shadow-glass dark:shadow-glass-dark">
          {/* Close button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl bg-dark-100/50 dark:bg-dark-700/50 hover:bg-dark-200/50 dark:hover:bg-dark-600/50 transition-colors"
            >
              <svg className="h-5 w-5 text-dark-600 dark:text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex flex-col h-full">
            <div className="px-6 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-neon">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
                  Bungkus Admin
                </h1>
              </div>
            </div>

            <nav className="flex-1 px-4 pb-4">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100/50 dark:hover:bg-dark-700/50'
                  } group flex items-center px-3 py-2.5 mb-1 text-sm font-medium rounded-xl transition-all duration-200`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className={`${
                    location.pathname === item.href 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-dark-400 dark:text-dark-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                  } mr-3 transition-colors duration-200`}>
                    {item.icon}
                  </div>
                  {item.name}
                  {location.pathname === item.href && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="px-4 py-4 border-t border-dark-200/20 dark:border-dark-700/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">
                    {user?.role || 'Admin'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-full bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl border-r border-dark-200/20 dark:border-dark-700/20">
            {/* Logo section */}
            <div className="px-6 py-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-neon animate-pulse-slow">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
                  Bungkus Admin
                </h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 pb-4">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100/50 dark:hover:bg-dark-700/50'
                  } group flex items-center px-3 py-2.5 mb-1 text-sm font-medium rounded-xl transition-all duration-200 animate-slide-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`${
                    location.pathname === item.href 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-dark-400 dark:text-dark-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                  } mr-3 transition-colors duration-200`}>
                    {item.icon}
                  </div>
                  {item.name}
                  {location.pathname === item.href && (
                    <div className="ml-auto w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* User section */}
            <div className="px-4 py-4 border-t border-dark-200/20 dark:border-dark-700/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-primary-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">
                    {user?.role || 'Admin'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-105"
                  title="Logout"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10">
          <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl border-b border-dark-200/20 dark:border-dark-700/20">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-xl bg-dark-100/50 dark:bg-dark-700/50 hover:bg-dark-200/50 dark:hover:bg-dark-600/50 transition-colors"
                >
                  <svg className="h-6 w-6 text-dark-600 dark:text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Dark mode toggle */}
                <div className="ml-auto">
                  <button
                    onClick={toggleDarkMode}
                    className="p-2.5 bg-dark-100/50 dark:bg-dark-700/50 rounded-xl hover:bg-dark-200/50 dark:hover:bg-dark-600/50 transition-all duration-300 hover:scale-105"
                  >
                    {isDark ? (
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-dark-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;