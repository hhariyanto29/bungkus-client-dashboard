import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const Orders: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    revenue: 0
  });

  // Fetch orders
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = selectedStatus === 'all' ? {} : { status: selectedStatus };
      const response = await ordersAPI.getAll(params);
      
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      
      if (response.data.success) {
        const statsData = response.data.data;
        setStats({
          total: statsData.total_orders || 0,
          pending: statsData.pending_orders || 0,
          processing: statsData.processing_orders || 0,
          completed: statsData.completed_orders || 0,
          revenue: statsData.total_revenue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [selectedStatus]);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        fetchStats();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      {/* Header with Stats */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white mb-8 text-center"
        >
          Order Management
        </motion.h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-gray-300 text-sm">Total Orders</h3>
            <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-500/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30"
          >
            <h3 className="text-yellow-200 text-sm">Pending</h3>
            <p className="text-3xl font-bold text-yellow-300 mt-2">{stats.pending}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
          >
            <h3 className="text-blue-200 text-sm">Processing</h3>
            <p className="text-3xl font-bold text-blue-300 mt-2">{stats.processing}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-green-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <h3 className="text-green-200 text-sm">Completed</h3>
            <p className="text-3xl font-bold text-green-300 mt-2">{stats.completed}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
          >
            <h3 className="text-purple-200 text-sm">Revenue</h3>
            <p className="text-2xl font-bold text-purple-300 mt-2">{formatCurrency(stats.revenue)}</p>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-6 py-3 rounded-xl font-medium transition-all capitalize ${
                selectedStatus === status
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <p className="text-xl">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {orders.map((order, index) => {
                // Parse items from JSON string if needed
                const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">Order #{order.id}</h3>
                        <p className="text-gray-300">{order.client_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {items.slice(0, 2).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-gray-300">
                          <span>{item.name} x{item.qty}</span>
                          <span>{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      ))}
                      {items.length > 2 && (
                        <p className="text-gray-400 text-sm">+{items.length - 2} more items</p>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="text-gray-400 text-sm">
                        <p>Table {order.table_number}</p>
                        <p>{formatDate(order.created_at)}</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Order #{selectedOrder.id}</h2>
                  <p className="text-gray-300">{selectedOrder.client_name}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Order Details</h3>
                  <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-gray-300">
                        <span>{item.name} x{item.qty}</span>
                        <span>{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="font-semibold text-white">Total</span>
                      <span className="font-semibold text-white">{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Table</h4>
                    <p className="text-white">{selectedOrder.table_number}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Order Time</h4>
                    <p className="text-white">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Phone</h4>
                    <p className="text-white">{selectedOrder.phone || 'N/A'}</p>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Notes</h4>
                    <p className="text-white bg-white/5 rounded-lg p-3">{selectedOrder.notes}</p>
                  </div>
                )}

                {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                  <div className="flex gap-3 pt-4">
                    {selectedOrder.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                      >
                        Start Processing
                      </button>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors"
                      >
                        Mark as Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;