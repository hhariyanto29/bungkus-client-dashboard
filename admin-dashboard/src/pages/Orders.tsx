import React, { useState } from 'react';
import { Package, Search, Filter, Download, Eye, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const orders = [
    { id: 'ORD-2024-001', client: 'PT Maju Jaya', package: 'PKG-001', amount: 'Rp 2.500.000', status: 'completed', date: '2024-03-15', items: 5 },
    { id: 'ORD-2024-002', client: 'CV Sejahtera', package: 'PKG-002', amount: 'Rp 1.800.000', status: 'pending', date: '2024-03-16', items: 3 },
    { id: 'ORD-2024-003', client: 'UD Makmur', package: 'PKG-003', amount: 'Rp 3.200.000', status: 'processing', date: '2024-03-16', items: 8 },
    { id: 'ORD-2024-004', client: 'PT Abadi', package: 'PKG-004', amount: 'Rp 950.000', status: 'completed', date: '2024-03-14', items: 2 },
    { id: 'ORD-2024-005', client: 'CV Barokah', package: 'PKG-005', amount: 'Rp 4.100.000', status: 'shipped', date: '2024-03-17', items: 10 },
    { id: 'ORD-2024-006', client: 'PT Sentosa', package: 'PKG-006', amount: 'Rp 1.500.000', status: 'pending', date: '2024-03-17', items: 4 },
    { id: 'ORD-2024-007', client: 'UD Jaya Abadi', package: 'PKG-007', amount: 'Rp 2.800.000', status: 'processing', date: '2024-03-15', items: 6 },
    { id: 'ORD-2024-008', client: 'CV Mandiri', package: 'PKG-008', amount: 'Rp 3.500.000', status: 'completed', date: '2024-03-13', items: 7 },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'amount') {
      const amountA = parseInt(a.amount.replace(/[^\d]/g, ''));
      const amountB = parseInt(b.amount.replace(/[^\d]/g, ''));
      return sortOrder === 'desc' ? amountB - amountA : amountA - amountB;
    }
    return 0;
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === sortedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(sortedOrders.map(order => order.id));
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Orders Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and track all packaging orders
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
            + New Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{orders.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {orders.filter(o => o.status === 'processing').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Today</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">Rp 8.4M</p>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders by ID or client..."
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700 transition-colors"
            >
              {sortOrder === 'desc' ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedOrders.length === sortedOrders.length && sortedOrders.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedOrders.length} selected
              </span>
            </div>
            <div className="flex gap-2">
              {selectedOrders.length > 0 && (
                <>
                  <button className="px-4 py-2 text-sm bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                    Bulk Update
                  </button>
                  <button className="px-4 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    Delete Selected
                  </button>
                </>
              )}
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300"></th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Client</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Package</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Items</th>
                <th className="py-4 px-6 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr 
                  key={order.id}
                  className="border-b border-gray-100/50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900 dark:text-white">{order.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700 dark:text-gray-300">{order.client}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700 dark:text-gray-300">{order.package}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900 dark:text-white">{order.amount}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600 dark:text-gray-400">{order.date}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700 dark:text-gray-300">{order.items} items</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {sortedOrders.length} of {orders.length} orders
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                1
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                2
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;