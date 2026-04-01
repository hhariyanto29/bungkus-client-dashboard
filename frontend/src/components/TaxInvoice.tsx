import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { portalAPI } from '../services/api';

interface TaxInvoiceProps {
  secretHash: string;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const TaxInvoice: React.FC<TaxInvoiceProps> = ({ secretHash }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', secretHash, 'tax-invoice'],
    queryFn: () => portalAPI.getTaxInvoice(secretHash),
  });

  const taxData = data?.data?.data || data?.data;

  if (isLoading) return <LoadingSkeleton />;

  if (error || !taxData?.faktur_number) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-3xl text-white/10 mb-3">▥</div>
        <p className="text-white/40 text-sm">Faktur Pajak belum tersedia.</p>
        <p className="text-white/20 text-xs mt-1">Hubungi admin untuk generate faktur pajak.</p>
      </div>
    );
  }

  const fp = taxData;

  return (
    <div className="space-y-4">
      {/* Faktur Pajak Header */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-sm font-semibold text-cyan-400 tracking-wider">
            FAKTUR PAJAK
          </h3>
          <span className="badge badge-lunas">Resmi</span>
        </div>

        <div className="space-y-2.5">
          <InfoRow label="No. Faktur" value={fp.faktur_number} mono />
          <InfoRow label="No. Order" value={fp.order_number} mono />
          <InfoRow
            label="Tanggal"
            value={fp.created_at ? new Date(fp.created_at).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'long', year: 'numeric',
            }) : '-'}
          />
        </div>
      </div>

      {/* Tax Details */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-[10px] text-white/30 tracking-wider uppercase mb-3">DETAIL PAJAK</h3>

        <div className="space-y-2.5">
          <InfoRow label="Perusahaan" value={fp.company_name} />
          <InfoRow label="NPWP" value={fp.npwp} mono />
        </div>

        {/* Items */}
        {fp.items && fp.items.length > 0 && (
          <div className="border-t border-white/5 mt-4 pt-4">
            <p className="text-[10px] text-white/30 tracking-wider uppercase mb-2">DETAIL ITEM</p>
            {fp.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white/70">{item.item_name}</p>
                  <p className="text-[11px] text-white/30">{item.quantity} x Rp {(item.unit_price || 0).toLocaleString('id-ID')}</p>
                </div>
                <p className="text-sm font-mono text-white/60">Rp {(item.total_price || 0).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-white/5 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/40">DPP (Dasar Pengenaan Pajak)</span>
            <span className="font-mono text-white/60">
              Rp {(fp.subtotal || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">PPN 11%</span>
            <span className="font-mono text-white/60">
              Rp {(fp.tax_amount || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-sm font-semibold text-white/70">Total</span>
            <span className="font-mono text-lg font-bold text-cyan-400">
              Rp {(fp.total_amount || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <a
        href={`${API_BASE}/portal/${secretHash}/tax-invoice/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 text-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
                   rounded-xl hover:bg-cyan-500/30 hover:border-cyan-500/50 transition-all duration-200
                   font-display font-semibold tracking-wider text-sm no-print"
      >
        DOWNLOAD PDF
      </a>

      {/* Legal Notice */}
      <div className="glass rounded-2xl p-4">
        <p className="text-[10px] text-white/30 tracking-wider uppercase mb-2">KETERANGAN</p>
        <p className="text-xs text-white/40 leading-relaxed">
          Faktur Pajak ini diterbitkan oleh PT Bungkus Indonesia sesuai dengan ketentuan
          perpajakan yang berlaku. Dokumen ini sah sebagai bukti pungutan PPN.
        </p>
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
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-3 bg-white/5 rounded" style={{ width: `${50 + i * 10}%` }} />
      ))}
    </div>
  </div>
);

export default TaxInvoice;
