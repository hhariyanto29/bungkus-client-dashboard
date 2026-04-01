import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { portalAPI } from '../services/api';

interface TrackingProps {
  secretHash: string;
}

const Tracking: React.FC<TrackingProps> = ({ secretHash }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['portal', secretHash, 'tracking'],
    queryFn: () => portalAPI.getTracking(secretHash),
  });

  const trackingData = data?.data?.data || data?.data;

  if (isLoading) return <LoadingSkeleton />;
  if (error || !trackingData) return <ErrorState />;

  const timeline = trackingData.timeline || [];
  const shipments = trackingData.shipments || [];
  const shipping = shipments[0] || null;

  return (
    <div className="space-y-4">
      {/* Shipping Info */}
      {shipping && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-sm font-semibold text-cyan-400 tracking-wider mb-3">
            INFO PENGIRIMAN
          </h3>
          <div className="space-y-2.5">
            <InfoRow label="Kurir" value={shipping.courier} />
            <InfoRow label="No. Resi" value={shipping.tracking_number} mono />
            <InfoRow label="Status" value={
              <span className={`badge badge-${shipping.status}`}>
                {shipping.status === 'pending' ? 'Menunggu' :
                 shipping.status === 'picked_up' ? 'Diambil' :
                 shipping.status === 'in_transit' ? 'Dalam Perjalanan' :
                 shipping.status === 'delivered' ? 'Terkirim' : shipping.status}
              </span>
            } />
            {shipping.estimated_delivery && (
              <InfoRow
                label="Estimasi"
                value={new Date(shipping.estimated_delivery).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              />
            )}
            {shipping.notes && <InfoRow label="Catatan" value={shipping.notes} />}
          </div>
        </div>
      )}

      {/* Production Timeline */}
      <div className="glass rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold text-white/60 tracking-wider mb-4">
          TIMELINE PRODUKSI
        </h3>
        <div className="space-y-0">
          {timeline.map((step: any, idx: number) => (
            <div key={idx} className="timeline-step">
              <div
                className={`timeline-dot ${
                  step.current
                    ? 'timeline-dot-active'
                    : step.completed
                    ? 'timeline-dot-completed'
                    : 'timeline-dot-pending'
                }`}
              >
                {step.completed && !step.current ? '✓' : step.current ? '●' : ''}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    step.current
                      ? 'text-cyan-400'
                      : step.completed
                      ? 'text-white/60'
                      : 'text-white/25'
                  }`}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[11px] text-white/30 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Status Summary */}
      <div className="glass rounded-2xl p-4 text-center">
        <p className="text-[10px] text-white/30 tracking-wider uppercase mb-1">Status Saat Ini</p>
        <p className="font-display text-lg text-cyan-400 glow-cyan tracking-wider">
          {timeline.find((s: any) => s.current)?.label || 'Menunggu'}
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
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div key={i} className="glass rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = () => (
  <div className="glass rounded-2xl p-8 text-center">
    <p className="text-white/30">Data tracking tidak tersedia.</p>
  </div>
);

export default Tracking;
