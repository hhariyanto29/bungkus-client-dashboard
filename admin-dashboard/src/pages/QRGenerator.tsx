import React, { useState } from 'react';
import { QrCode, Download, Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';

const QRGenerator: React.FC = () => {
  const [qrData, setQrData] = useState({
    clientName: '',
    packageId: '',
    trackingNumber: '',
    deliveryDate: '',
    notes: ''
  });
  const [qrSize, setQrSize] = useState(256);
  const [showPreview, setShowPreview] = useState(true);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQrData(prev => ({ ...prev, [name]: value }));
  };

  const generateQR = () => {
    if (!qrData.clientName || !qrData.packageId) {
      alert('Please fill in Client Name and Package ID');
      return;
    }

    setLoading(true);
    // Simulate QR generation
    setTimeout(() => {
      const mockQR = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(
        JSON.stringify({
          client: qrData.clientName,
          package: qrData.packageId,
          tracking: qrData.trackingNumber || 'N/A',
          date: qrData.deliveryDate || new Date().toISOString().split('T')[0],
          notes: qrData.notes || 'No notes'
        })
      )}`;
      setGeneratedQR(mockQR);
      setLoading(false);
    }, 1000);
  };

  const downloadQR = (format: 'png' | 'svg' | 'pdf') => {
    if (!generatedQR) return;
    alert(`Downloading QR as ${format.toUpperCase()}...`);
    // In production, this would trigger actual download
  };

  const copyToClipboard = () => {
    if (!generatedQR) return;
    navigator.clipboard.writeText(generatedQR);
    alert('QR URL copied to clipboard!');
  };

  const resetForm = () => {
    setQrData({
      clientName: '',
      packageId: '',
      trackingNumber: '',
      deliveryDate: '',
      notes: ''
    });
    setGeneratedQR(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 text-white">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              QR Code Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create unique QR codes for package tracking
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Generate New QR Code
          </h2>

          <form className="space-y-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                name="clientName"
                value={qrData.clientName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300"
                placeholder="Enter client name"
              />
            </div>

            {/* Package ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Package ID *
              </label>
              <input
                type="text"
                name="packageId"
                value={qrData.packageId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300"
                placeholder="PKG-2024-001"
              />
            </div>

            {/* Tracking Number & Delivery Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  name="trackingNumber"
                  value={qrData.trackingNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="TRK-123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={qrData.deliveryDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={qrData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-300 resize-none"
                placeholder="Any special instructions or notes..."
              />
            </div>

            {/* QR Size Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  QR Code Size: {qrSize}px
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              <input
                type="range"
                min="128"
                max="512"
                step="64"
                value={qrSize}
                onChange={(e) => setQrSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>128px</span>
                <span>256px</span>
                <span>384px</span>
                <span>512px</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={generateQR}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-400 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Generate QR Code
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Reset
                </div>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Preview & Actions */}
        <div className="space-y-8">
          {/* QR Preview */}
          {showPreview && (
            <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                QR Code Preview
              </h2>
              
              <div className="flex flex-col items-center justify-center p-8">
                {generatedQR ? (
                  <>
                    <div className="mb-6 p-4 bg-white rounded-xl shadow-inner">
                      <img 
                        src={generatedQR} 
                        alt="Generated QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
                      Scan this QR code to view package details
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                      Contains: Client, Package ID, Tracking, Date
                    </p>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 mb-4">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Generate a QR code to see preview here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Actions */}
          {generatedQR && (
            <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Download & Share
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => downloadQR('png')}
                  className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col items-center">
                    <Download className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">PNG</span>
                    <span className="text-xs text-blue-600/70 dark:text-blue-400/70">High Quality</span>
                  </div>
                </button>
                
                <button
                  onClick={() => downloadQR('svg')}
                  className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col items-center">
                    <Download className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">SVG</span>
                    <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Vector Format</span>
                  </div>
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800/30 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col items-center">
                    <Copy className="w-8 h-8 text-violet-600 dark:text-violet-400 mb-2" />
                    <span className="font-medium text-violet-700 dark:text-violet-300">Copy URL</span>
                    <span className="text-xs text-violet-600/70 dark:text-violet-400/70">Share Link</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Recent QR Codes */}
          <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent QR Codes
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                5 generated today
              </span>
            </div>
            
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div 
                  key={item}
                  className="flex items-center p-4 rounded-xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mr-4">
                    <QrCode className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Client #{1000 + item} - Package PKG-2024-00{item}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Generated 2 hours ago • Size: 256px
                    </p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;