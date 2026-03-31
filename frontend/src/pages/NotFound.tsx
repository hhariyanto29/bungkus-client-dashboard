import React from 'react';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => (
  <div className="min-h-screen bg-[#0a0a1a] bg-grid flex items-center justify-center p-4">
    <div className="fixed top-1/3 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-[120px]" />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <h1 className="font-display text-6xl font-bold text-white/20 mb-4">404</h1>
      <p className="text-white/40 text-lg mb-2">Link tidak valid</p>
      <p className="text-white/20 text-sm">Silakan scan ulang QR code Anda atau hubungi admin.</p>
    </motion.div>
  </div>
);

export default NotFound;
