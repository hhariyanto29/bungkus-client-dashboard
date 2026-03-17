import React from 'react';

const QRGenerator: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          QR Code Generator
        </h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400">
            QR Code generation interface will be implemented in Phase 2
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;