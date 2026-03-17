import React from 'react';
import { motion } from 'framer-motion';
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard: React.FC = () => {
  const { stats, recentOrders, isLoading } = useDashboardData();

  const dashboardStats = [
    { 
      name: 'Total Orders Today', 
      value: stats.todaysOrders.toString(), 
      change: '+12%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      bgGradient: 'from-blue-500 to-cyan-400',
      shadowColor: 'shadow-blue-500/25'
    },
    { 
      name: 'Pending Orders', 
      value: stats.pendingOrders.toString(), 
      change: '-3%', 
      changeType: 'negative',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-orange-500 to-red-400',
      shadowColor: 'shadow-orange-500/25'
    },
    { 
      name: 'Revenue', 
      value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`, 
      change: '+23%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-green-500 to-emerald-400',
      shadowColor: 'shadow-green-500/25'
    },
    { 
      name: 'Active Clients', 
      value: stats.activeClients.toString(), 
      change: '+5%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgGradient: 'from-purple-500 to-pink-400',
      shadowColor: 'shadow-purple-500/25'
    },
    { 
      name: 'QR Codes Generated', 
      value: stats.qrCodesGenerated.toString(), 
      change: '+17%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4H4v4h4z" />
        </svg>
      ),
      bgGradient: 'from-indigo-500 to-blue-400',
      shadowColor: 'shadow-indigo-500/25'
    },
  ];

  const statusStyles = {
    pending: {
      bg: 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      dot: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      glow: 'shadow-yellow-400/50'
    },
    processing: {
      bg: 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20',
      text: 'text-blue-800 dark:text-blue-300',
      dot: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      glow: 'shadow-blue-400/50'
    },
    completed: {
      bg: 'bg-gradient-to-r from-green-400/20 to-emerald-400/20',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-gradient-to-r from-green-400 to-emerald-400',
      glow: 'shadow-green-400/50'
    },
    cancelled: {
      bg: 'bg-gradient-to-r from-red-400/20 to-pink-400/20',
      text: 'text-red-800 dark:text-red-300',
      dot: 'bg-gradient-to-r from-red-400 to-pink-400',
      glow: 'shadow-red-400/50'
    },
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-dark-600 dark:text-dark-400">
          Welcome back! Here's what's happening with your business today.
        </p>
        
        {/* Decorative element */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      </motion.div>
      
      {/* Stats Grid */}
      <motion.dl 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            variants={item}
            whileHover={{ 
              scale: 1.05,
              rotateZ: 0.5,
              transition: { duration: 0.2 }
            }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${stat.shadowColor}`}></div>
            <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-dark-700/20 overflow-hidden">
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-[0.08] dark:opacity-[0.15]`}></div>
              
              <div className="relative p-6">
                <dt className="flex items-center justify-between">
                  <p className="text-sm font-medium text-dark-600 dark:text-dark-300">{stat.name}</p>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`p-3 rounded-2xl bg-gradient-to-br ${stat.bgGradient} text-white shadow-lg ${stat.shadowColor}`}
                  >
                    {stat.icon}
                  </motion.div>
                </dt>
                <dd className="mt-4">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-dark-800 to-dark-600 dark:from-white dark:to-dark-200">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <p className={`flex items-center text-sm font-semibold ${
                      stat.changeType === 'positive' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <motion.svg 
                          initial={{ y: 2 }}
                          animate={{ y: -2 }}
                          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                          className="w-4 h-4 mr-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </motion.svg>
                      ) : (
                        <motion.svg 
                          initial={{ y: -2 }}
                          animate={{ y: 2 }}
                          transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                          className="w-4 h-4 mr-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </motion.svg>
                      )}
                      {stat.change}
                    </p>
                    <span className="ml-2 text-sm text-dark-500 dark:text-dark-400">from yesterday</span>
                  </div>
                </dd>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.dl>

      {/* Recent Orders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/20 overflow-hidden">
          <div className="p-6 border-b border-dark-200/10 dark:border-dark-700/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-dark-600 dark:text-dark-400">
                  Monitor and manage your latest orders in real-time
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl shadow-lg shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Orders
                </motion.button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-dark-50/30 to-dark-100/30 dark:from-dark-900/30 dark:to-dark-800/30">
                <tr>
                  <th className="py-4 pl-6 pr-3 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Order ID
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Client
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Items
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Total
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Time
                  </th>
                  <th className="relative py-4 pl-3 pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200/5 dark:divide-dark-700/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                      <p className="mt-2 text-dark-600 dark:text-dark-400">Loading orders...</p>
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mt-2 text-dark-600 dark:text-dark-400">No orders yet</p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any, index: number) => (
                    <motion.tr 
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          #{order.id}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-700 dark:text-dark-300">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                            {order.client.charAt(0)}
                          </div>
                          <span className="ml-3 font-medium">{order.client}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-700 dark:text-dark-300">
                        {order.items} items
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-dark-900 dark:text-white">
                        {order.total}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status as keyof typeof statusStyles].bg} ${statusStyles[order.status as keyof typeof statusStyles].text} backdrop-blur-xl`}>
                          <span className={`w-2 h-2 rounded-full ${statusStyles[order.status as keyof typeof statusStyles].dot} mr-2 shadow-md ${statusStyles[order.status as keyof typeof statusStyles].glow}`}></span>
                          {order.status}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-500 dark:text-dark-400">
                        {order.time}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold"
                        >
                          View
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: 'New Order', icon: '🛍️', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/25' },
          { title: 'Generate QR', icon: '📱', color: 'from-purple-500 to-pink-400', shadow: 'shadow-purple-500/25' },
          { title: 'Add Client', icon: '👥', color: 'from-green-500 to-emerald-400', shadow: 'shadow-green-500/25' },
          { title: 'View Reports', icon: '📊', color: 'from-orange-500 to-red-400', shadow: 'shadow-orange-500/25' },
        ].map((action, index) => (
          <motion.button
            key={index}
            variants={item}
            whileHover={{ 
              scale: 1.05,
              rotateZ: 1,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${action.shadow}`}></div>
            <div className="relative p-6 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-dark-700/20 text-left">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${action.color} text-3xl mb-4 shadow-lg ${action.shadow}`}
              >
                {action.icon}
              </motion.div>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white">{action.title}</h3>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;