import React from 'react';
import { 
  ShoppingCart, 
  Clock, 
  DollarSign, 
  Users, 
  Package 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Orders',
      value: '1,248',
      change: '+12.5%',
      icon: <ShoppingCart className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      title: 'Pending Orders',
      value: '42',
      change: '-3.2%',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
    },
    {
      title: 'Revenue',
      value: 'Rp 48.2M',
      change: '+24.8%',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'from-emerald-500 to-green-400',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
    },
    {
      title: 'Active Clients',
      value: '89',
      change: '+8.3%',
      icon: <Users className="w-8 h-8" />,
      color: 'from-violet-500 to-purple-400',
      bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20'
    },
    {
      title: 'Packages Today',
      value: '156',
      change: '+5.7%',
      icon: <Package className="w-8 h-8" />,
      color: 'from-rose-500 to-pink-400',
      bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid - Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`${stat.bgColor} backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:shadow-lg transition-shadow duration-300">
              View All
            </button>
          </div>
          
          {/* Activity List */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="flex items-center p-4 rounded-xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-white font-bold mr-4">
                  {item}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Order #{1000 + item} - Client Name
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Package delivered • 2 hours ago
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;