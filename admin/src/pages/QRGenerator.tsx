import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface QRFormData {
  orderId: string;
  expiresIn: string;
  notes?: string;
}

const QRGenerator: React.FC = () => {
  const [qrCode, setQrCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<QRFormData>();

  const onSubmit = async (data: QRFormData) => {
    setIsGenerating(true);
    // Simulate QR generation
    setTimeout(() => {
      // This would be replaced with actual QR generation logic
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ORDER-${data.orderId}-${Date.now()}`);
      setIsGenerating(false);
    }, 1000);
  };

  const recentQRCodes = [
    { id: '1', order: '#001', client: 'John Doe', created: '2 min ago', status: 'active', accesses: 0, expires: '30 min' },
    { id: '2', order: '#002', client: 'Jane Smith', created: '1 hour ago', status: 'active', accesses: 3, expires: '23 hours' },
    { id: '3', order: '#003', client: 'Bob Johnson', created: '3 hours ago', status: 'expired', accesses: 5, expires: 'Expired' },
    { id: '4', order: '#004', client: 'Alice Brown', created: '1 day ago', status: 'active', accesses: 12, expires: '6 days' },
  ];

  const statusStyles = {
    active: {
      bg: 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 dark:from-green-600/20 dark:to-emerald-600/20',
      text: 'text-green-800 dark:text-green-300',
      dot: 'bg-green-500'
    },
    expired: {
      bg: 'bg-gradient-to-r from-red-400/20 to-pink-400/20 dark:from-red-600/20 dark:to-pink-600/20',
      text: 'text-red-800 dark:text-red-300',
      dot: 'bg-red-500'
    },
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400">
          QR Code Generator
        </h1>
        <p className="mt-1 text-sm text-dark-600 dark:text-dark-400">
          Generate secure QR codes for order tracking and validation
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* QR Generation Form */}
        <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark p-6 animate-slide-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-white flex items-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white mr-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4H4v4h4z" />
                </svg>
              </div>
              Generate New QR Code
            </h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Order ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <input
                  {...register('orderId', { required: 'Order ID is required' })}
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-dark-700/50 border border-dark-300/20 dark:border-dark-600/20 rounded-xl text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter order ID (e.g., #001)"
                />
              </div>
              {errors.orderId && (
                <p className="mt-1 text-sm text-red-500 animate-slide-in">{errors.orderId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="expiresIn" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Expiration Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <select
                  {...register('expiresIn', { required: 'Please select expiration time' })}
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-dark-700/50 border border-dark-300/20 dark:border-dark-600/20 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                >
                  <option value="">Select expiration time</option>
                  <option value="30m">30 minutes</option>
                  <option value="1h">1 hour</option>
                  <option value="6h">6 hours</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="never">Never expires</option>
                </select>
              </div>
              {errors.expiresIn && (
                <p className="mt-1 text-sm text-red-500 animate-slide-in">{errors.expiresIn.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Notes (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <svg className="h-5 w-5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="block w-full pl-10 pr-3 py-3 bg-white/50 dark:bg-dark-700/50 border border-dark-300/20 dark:border-dark-600/20 rounded-xl text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder="Add any special instructions or notes..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex justify-center items-center py-3 px-4 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-[1.02] hover:shadow-neon active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate QR Code
                </>
              )}
            </button>
          </form>
        </div>

        {/* QR Preview */}
        <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark p-6 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-white flex items-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-secondary-500 to-primary-500 text-white mr-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              QR Code Preview
            </h2>
          </div>
          
          {qrCode ? (
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl blur-xl opacity-20 animate-pulse-slow"></div>
                <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all duration-300 hover:scale-105">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button className="inline-flex items-center justify-center px-4 py-2.5 bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-xl hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-all duration-300 hover:scale-105">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9 9 0 10-13.432 0m13.432 0A9 9 0 0112 21m0-9a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                  Share Link
                </button>
              </div>
              
              <button 
                onClick={() => {
                  setQrCode('');
                  reset();
                }}
                className="mt-3 text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Generate another QR code
              </button>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-full bg-dark-100/50 dark:bg-dark-700/50 mb-4">
                <svg className="w-12 h-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M8 20h2m-2-4v-4H4v4h4z" />
                </svg>
              </div>
              <p className="text-dark-600 dark:text-dark-400">Fill in the form to generate a QR code</p>
              <p className="text-sm text-dark-500 dark:text-dark-500 mt-1">Preview will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent QR Codes */}
      <div className="bg-white/70 dark:bg-dark-800/70 backdrop-blur-xl rounded-2xl shadow-glass dark:shadow-glass-dark overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-dark-200/20 dark:border-dark-700/20">
          <h2 className="text-xl font-bold text-dark-900 dark:text-white flex items-center">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white mr-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            Recent QR Codes
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-200/10 dark:divide-dark-700/10">
            <thead className="bg-dark-50/50 dark:bg-dark-900/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Scans
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-dark-900 dark:text-white uppercase tracking-wider">
                  Expires
                </th>
                <th className="relative py-3.5 pl-3 pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-200/10 dark:divide-dark-700/10">
              {recentQRCodes.map((qr) => (
                <tr key={qr.id} className="hover:bg-dark-50/50 dark:hover:bg-dark-900/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-white">
                    {qr.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-700 dark:text-dark-300">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                        {qr.client.charAt(0)}
                      </div>
                      <span className="ml-3">{qr.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500 dark:text-dark-400">
                    {qr.created}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyles[qr.status as keyof typeof statusStyles].bg} ${statusStyles[qr.status as keyof typeof statusStyles].text}`}>
                      <span className={`w-2 h-2 rounded-full ${statusStyles[qr.status as keyof typeof statusStyles].dot} mr-2`}></span>
                      {qr.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-700 dark:text-dark-300">
                    <div className="flex items-center">
                      <span className="font-semibold">{qr.accesses}</span>
                      <span className="ml-1 text-dark-500 dark:text-dark-400">scans</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-500 dark:text-dark-400">
                    {qr.expires}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors mr-3">
                      View
                    </button>
                    {qr.status === 'active' && (
                      <button className="text-red-600 dark:text-red-400 hover:text-red-500 transition-colors">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;