import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { qrAPI, ordersAPI } from '../services/api';
import { toast } from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  client_name: string;
}

interface QRCode {
  id: number;
  order_number: string;
  client_name: string;
  portal_url: string;
  qr_image: string;
  is_active: boolean;
  access_count: number;
  created_at: string;
}

interface GeneratedQR {
  id: number;
  qr_image: string;
  portal_url: string;
}

const QRGenerator: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingQRCodes, setIsLoadingQRCodes] = useState(true);
  const [deliveryLoading, setDeliveryLoading] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
    fetchQRCodes();
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.data || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchQRCodes = async () => {
    setIsLoadingQRCodes(true);
    try {
      const response = await qrAPI.getAll();
      setQrCodes(response.data.data || []);
    } catch {
      toast.error('Failed to load QR codes');
    } finally {
      setIsLoadingQRCodes(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedOrderId) {
      toast.error('Select an order first');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await qrAPI.generate(selectedOrderId as number);
      const data = response.data.data;
      setGeneratedQR({
        id: data.id,
        qr_image: data.qr_image,
        portal_url: data.portal_url,
      });
      toast.success('QR code generated');
      fetchQRCodes();
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmail = async () => {
    if (!generatedQR) return;
    const email = window.prompt('Enter email address:');
    if (!email) return;
    setDeliveryLoading('email');
    try {
      await qrAPI.deliver(generatedQR.id, 'email', email);
      toast.success(`QR sent to ${email}`);
    } catch {
      toast.error('Failed to send email');
    } finally {
      setDeliveryLoading(null);
    }
  };

  const handleWhatsApp = async () => {
    if (!generatedQR) return;
    const phone = window.prompt('Enter phone number (with country code):');
    if (!phone) return;
    setDeliveryLoading('whatsapp');
    try {
      const response = await qrAPI.deliver(generatedQR.id, 'whatsapp', phone);
      const link = response.data.data?.whatsapp_link;
      if (link) window.open(link, '_blank');
      toast.success('WhatsApp link opened');
    } catch {
      toast.error('Failed to send via WhatsApp');
    } finally {
      setDeliveryLoading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    if (!generatedQR) return;
    try {
      await navigator.clipboard.writeText(generatedQR.portal_url);
      toast.success('Portal URL copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await qrAPI.deactivate(id);
      toast.success('QR code deactivated');
      fetchQRCodes();
    } catch {
      toast.error('Failed to deactivate QR code');
    }
  };

  const handleRegenerate = async (id: number) => {
    try {
      await qrAPI.regenerate(id);
      toast.success('QR code regenerated');
      fetchQRCodes();
    } catch {
      toast.error('Failed to regenerate QR code');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl tracking-widest text-[#00f0ff] uppercase"
      >
        QR Codes
      </motion.h1>

      {/* Generate QR Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm"
      >
        <h2 className="font-display text-lg tracking-wider text-white/80 mb-6">
          Generate QR
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Order Select */}
          <div className="flex-1 w-full">
            <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">
              Select Order
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) =>
                setSelectedOrderId(e.target.value ? Number(e.target.value) : '')
              }
              disabled={isLoadingOrders}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/30 outline-none transition-colors focus:border-[#00f0ff]/50 focus:ring-1 focus:ring-[#00f0ff]/30 appearance-none"
            >
              <option value="" className="bg-gray-900 text-white">
                {isLoadingOrders ? 'Loading orders...' : '-- Choose an order --'}
              </option>
              {orders.map((order) => (
                <option
                  key={order.id}
                  value={order.id}
                  className="bg-gray-900 text-white"
                >
                  {order.order_number} — {order.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedOrderId || isGenerating}
            className="shrink-0 rounded-lg bg-[#00f0ff] px-8 py-3 font-display text-sm uppercase tracking-wider text-black transition-all hover:shadow-lg hover:shadow-[#00f0ff]/25 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </span>
            ) : (
              'Generate QR'
            )}
          </button>
        </div>
      </motion.div>

      {/* Generated QR Display + Delivery */}
      <AnimatePresence>
        {generatedQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Glass Card with QR */}
            <div
              ref={printRef}
              className="print-area rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm flex flex-col items-center max-w-sm w-full"
            >
              <img
                src={`data:image/png;base64,${generatedQR.qr_image}`}
                alt="Generated QR Code"
                className="w-64 h-64 rounded-lg bg-white p-3"
              />
              <p className="mt-4 text-xs text-white/40 break-all text-center select-all">
                {generatedQR.portal_url}
              </p>
            </div>

            {/* Delivery Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
              <button
                onClick={handleEmail}
                disabled={deliveryLoading === 'email'}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:bg-white/10 hover:border-[#00f0ff]/30 disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                {deliveryLoading === 'email' ? '...' : 'Email'}
              </button>

              <button
                onClick={handleWhatsApp}
                disabled={deliveryLoading === 'whatsapp'}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:bg-white/10 hover:border-green-500/30 disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.39-1.583l-.386-.238-2.65.889.889-2.65-.238-.386A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                {deliveryLoading === 'whatsapp' ? '...' : 'WhatsApp'}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:bg-white/10 hover:border-white/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-2.25 0h.008v.008H16.5V12z" />
                </svg>
                Print
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition-all hover:bg-white/10 hover:border-[#00f0ff]/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.072a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.06" />
                </svg>
                Copy Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Codes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-display text-lg tracking-wider text-white/80">
            All QR Codes
          </h2>
        </div>

        {isLoadingQRCodes ? (
          <div className="flex items-center justify-center py-16">
            <svg
              className="h-8 w-8 animate-spin text-[#00f0ff]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="py-16 text-center text-white/30 text-sm">
            No QR codes yet. Generate one above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-white/30 border-b border-white/5">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Portal URL</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Views</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {qrCodes.map((qr) => (
                  <tr
                    key={qr.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-mono text-[#00f0ff]/80">
                      {qr.order_number}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {qr.client_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white/40 text-xs truncate block max-w-[200px]">
                        {qr.portal_url}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {qr.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400">Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                          <span className="text-white/30">Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-white/50">
                      {qr.access_count}
                    </td>
                    <td className="px-6 py-4 text-white/40">
                      {formatDate(qr.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {qr.is_active && (
                          <button
                            onClick={() => handleDeactivate(qr.id)}
                            className="rounded px-2.5 py-1 text-xs border border-white/10 text-white/50 transition-colors hover:border-red-500/30 hover:text-red-400"
                          >
                            Deactivate
                          </button>
                        )}
                        <button
                          onClick={() => handleRegenerate(qr.id)}
                          className="rounded px-2.5 py-1 text-xs border border-white/10 text-white/50 transition-colors hover:border-[#00f0ff]/30 hover:text-[#00f0ff]"
                        >
                          Regenerate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QRGenerator;
