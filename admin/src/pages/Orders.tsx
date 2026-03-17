import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Orders: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = [
    { 
      id: '001', 
      client: 'John Doe', 
      items: [
        { name: 'Nasi Goreng Special', qty: 2, price: 35000 },
        { name: 'Es Teh Manis', qty: 2, price: 5000 }
      ],
      total: 80000, 
      status: 'pending', 
      time: '10:30 AM',
      date: '17 Mar 2024',
      table: 'Table 5',
      notes: 'Extra pedas untuk nasi goreng'
    },
    { 
      id: '002', 
      client: 'Jane Smith', 
      items: [
        { name: 'Ayam Bakar', qty: 1, price: 45000 },
        { name: 'Sate Ayam', qty: 2, price: 20000 }
      ],
      total: 85000, 
      status: 'processing', 
      time: '10:15 AM',
      date: '17 Mar 2024',
      table: 'Table 12',
      notes: ''
    },
    { 
      id: '003', 
      client: 'Bob Johnson', 
      items: [
        { name: 'Mie Ayam Special', qty: 3, price: 25000 },
        { name: 'Jus Alpukat', qty: 3, price: 15000 }
      ],
      total: 120000, 
      status: 'completed', 
      time: '09:45 AM',
      date: '17 Mar 2024',
      table: 'Table 3',
      notes: 'Mie tidak pakai sayur'
    },
    { 
      id: '004', 
      client: 'Alice Brown', 
      items: [
        { name: 'Soto Ayam', qty: 1, price: 30000 },
        { name: 'Teh Botol', qty: 1, price: 8000 }
      ],
      total: 38000, 
      status: 'completed', 
      time: '09:30 AM',
      date: '17 Mar 2024',
      table: 'Table 8',
      notes: ''
    },
  ];

  const statusFilters = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { value: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { value: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'completed').length },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const statusStyles = {
    pending: {
      bg: 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      dot: 'bg-gradient-to-r from-yellow-400 to-orange-400',
      glow: 'shadow-yellow-400/50',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    processing: {
      bg: 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20',
      text: 'text-blue-800 dark:text-blue-300',
      dot: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      glow: 'shadow-blue-400/50',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    completed: {
      bg: 'bg-gradient-to-r from-green-400/20 to-emerald-400/20',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-gradient-to-r from-green-400 to-emerald-400',
      glow: 'shadow-green-400/50',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  };

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
          Orders Management
        </h1>
        <p className="mt-2 text-dark-600 dark:text-dark-400">
          Track and manage all your restaurant orders in real-time
        </p>
        
        {/* Decorative element */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-orange-500 to-red-500 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      </motion.div>

      {/* Status Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        {statusFilters.map((filter, index) => (
          <motion.button
            key={filter.value}
            onClick={() => setSelectedStatus(filter.value)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              selectedStatus === filter.value
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border border-white/20 dark:border-dark-700/20 text-dark-700 dark:text-dark-300 hover:shadow-lg'
            }`}
          >
            <span className="flex items-center gap-2">
              {filter.label}
              <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full ${
                selectedStatus === filter.value
                  ? 'bg-white/20 text-white'
                  : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300'
              }`}>
                {filter.count}
              </span>
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Orders Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${
                order.status === 'pending' ? 'from-yellow-500 to-orange-500' :
                order.status === 'processing' ? 'from-blue-500 to-cyan-500' :
                'from-green-500 to-emerald-500'
              } rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
              
              <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-dark-700/20 p-6 space-y-4">
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-dark-900 dark:text-white">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      {order.date} • {order.time}
                    </p>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status as keyof typeof statusStyles].bg} ${statusStyles[order.status as keyof typeof statusStyles].text} backdrop-blur-xl`}>
                    <span className={`w-2 h-2 rounded-full ${statusStyles[order.status as keyof typeof statusStyles].dot} mr-2 shadow-md ${statusStyles[order.status as keyof typeof statusStyles].glow}`}></span>
                    {order.status}
                  </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                    {order.client.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-white">{order.client}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{order.table}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-dark-700 dark:text-dark-300">
                        {item.qty}x {item.name}
                      </span>
                      <span className="text-dark-900 dark:text-white font-semibold">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Order Total */}
                <div className="pt-4 border-t border-dark-200/20 dark:border-dark-700/20">
                  <div className="flex justify-between items-center">
                    <p className="text-dark-600 dark:text-dark-400">Total</p>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                      Rp {order.total.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/25"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl shadow-lg shadow-green-500/25"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50"
            >
              <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                    Order #{selectedOrder.id}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-dark-100/50 dark:hover:bg-dark-700/50 rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5 text-dark-600 dark:text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Order Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/25">
                        {selectedOrder.client.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900 dark:text-white">{selectedOrder.client}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{selectedOrder.table}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[selectedOrder.status as keyof typeof statusStyles].bg} ${statusStyles[selectedOrder.status as keyof typeof statusStyles].text}`}>
                      {statusStyles[selectedOrder.status as keyof typeof statusStyles].icon}
                      <span className="ml-2">{selectedOrder.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-dark-900 dark:text-white">Order Items</h4>
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-dark-50/50 dark:bg-dark-900/50 rounded-xl">
                        <div>
                          <p className="font-medium text-dark-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-dark-500 dark:text-dark-400">Qty: {item.qty}</p>
                        </div>
                        <p className="font-semibold text-dark-900 dark:text-white">
                          Rp {(item.qty * item.price).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.notes && (
                    <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-xl">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Notes</p>
                      <p className="text-sm text-dark-700 dark:text-dark-300">{selectedOrder.notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-dark-200/20 dark:border-dark-700/20">
                    <p className="text-lg text-dark-600 dark:text-dark-400">Total Amount</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                      Rp {selectedOrder.total.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25"
                    >
                      Process Order
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-4 bg-dark-100/50 dark:bg-dark-700/50 text-dark-700 dark:text-dark-300 font-semibold rounded-xl border border-dark-300/20 dark:border-dark-600/20"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Cancel
                    </motion.button>
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

export default Orders;