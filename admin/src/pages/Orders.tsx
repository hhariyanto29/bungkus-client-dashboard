import React, { useState } from 'react';

const Orders: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const orders = [
    { id: '001', client: 'John Doe', items: 3, total: 'Rp 150,000', status: 'pending', date: '2024-03-17', time: '14:30' },
    { id: '002', client: 'Jane Smith', items: 2, total: 'Rp 85,000', status: 'completed', date: '2024-03-17', time: '13:45' },
    { id: '003', client: 'Bob Johnson', items: 5, total: 'Rp 225,000', status: 'processing', date: '2024-03-16', time: '10:20' },
    { id: '004', client: 'Alice Brown', items: 1, total: 'Rp 45,000', status: 'completed', date: '2024-03-16', time: '09:15' },
    { id: '005', client: 'Charlie Wilson', items: 4, total: 'Rp 180,000', status: 'cancelled', date: '2024-03-15', time: '16:00' },
  ];

  const statusStyles = {
    pending: {
      bg: 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-600/20 dark:to-orange-600/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      dot: 'bg-yellow-500',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    processing: {
      bg: 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20 dark:from-blue-600/20 dark:to-cyan-600/20',
      text: 'text-blue-800 dark:text-blue-300',
      dot: 'bg-blue-500',
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    },
    completed: {
      bg: 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 dark:from-green-600/20 dark:to-emerald-600/20',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-green-500',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    cancelled: {
      bg: 'bg-gradient-to-r from-red-400/20 to-pink-400/20 dark:from-red-600/20 dark:to-pink-600/20',
      text: 'text-red-800 dark:text-red-300',
      dot: 'bg-red-500',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
              Orders Management
            </h1>
            <p className="mt-1 text-sm text-dark-600 dark:text-dark-400">
              Track and manage all customer orders in real-time
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-neon"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Order
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 animate-slide-in">
        {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              filterStatus === status
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-neon transform scale-105'
                : 'bg-white/70 dark:bg-dark-800/70 text-dark-700 dark:text-dark-300 hover:bg-dark-100/70 dark:hover:bg-dark-700/70'
            } backdrop-blur-xl`}
          >
            {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'all' && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Orders Table */}
      <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200/10 dark:divide-dark-700/10">
            <thead className="bg-dark-50/50 dark:bg-dark-900/50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200/10 dark:divide-dark-700/10">
              {filteredOrders.map((order, index) => (
                <tr 
                  key={order.id}
                  className="hover:bg-dark-50/50 dark:hover:bg-dark-900/50 transition-all duration-200 animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                    <span className="font-semibold text-dark-900 dark:text-white">#{order.id}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-700 dark:text-dark-300">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {order.client.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-dark-900 dark:text-white">{order.client}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">Customer ID: C{order.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="font-medium text-dark-700 dark:text-dark-300">{order.items}</span>
                      <span className="ml-1 text-dark-500 dark:text-dark-400">items</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="font-bold text-dark-900 dark:text-white">{order.total}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status as keyof typeof statusStyles].bg} ${statusStyles[order.status as keyof typeof statusStyles].text}`}>
                      <span className="mr-1.5">{statusStyles[order.status as keyof typeof statusStyles].icon}</span>
                      {order.status}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-500 dark:text-dark-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{order.date}</span>
                      <span className="mx-1">•</span>
                      <span>{order.time}</span>
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-accent-50 dark:hover:bg-accent-900/20 text-accent-600 dark:text-accent-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-200/20 dark:border-dark-700/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1.5 text-sm bg-white/50 dark:bg-dark-700/50 rounded-lg hover:bg-dark-100/50 dark:hover:bg-dark-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                1
              </button>
              <button className="px-3 py-1.5 text-sm bg-white/50 dark:bg-dark-700/50 rounded-lg hover:bg-dark-100/50 dark:hover:bg-dark-600/50 transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 text-sm bg-white/50 dark:bg-dark-700/50 rounded-lg hover:bg-dark-100/50 dark:hover:bg-dark-600/50 transition-colors">
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