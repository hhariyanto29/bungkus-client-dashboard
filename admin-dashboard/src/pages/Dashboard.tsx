import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Dashboard Overview
        </h1>
        {/* Stats cards and charts will be implemented in Phase 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">Rp 0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;