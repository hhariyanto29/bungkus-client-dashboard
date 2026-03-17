import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { qrAPI, clientsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const QRGenerator: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [tableNumbers, setTableNumbers] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    used: 0
  });

  // Fetch clients and QR codes
  useEffect(() => {
    fetchClients();
    fetchQrCodes();
    fetchStats();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({ status: 'active' });
      
      if (response.data.success) {
        setClients(response.data.data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    }
  };

  const fetchQrCodes = async () => {
    setIsLoading(true);
    try {
      const response = await qrAPI.getAll({ limit: 20, orderBy: 'created_at', order: 'desc' });
      
      if (response.data.success) {
        setQrCodes(response.data.data.qr_codes || []);
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast.error('Failed to fetch QR codes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await qrAPI.getStats();
      
      if (response.data.success) {
        const data = response.data.data;
        setStats({
          total: data.total_codes || 0,
          active: data.active_codes || 0,
          expired: data.expired_codes || 0,
          used: data.used_codes || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateQRCodes = async () => {
    if (!selectedClient || !tableNumbers) {
      toast.error('Please select a client and enter table numbers');
      return;
    }

    setIsGenerating(true);
    try {
      const tableArray = tableNumbers.split(',').map(t => t.trim()).filter(t => t);
      
      if (tableArray.length === 1) {
        // Single QR code
        const response = await qrAPI.generate({
          client_id: parseInt(selectedClient),
          table_number: tableArray[0],
          valid_until: validUntil || undefined
        });
        
        if (response.data.success) {
          toast.success('QR code generated successfully');
        }
      } else {
        // Bulk generation
        const response = await qrAPI.bulkGenerate(
          parseInt(selectedClient),
          tableArray,
          validUntil || undefined
        );
        
        if (response.data.success) {
          toast.success(`${tableArray.length} QR codes generated successfully`);
        }
      }

      // Refresh data
      fetchQrCodes();
      fetchStats();
      
      // Reset form
      setSelectedClient('');
      setTableNumbers('');
      setValidUntil('');
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateQRStatus = async (id: number, status: string) => {
    try {
      const response = await qrAPI.updateStatus(id, status);
      
      if (response.data.success) {
        toast.success(`QR code ${status}`);
        fetchQrCodes();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating QR status:', error);
      toast.error('Failed to update QR code status');
    }
  };

  const downloadQR = (qrData: string, clientName: string, tableNumber: string) => {
    const svg = document.getElementById(`qr-${qrData}`)?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR-${clientName}-Table-${tableNumber}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-white mb-8 text-center"
        >
          QR Code Generator
        </motion.h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-gray-300 text-sm mb-2">Total QR Codes</h3>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-green-500/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
          >
            <h3 className="text-green-200 text-sm mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-300">{stats.active}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
          >
            <h3 className="text-blue-200 text-sm mb-2">Used Today</h3>
            <p className="text-3xl font-bold text-blue-300">{stats.used}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-red-500/30"
          >
            <h3 className="text-red-200 text-sm mb-2">Expired</h3>
            <p className="text-3xl font-bold text-red-300">{stats.expired}</p>
          </motion.div>
        </div>

        {/* QR Generator Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Generate New QR Code</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="" className="bg-gray-900">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-gray-900">
                    {client.restaurant_name} - {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Table Numbers
              </label>
              <input
                type="text"
                placeholder="e.g., 1, 2, 3 or just 5"
                value={tableNumbers}
                onChange={(e) => setTableNumbers(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valid Until (Optional)
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button
            onClick={generateQRCodes}
            disabled={isGenerating || !selectedClient || !tableNumbers}
            className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-medium transition-all flex items-center justify-center"
          >
            {isGenerating ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate QR Code(s)'
            )}
          </button>
        </motion.div>

        {/* Generated QR Codes */}
        <h2 className="text-2xl font-bold text-white mb-6">Recent QR Codes</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <p className="text-xl">No QR codes generated yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map((qr, index) => (
              <motion.div
                key={qr.id}
                id={`qr-${qr.qr_data}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="bg-white rounded-xl p-4 mb-4">
                  <QRCodeSVG
                    value={qr.qr_data}
                    size={200}
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{qr.restaurant_name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Table {qr.table_number}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      qr.status === 'active'
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : qr.status === 'used'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {qr.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>Created: {formatDate(qr.created_at)}</p>
                    {qr.valid_until && (
                      <p>Expires: {formatDate(qr.valid_until)}</p>
                    )}
                    {qr.last_used && (
                      <p>Last used: {formatDate(qr.last_used)}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => downloadQR(qr.qr_data, qr.restaurant_name, qr.table_number)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                    {qr.status === 'active' && (
                      <button
                        onClick={() => updateQRStatus(qr.id, 'deactivated')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                    {qr.status === 'deactivated' && (
                      <button
                        onClick={() => updateQRStatus(qr.id, 'active')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;