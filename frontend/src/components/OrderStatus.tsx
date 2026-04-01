import React from 'react';

interface OrderStatusProps {
  data: any;
}

const statusLabels: Record<string, string> = {
  pending: 'Menunggu',
  design: 'Desain',
  production: 'Produksi',
  qc: 'Quality Check',
  ready: 'Siap Kirim',
  shipped: 'Dikirim',
  delivered: 'Terkirim',
};

const paymentLabels: Record<string, string> = {
  unpaid: 'Belum Bayar',
  dp: 'DP',
  lunas: 'Lunas',
};

const OrderStatus: React.FC<OrderStatusProps> = ({ data }) => {
  const order = data?.order || {};
  const shipping = data?.shipping;
  const invoiceAvailable = data?.invoice_available;

  const productionStatus = order.production_status || 'pending';
  const paymentStatus = order.payment_status || 'unpaid';

  const progressSteps = ['pending', 'design', 'production', 'qc', 'ready', 'shipped', 'delivered'];
  const currentIndex = progressSteps.indexOf(productionStatus);
  const progressPercent = Math.round(((currentIndex + 1) / progressSteps.length) * 100);

  return (
    <div className="space-y-4">
      {/* Order Summary Card */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold text-cyan-400 tracking-wider">
            STATUS ORDER
          </h3>
          <span className={`badge badge-${productionStatus}`}>
            {statusLabels[productionStatus] || productionStatus}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
            <span>Progress</span>
            <span className="font-mono text-cyan-400/70">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #00f0ff, #8b5cf6)',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {progressSteps.map((step, i) => (
              <div
                key={step}
                className={`w-1.5 h-1.5 rounded-full ${
                  i <= currentIndex ? 'bg-cyan-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          <InfoRow label="No. Order" value={order.order_number} mono />
          <InfoRow label="Klien" value={order.client_name} />
          <InfoRow
            label="Total"
            value={`Rp ${(order.total_amount || 0).toLocaleString('id-ID')}`}
            mono
            highlight
          />
          <InfoRow label="Items" value={`${order.items?.length || order.items_count || 0} produk`} />
          <InfoRow
            label="Pembayaran"
            value={
              <span className={`badge badge-${paymentStatus}`}>
                {paymentLabels[paymentStatus] || paymentStatus}
              </span>
            }
          />
          <InfoRow
            label="Tanggal Order"
            value={order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'long', year: 'numeric',
            }) : '-'}
          />
        </div>
      </div>

      {/* Items Card */}
      {order.items && order.items.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-white/60 tracking-wider mb-3">
            DETAIL PRODUK
          </h3>
          <div className="space-y-2">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white/80">{item.product_name || item.item_name}</p>
                  <p className="text-[11px] text-white/30">
                    {item.quantity} x Rp {(item.unit_price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <p className="text-sm font-mono text-white/60">
                  Rp {(item.subtotal || item.total_price || 0).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 text-center">
          <div className={`text-lg mb-1 ${shipping ? 'text-cyan-400' : 'text-white/20'}`}>
            {shipping ? '✓' : '—'}
          </div>
          <p className="text-[10px] text-white/40 tracking-wider uppercase">Pengiriman</p>
          <p className="text-xs text-white/60 mt-0.5">
            {shipping ? (shipping.courier || 'Tersedia') : 'Belum ada'}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className={`text-lg mb-1 ${invoiceAvailable ? 'text-cyan-400' : 'text-white/20'}`}>
            {invoiceAvailable ? '✓' : '—'}
          </div>
          <p className="text-[10px] text-white/40 tracking-wider uppercase">Invoice</p>
          <p className="text-xs text-white/60 mt-0.5">
            {invoiceAvailable ? 'Tersedia' : 'Belum ada'}
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: any;
  mono?: boolean;
  highlight?: boolean;
}> = ({ label, value, mono, highlight }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-white/30">{label}</span>
    <span
      className={`text-sm ${mono ? 'font-mono' : ''} ${
        highlight ? 'text-cyan-400 font-semibold' : 'text-white/70'
      }`}
    >
      {value || '-'}
    </span>
  </div>
);

export default OrderStatus;
