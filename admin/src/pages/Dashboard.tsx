import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';

const formatRupiah = (value: number): string => {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`;
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const productionStatusColor: Record<string, string> = {
  pending: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
  design: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  production: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
  qc: 'bg-orange-400/20 text-orange-300 border-orange-400/30',
  ready: 'bg-teal-400/20 text-teal-300 border-teal-400/30',
  shipped: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
  delivered: 'bg-green-400/20 text-green-300 border-green-400/30',
};

const paymentStatusColor: Record<string, string> = {
  unpaid: 'bg-red-400/20 text-red-300 border-red-400/30',
  dp: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
  lunas: 'bg-green-400/20 text-green-300 border-green-400/30',
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const OrdersIcon = () => (
  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
);

const ClientsIcon = () => (
  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const QRIcon = () => (
  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
  </svg>
);

const Dashboard: React.FC = () => {
  const { stats, recentOrders, isLoading } = useDashboardData();

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: <OrdersIcon /> },
    { label: 'Revenue', value: formatRupiah(stats.totalRevenue), icon: <RevenueIcon /> },
    { label: 'Active Clients', value: stats.activeClients.toLocaleString(), icon: <ClientsIcon /> },
    { label: 'QR Generated', value: stats.qrCodesGenerated.toLocaleString(), icon: <QRIcon /> },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold tracking-wider text-white">
          DASHBOARD
        </h1>
        <p className="mt-1 font-sans text-sm text-gray-400">
          Real-time overview of your operations
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans uppercase tracking-widest text-gray-500">
                {card.label}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                {card.icon}
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-bold tracking-wide text-white">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, delay: 0.35 }}
        className="rounded-xl border border-white/10 bg-white/5 backdrop-blur"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-lg font-semibold tracking-wide text-white">
            RECENT ORDERS
          </h2>
          <Link
            to="/orders"
            className="font-sans text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-widest text-gray-500">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Production</th>
                <th className="px-6 py-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    <p className="mt-3 text-sm">Loading orders...</p>
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => {
                  const prodStyle =
                    productionStatusColor[order.status] ||
                    'bg-white/10 text-gray-300 border-white/10';
                  const payStyle =
                    paymentStatusColor[order.paymentStatus] ||
                    paymentStatusColor['unpaid'];

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="whitespace-nowrap px-6 py-3 font-mono text-cyan-400">
                        #{order.id}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-gray-300">
                        {order.client}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-white font-medium">
                        {order.total}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${prodStyle}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${payStyle}`}
                        >
                          {order.paymentStatus || 'unpaid'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
