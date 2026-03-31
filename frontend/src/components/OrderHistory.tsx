import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { portalAPI } from '../services/api';

interface OrderHistoryProps {
  secretHash: string;
}

const statusLabels: Record<string, string> = {
  pending: 'Menunggu',
  design: 'Desain',
  production: 'Produksi',
  qc: 'QC',
  ready: 'Siap',
  shipped: 'Dikirim',
  delivered: 'Terkirim',
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ secretHash }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', secretHash, 'history'],
    queryFn: () => portalAPI.getHistory(secretHash),
  });

  const rawData = data?.data?.data || data?.data;
  const orders = Array.isArray(rawData) ? rawData : rawData?.orders || [];

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-white/30">Gagal memuat riwayat order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold text-cyan-400 tracking-wider mb-1">
          RIWAYAT ORDER
        </h3>
        <p className="text-xs text-white/30">{orders.length} order ditemukan</p>
      </div>

      {/* Order List */}
      {orders.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/30 text-sm">Belum ada riwayat order.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any, idx: number) => (
            <div key={idx} className="glass rounded-xl p-4 hover:border-cyan-500/10 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-mono text-white/70">{order.order_number}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    }) : '-'}
                  </p>
                </div>
                <span className={`badge badge-${order.production_status || 'pending'}`}>
                  {statusLabels[order.production_status] || order.production_status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">
                  {order.items_count || 0} item
                </span>
                <span className="font-mono text-sm text-cyan-400/80">
                  Rp {(order.total_amount || 0).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Payment badge */}
              <div className="mt-2 flex gap-2">
                <span className={`badge badge-${order.payment_status || 'unpaid'} text-[10px]`}>
                  {order.payment_status === 'lunas' ? 'Lunas' :
                   order.payment_status === 'dp' ? 'DP' : 'Belum Bayar'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="glass rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-2" />
        <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
        <div className="h-3 bg-white/5 rounded w-1/4" />
      </div>
    ))}
  </div>
);

export default OrderHistory;
