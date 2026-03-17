import React from 'react';

const Dashboard: React.FC = () => {
  const stats = [
    { 
      name: 'Total Orders Today', 
      value: '24', 
      change: '+12%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      bgGradient: 'from-blue-500 to-cyan-400'
    },
    { 
      name: 'Pending Orders', 
      value: '8', 
      change: '-3%', 
      changeType: 'negative',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-orange-500 to-red-400'
    },
    { 
      name: 'Revenue', 
      value: 'Rp 2.4M', 
      change: '+23%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgGradient: 'from-green-500 to-emerald-400'
    },
    { 
      name: 'Active Clients', 
      value: '142', 
      change: '+5%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgGradient: 'from-purple-500 to-pink-400'
    },
    { 
      name: 'QR Codes Generated', 
      value: '89', 
      change: '+17%', 
      changeType: 'positive',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4H4v4h4z" />
        </svg>
      ),
      bgGradient: 'from-indigo-500 to-blue-400'
    },
  ];

  const recentOrders = [
    { id: '001', client: 'John Doe', items: 3, total: 'Rp 150,000', status: 'pending', time: '2 min ago' },
    { id: '002', client: 'Jane Smith', items: 2, total: 'Rp 85,000', status: 'completed', time: '15 min ago' },
    { id: '003', client: 'Bob Johnson', items: 5, total: 'Rp 225,000', status: 'processing', time: '30 min ago' },
    { id: '004', client: 'Alice Brown', items: 1, total: 'Rp 45,000', status: 'completed', time: '1 hour ago' },
  ];

  const statusStyles = {
    pending: {
      bg: 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 dark:from-yellow-600/20 dark:to-orange-600/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      dot: 'bg-yellow-500'
    },
    processing: {
      bg: 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20 dark:from-blue-600/20 dark:to-cyan-600/20',
      text: 'text-blue-800 dark:text-blue-300',
      dot: 'bg-blue-500'
    },
    completed: {
      bg: 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 dark:from-green-600/20 dark:to-emerald-600/20',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-green-500'
    },
    cancelled: {
      bg: 'bg-gradient-to-r from-red-400/20 to-pink-400/20 dark:from-red-600/20 dark:to-pink-600/20',
      text: 'text-red-800 dark:text-red-300',
      dot: 'bg-red-500'
    },
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-dark-600 dark:text-dark-400">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>
      
      {/* Stats Grid */}
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="relative bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-10 dark:opacity-20`}></div>
            
            <div className="relative p-6">
              <dt className="flex items-center justify-between">
                <p className="text-sm font-medium text-dark-600 dark:text-dark-300">{stat.name}</p>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.bgGradient} text-white`}>
                  {stat.icon}
                </div>
              </dt>
              <dd className="mt-4">
                <p className="text-3xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <p className={`flex items-center text-sm font-semibold ${
                    stat.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                    {stat.change}
                  </p>
                  <span className="ml-2 text-sm text-dark-500 dark:text-dark-400">from yesterday</span>
                </div>
              </dd>
            </div>
          </div>
        ))}
      </dl>

      {/* Recent Orders */}
      <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-dark-200/20 dark:border-dark-700/20">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Recent Orders</h2>
              <p className="mt-1 text-sm text-dark-600 dark:text-dark-400">
                Monitor and manage your latest orders in real-time
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-neon"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All Orders
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200/10 dark:divide-dark-700/10">
            <thead className="bg-dark-50/50 dark:bg-dark-900/50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-dark-900 dark:text-white">
                  Order ID
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-dark-900 dark:text-white">
                  Client
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-dark-900 dark:text-white">
                  Items
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-dark-900 dark:text-white">
                  Total
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-dark-900 dark:text-white">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-dark-900 dark:text-white">
                  Time
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200/10 dark:divide-dark-700/10">
              {recentOrders.map((order, index) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-dark-50/50 dark:hover:bg-dark-900/50 transition-colors duration-200"
                >
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                    <span className="font-medium text-dark-900 dark:text-white">#{order.id}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-700 dark:text-dark-300">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                        {order.client.charAt(0)}
                      </div>
                      <span className="ml-3">{order.client}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-700 dark:text-dark-300">
                    {order.items} items
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-dark-900 dark:text-white">
                    {order.total}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[order.status as keyof typeof statusStyles].bg} ${statusStyles[order.status as keyof typeof statusStyles].text}`}>
                      <span className={`w-2 h-2 rounded-full ${statusStyles[order.status as keyof typeof statusStyles].dot} mr-2`}></span>
                      {order.status}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-500 dark:text-dark-400">
                    {order.time}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'New Order', icon: '➕', color: 'from-blue-500 to-cyan-400' },
          { title: 'Generate QR', icon: '📱', color: 'from-purple-500 to-pink-400' },
          { title: 'Add Client', icon: '👤', color: 'from-green-500 to-emerald-400' },
          { title: 'View Reports', icon: '📊', color: 'from-orange-500 to-red-400' },
        ].map((action, index) => (
          <button
            key={index}
            className="p-6 bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group animate-slide-in"
            style={{ animationDelay: `${index * 100 + 300}ms` }}
          >
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">{action.title}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;