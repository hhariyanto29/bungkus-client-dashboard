import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { portalAPI } from '../services/api';

interface InvoiceProps {
  secretHash: string;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Invoice: React.FC<InvoiceProps> = ({ secretHash }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', secretHash, 'invoice'],
    queryFn: () => portalAPI.getInvoice(secretHash),
  });

  const invoiceData = data?.data?.data || data?.data;

  if (isLoading) return <LoadingSkeleton />;

  if (error || !invoiceData?.invoice_number) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-3xl text-white/10 mb-3">▤</div>
        <p className="text-white/40 text-sm">Invoice belum tersedia.</p>
        <p className="text-white/20 text-xs mt-1">Hubungi admin untuk generate invoice.</p>
      </div>
    );
  }

  const inv = invoiceData;
  const items = invoiceData.items || [];

  return (
    <div className="space-y-4">
      {/* Invoice Header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold text-cyan-400 tracking-wider">
            INVOICE
          </h3>
          <span className={`badge badge-${inv.status === 'paid' ? 'lunas' : inv.status === 'sent' ? 'dp' : 'unpaid'}`}>
            {inv.status === 'paid' ? 'Lunas' : inv.status === 'sent' ? 'Terkirim' : 'Draft'}
          </span>
        </div>

        <div className="space-y-2.5 mb-5">
          <InfoRow label="No. Invoice" value={inv.invoice_number} mono />
          <InfoRow label="No. Order" value={inv.order_number} mono />
          <InfoRow
            label="Tanggal"
            value={inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'long', year: 'numeric',
            }) : '-'}
          />
          {inv.due_date && (
            <InfoRow
              label="Jatuh Tempo"
              value={new Date(inv.due_date).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            />
          )}
        </div>

        {/* Line Items */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-[10px] text-white/30 tracking-wider uppercase mb-3">DETAIL ITEM</p>
          <div className="space-y-2">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                <div className="flex-1">
                  <p className="text-sm text-white/70">{item.item_name || item.product_name}</p>
                  <p className="text-[11px] text-white/30">
                    {item.quantity} x Rp {(item.unit_price || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <p className="text-sm font-mono text-white/60 ml-4">
                  Rp {(item.total_price || item.subtotal || 0).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-white/5 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Subtotal</span>
            <span className="font-mono text-white/60">
              Rp {(inv.subtotal || 0).toLocaleString('id-ID')}
            </span>
          </div>
          {inv.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Diskon</span>
              <span className="font-mono text-red-400">
                - Rp {(inv.discount || 0).toLocaleString('id-ID')}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-white/40">PPN 11%</span>
            <span className="font-mono text-white/60">
              Rp {(inv.tax_amount || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-sm font-semibold text-white/70">Total</span>
            <span className="font-mono text-lg font-bold text-cyan-400">
              Rp {(inv.total_amount || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <a
        href={`${API_BASE}/portal/${secretHash}/invoice/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 text-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
                   rounded-xl hover:bg-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200
                   font-display font-semibold tracking-wider text-sm no-print"
      >
        DOWNLOAD PDF
      </a>

      {/* Company Info */}
      <div className="glass rounded-2xl p-4">
        <p className="text-[10px] text-white/30 tracking-wider uppercase mb-2">DITERBITKAN OLEH</p>
        <p className="text-sm text-white/60">PT Bungkus Indonesia</p>
        <p className="text-xs text-white/30 mt-0.5">Invoice ini sah secara digital.</p>
      </div>
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: any; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-white/30">{label}</span>
    <span className={`text-sm ${mono ? 'font-mono' : ''} text-white/70`}>{value || '-'}</span>
  </div>
);

const LoadingSkeleton = () => (
  <div className="glass rounded-2xl p-5 animate-pulse">
    <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-3 bg-white/5 rounded" style={{ width: `${60 + i * 5}%` }} />
      ))}
    </div>
  </div>
);

export default Invoice;
