import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QRGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    tableNumber: '',
    validUntil: '',
  });
  const [generatedQRs, setGeneratedQRs] = useState<Array<{
    id: number;
    client: string;
    table: string;
    created: string;
    status: 'active' | 'expired';
  }>>([
    { id: 1, client: 'Restaurant ABC', table: '12', created: '2024-03-17 10:30 AM', status: 'active' },
    { id: 2, client: 'Cafe XYZ', table: '5', created: '2024-03-17 09:15 AM', status: 'active' },
    { id: 3, client: 'Bistro 123', table: '8', created: '2024-03-17 08:45 AM', status: 'expired' },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate QR generation
    setTimeout(() => {
      const newQR: {
        id: number;
        client: string;
        table: string;
        created: string;
        status: 'active' | 'expired';
      } = {
        id: generatedQRs.length + 1,
        client: formData.clientName,
        table: formData.tableNumber,
        created: new Date().toLocaleString(),
        status: 'active' as const,
      };
      setGeneratedQRs([newQR, ...generatedQRs]);
      setIsGenerating(false);
      setShowSuccess(true);
      setFormData({ clientName: '', tableNumber: '', validUntil: '' });
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const statusStyles = {
    active: {
      bg: 'bg-gradient-to-r from-green-400/20 to-emerald-400/20',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-gradient-to-r from-green-400 to-emerald-400',
      glow: 'shadow-green-400/50'
    },
    expired: {
      bg: 'bg-gradient-to-r from-red-400/20 to-pink-400/20',
      text: 'text-red-800 dark:text-red-300',
      dot: 'bg-gradient-to-r from-red-400 to-pink-400',
      glow: 'shadow-red-400/50'
    }
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
          QR Code Generator
        </h1>
        <p className="mt-2 text-dark-600 dark:text-dark-400">
          Generate unique QR codes for your restaurant tables
        </p>
        
        {/* Decorative element */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Generator Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/20 p-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4 shadow-lg shadow-purple-500/25">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4H4v4h4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                Create New QR Code
              </h2>
            </motion.div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label htmlFor="clientName" className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Client/Restaurant Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-dark-900/50 border border-dark-300/20 dark:border-dark-600/20 rounded-xl text-dark-900 dark:text-white placeholder-dark-400 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter client name"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label htmlFor="tableNumber" className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Table Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="tableNumber"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-dark-900/50 border border-dark-300/20 dark:border-dark-600/20 rounded-xl text-dark-900 dark:text-white placeholder-dark-400 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="e.g., Table 12"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <label htmlFor="validUntil" className="block text-sm font-semibold text-dark-700 dark:text-dark-300 mb-2">
                  Valid Until (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="datetime-local"
                    id="validUntil"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-dark-900/50 border border-dark-300/20 dark:border-dark-600/20 rounded-xl text-dark-900 dark:text-white placeholder-dark-400 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating QR Code...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Generate QR Code
                    </div>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* QR Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/20 p-8 h-full flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                rotateY: [0, 180, 360],
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="mb-6"
            >
              <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <div className="w-40 h-40 bg-white rounded-2xl p-4">
                  {/* QR Code Placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-dark-900 to-dark-700 rounded-lg"></div>
                </div>
              </div>
            </motion.div>
            <p className="text-center text-dark-600 dark:text-dark-400 mb-2">
              QR Code Preview
            </p>
            <p className="text-center text-sm text-dark-500 dark:text-dark-500">
              Your QR code will appear here
            </p>
          </div>
        </motion.div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/30 flex items-center"
          >
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            QR Code generated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent QR Codes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
        <div className="relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-dark-700/20 overflow-hidden">
          <div className="p-6 border-b border-dark-200/10 dark:border-dark-700/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
              Recently Generated QR Codes
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-dark-50/30 to-dark-100/30 dark:from-dark-900/30 dark:to-dark-800/30">
                <tr>
                  <th className="py-4 pl-6 pr-3 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Client
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Table
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Created
                  </th>
                  <th className="px-3 py-4 text-left text-sm font-semibold text-dark-900 dark:text-white">
                    Status
                  </th>
                  <th className="relative py-4 pl-3 pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200/5 dark:divide-dark-700/5">
                {generatedQRs.map((qr, index) => (
                  <motion.tr
                    key={qr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 transition-all duration-300"
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-dark-900 dark:text-white">
                      {qr.client}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-700 dark:text-dark-300">
                      {qr.table}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-dark-700 dark:text-dark-300">
                      {qr.created}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[qr.status].bg} ${statusStyles[qr.status].text} backdrop-blur-xl`}>
                        <span className={`w-2 h-2 rounded-full ${statusStyles[qr.status].dot} mr-2 shadow-md ${statusStyles[qr.status].glow}`}></span>
                        {qr.status}
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <button className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-semibold mr-3">
                        Download
                      </button>
                      <button className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold">
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRGenerator;