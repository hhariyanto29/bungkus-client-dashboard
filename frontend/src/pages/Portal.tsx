import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { portalAPI } from '../services/api';
import OrderStatus from '../components/OrderStatus';
import Tracking from '../components/Tracking';
import Invoice from '../components/Invoice';
import TaxInvoice from '../components/TaxInvoice';
import OrderHistory from '../components/OrderHistory';

const TABS = [
  { id: 'status', label: 'Status', icon: '◈' },
  { id: 'tracking', label: 'Tracking', icon: '◉' },
  { id: 'invoice', label: 'Invoice', icon: '▤' },
  { id: 'faktur', label: 'Faktur', icon: '▥' },
  { id: 'history', label: 'Riwayat', icon: '◫' },
] as const;

type TabId = typeof TABS[number]['id'];

const Portal: React.FC = () => {
  const { secretHash } = useParams<{ secretHash: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('status');

  const orderQuery = useQuery({
    queryKey: ['portal', secretHash],
    queryFn: () => portalAPI.getOrder(secretHash!),
    enabled: !!secretHash,
  });

  const orderData = orderQuery.data?.data?.data || orderQuery.data?.data;

  if (orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] bg-grid flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm font-display tracking-wider">MEMUAT DATA...</p>
        </motion.div>
      </div>
    );
  }

  if (orderQuery.error || !orderData) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] bg-grid flex items-center justify-center p-4">
        <div className="fixed top-1/3 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-4xl mb-4 text-red-400/60">⚠</div>
          <h2 className="font-display text-xl text-white/60 mb-2">AKSES DITOLAK</h2>
          <p className="text-white/30 text-sm">Link tidak valid atau sudah kedaluwarsa.</p>
          <p className="text-white/20 text-xs mt-2">Hubungi admin untuk QR code baru.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] bg-grid">
      {/* Background glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-cyan-400 glow-cyan tracking-wider">
              BUNGKUS
            </h1>
            <p className="text-[10px] text-white/30 tracking-widest uppercase">Client Portal</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50 font-mono">{orderData.order?.order_number}</p>
            <p className="text-[10px] text-white/30">{orderData.order?.client_name}</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[60px] z-20 glass border-b border-white/5 no-print">
        <div className="max-w-lg mx-auto px-2 flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-center transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-cyan-400'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <span className="block text-base mb-0.5">{tab.icon}</span>
              <span className="block text-[10px] font-medium tracking-wider uppercase">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 rounded-full"
                  style={{ boxShadow: '0 0 8px rgba(0, 240, 255, 0.5)' }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'status' && <OrderStatus data={orderData} />}
            {activeTab === 'tracking' && <Tracking secretHash={secretHash!} />}
            {activeTab === 'invoice' && <Invoice secretHash={secretHash!} />}
            {activeTab === 'faktur' && <TaxInvoice secretHash={secretHash!} />}
            {activeTab === 'history' && <OrderHistory secretHash={secretHash!} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-white/5">
        <p className="text-[10px] text-white/15">
          PT Bungkus Indonesia &middot; Portal v2.0
        </p>
      </footer>
    </div>
  );
};

export default Portal;
