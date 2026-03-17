import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const clients = [
    { 
      id: 1, 
      name: 'Restaurant ABC', 
      email: 'contact@restaurantabc.com',
      phone: '+62 812-3456-7890',
      location: 'Jakarta Selatan',
      tables: 20,
      activeQR: 15,
      joinDate: '15 Jan 2024',
      status: 'active',
      revenue: 45000000
    },
    { 
      id: 2, 
      name: 'Cafe XYZ', 
      email: 'hello@cafexyz.com',
      phone: '+62 813-9876-5432',
      location: 'Bandung',
      tables: 12,
      activeQR: 10,
      joinDate: '20 Feb 2024',
      status: 'active',
      revenue: 28000000
    },
    { 
      id: 3, 
      name: 'Bistro 123', 
      email: 'info@bistro123.com',
      phone: '+62 811-2345-6789',
      location: 'Surabaya',
      tables: 15,
      activeQR: 8,
      joinDate: '10 Mar 2024',
      status: 'inactive',
      revenue: 12000000
    },
    { 
      id: 4, 
      name: 'Warung Makan Sederhana', 
      email: 'warung@sederhana.com',
      phone: '+62 814-5678-9012',
      location: 'Yogyakarta',
      tables: 8,
      activeQR: 6,
      joinDate: '5 Mar 2024',
      status: 'active',
      revenue: 18500000
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { 
      label: 'Total Clients', 
      value: clients.length.toString(),
      color: 'from-purple-500 to-pink-500',
      icon: '👥'
    },
    { 
      label: 'Active Clients', 
      value: clients.filter(c => c.status === 'active').length.toString(),
      color: 'from-green-500 to-emerald-500',
      icon: '✅'
    },
    { 
      label: 'Total Tables', 
      value: clients.reduce((sum, c) => sum + c.tables, 0).toString(),
      color: 'from-blue-500 to-cyan-500',
      icon: '🪑'
    },
    { 
      label: 'Total Revenue', 
      value: `${(clients.reduce((sum, c) => sum + c.revenue, 0) / 1000000).toFixed(1)}M`,
      color: 'from-orange-500 to-red-500',
      icon: '💰'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400">
          Clients Management
        </h1>
        <p className="mt-2 text-dark-600 dark:text-dark-400">
          Manage your restaurant clients and their subscriptions
        </p>
        
        {/* Decorative element */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
            <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-dark-700/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-dark-600 dark:text-dark-400">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border border-white/20 dark:border-dark-700/20 rounded-xl text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            placeholder="Search clients..."
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-pink-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Client
        </motion.button>
      </motion.div>

      {/* Clients Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedClient(client)}
              className="relative group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${
                client.status === 'active' ? 'from-green-500 to-emerald-500' : 'from-gray-500 to-gray-600'
              } rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              
              <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-dark-700/20 p-6 space-y-4">
                {/* Client Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-dark-900 dark:text-white">
                        {client.name}
                      </h3>
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        {client.location}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    client.status === 'active' 
                      ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-800 dark:text-green-300'
                      : 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 text-gray-800 dark:text-gray-300'
                  }`}>
                    {client.status}
                  </span>
                </div>

                {/* Client Details */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.email}
                  </div>
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {client.phone}
                  </div>
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {client.joinDate}
                  </div>
                </div>

                {/* Client Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-dark-200/20 dark:border-dark-700/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                      {client.tables}
                    </p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">Tables</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                      {client.activeQR}
                    </p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">Active QR</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                      {(client.revenue / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-dark-500 dark:text-dark-400">Revenue</p>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/25"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit action
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-500/25"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4H4v4h4z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50"
            >
              <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/20 p-8 shadow-2xl">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 mb-6">
                  Add New Client
                </h3>
                {/* Add form content here */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25"
                  >
                    Add Client
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 bg-dark-100/50 dark:bg-dark-700/50 text-dark-700 dark:text-dark-300 font-semibold rounded-xl border border-dark-300/20 dark:border-dark-600/20"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSelectedClient(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto z-50"
            >
              <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                    Client Details
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedClient(null)}
                    className="p-2 hover:bg-dark-100/50 dark:hover:bg-dark-700/50 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5 text-dark-600 dark:text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Client info and details here */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/25">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-dark-900 dark:text-white">{selectedClient.name}</h4>
                      <p className="text-dark-600 dark:text-dark-400">{selectedClient.location}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedClient.status === 'active' 
                        ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-800 dark:text-green-300'
                        : 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 text-gray-800 dark:text-gray-300'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clients;