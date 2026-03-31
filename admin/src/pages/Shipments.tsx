import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shipmentsAPI, ordersAPI } from '../services/api';
import { toast } from 'react-hot-toast';

interface Shipment {
  id: number;
  order_id: number;
  order_number?: string;
  client_name?: string;
  tracking_number: string;
  courier: string;
  service_type?: string;
  status: string;
  estimated_delivery?: string;
  shipping_address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const STATUS_FLOW = ['pending', 'picked_up', 'in_transit', 'delivered'];

const COURIERS = ['JNE', 'TIKI', 'POS', 'SiCepat', 'AnterAja', 'Grab', 'GoSend', 'Other'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'picked_up':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'in_transit':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'delivered':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-white/10 text-white/60 border-white/20';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'picked_up':
      return 'Picked Up';
    case 'in_transit':
      return 'In Transit';
    case 'delivered':
      return 'Delivered';
    default:
      return status;
  }
};

const getNextStatus = (current: string): string | null => {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
};

const Shipments: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    tracking_number: '',
    courier: '',
    service_type: '',
    estimated_delivery: '',
    shipping_address: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShipments = async () => {
    setIsLoading(true);
    try {
      const response = await shipmentsAPI.getAll();
      if (response.data.success) {
        setShipments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to fetch shipments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchOrders();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.order_id || !formData.tracking_number || !formData.courier) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        order_id: Number(formData.order_id),
      };
      const response = await shipmentsAPI.create(payload);
      if (response.data.success) {
        toast.success('Shipment created successfully');
        setShowModal(false);
        setFormData({
          order_id: '',
          tracking_number: '',
          courier: '',
          service_type: '',
          estimated_delivery: '',
          shipping_address: '',
          notes: '',
        });
        fetchShipments();
      }
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await shipmentsAPI.updateStatus(id, newStatus);
      if (response.data.success) {
        toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
        fetchShipments();
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wider text-white">
            SHIPMENTS
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Track and manage all shipments
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-5 py-2.5 font-display text-sm tracking-wider text-[#00f0ff] transition-colors hover:bg-[#00f0ff]/20"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ADD SHIPMENT
        </motion.button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#00f0ff] border-t-transparent" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="py-20 text-center text-white/40">
            <svg className="mx-auto mb-4 h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-display tracking-wider">NO SHIPMENTS FOUND</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-5 py-3 font-display text-xs tracking-wider text-white/40">ORDER #</th>
                <th className="px-5 py-3 font-display text-xs tracking-wider text-white/40">CLIENT</th>
                <th className="px-5 py-3 font-display text-xs tracking-wider text-white/40">COURIER</th>
                <th className="px-5 py-3 font-display text-xs tracking-wider text-white/40">TRACKING NUMBER</th>
                <th className="px-5 py-3 font-display text-xs tracking-wider text-white/40">STATUS</th>
                <th className="px-5 py-3 font-display text-xs tracking-wider text-white/40">EST. DELIVERY</th>
                <th className="px-5 py-3 font-display text-xs tracking-wider text-white/40">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => {
                const nextStatus = getNextStatus(shipment.status);
                return (
                  <React.Fragment key={shipment.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                      onClick={() =>
                        setExpandedId(expandedId === shipment.id ? null : shipment.id)
                      }
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-white">
                        {shipment.order_number || `#${shipment.order_id}`}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white/70">
                        {shipment.client_name || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white/70">
                        {shipment.courier}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm text-[#00f0ff]/80">
                        {shipment.tracking_number}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${getStatusColor(
                            shipment.status
                          )}`}
                        >
                          {getStatusLabel(shipment.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white/70">
                        {shipment.estimated_delivery
                          ? new Date(shipment.estimated_delivery).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        {nextStatus && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(shipment.id, nextStatus);
                            }}
                            className="rounded-md border border-[#00f0ff]/20 bg-[#00f0ff]/10 px-3 py-1 text-xs font-medium text-[#00f0ff] transition-colors hover:bg-[#00f0ff]/20"
                          >
                            {getStatusLabel(nextStatus)}
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === shipment.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={7} className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="font-display text-xs tracking-wider text-white/40">SERVICE TYPE</p>
                                <p className="mt-1 text-white/70">{shipment.service_type || '-'}</p>
                              </div>
                              <div>
                                <p className="font-display text-xs tracking-wider text-white/40">SHIPPING ADDRESS</p>
                                <p className="mt-1 text-white/70">{shipment.shipping_address || '-'}</p>
                              </div>
                              <div>
                                <p className="font-display text-xs tracking-wider text-white/40">NOTES</p>
                                <p className="mt-1 text-white/70">{shipment.notes || '-'}</p>
                              </div>
                              <div>
                                <p className="font-display text-xs tracking-wider text-white/40">CREATED</p>
                                <p className="mt-1 text-white/70">
                                  {shipment.created_at
                                    ? new Date(shipment.created_at).toLocaleString()
                                    : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="font-display text-xs tracking-wider text-white/40">LAST UPDATED</p>
                                <p className="mt-1 text-white/70">
                                  {shipment.updated_at
                                    ? new Date(shipment.updated_at).toLocaleString()
                                    : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="font-display text-xs tracking-wider text-white/40">STATUS PROGRESSION</p>
                                <div className="mt-1 flex items-center gap-1">
                                  {STATUS_FLOW.map((s, i) => (
                                    <React.Fragment key={s}>
                                      <span
                                        className={`rounded px-2 py-0.5 text-xs ${
                                          STATUS_FLOW.indexOf(shipment.status) >= i
                                            ? getStatusColor(s)
                                            : 'bg-white/5 text-white/20'
                                        }`}
                                      >
                                        {getStatusLabel(s)}
                                      </span>
                                      {i < STATUS_FLOW.length - 1 && (
                                        <span className="text-white/20">→</span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Shipment Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-lg rounded-xl border border-white/10 bg-[#0a0a1a] p-6 shadow-2xl"
            >
              <h2 className="mb-6 font-display text-xl tracking-wider text-white">
                ADD SHIPMENT
              </h2>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Order Select */}
                <div>
                  <label className="mb-1 block font-display text-xs tracking-wider text-white/40">
                    ORDER *
                  </label>
                  <select
                    value={formData.order_id}
                    onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]/50"
                    required
                  >
                    <option value="" className="bg-[#0a0a1a]">Select an order...</option>
                    {orders.map((order: any) => (
                      <option key={order.id} value={order.id} className="bg-[#0a0a1a]">
                        {order.order_number || `Order #${order.id}`}
                        {order.client_name ? ` - ${order.client_name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="mb-1 block font-display text-xs tracking-wider text-white/40">
                    TRACKING NUMBER *
                  </label>
                  <input
                    type="text"
                    value={formData.tracking_number}
                    onChange={(e) =>
                      setFormData({ ...formData, tracking_number: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]/50"
                    placeholder="e.g. JNE1234567890"
                    required
                  />
                </div>

                {/* Courier & Service Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-display text-xs tracking-wider text-white/40">
                      COURIER *
                    </label>
                    <select
                      value={formData.courier}
                      onChange={(e) => setFormData({ ...formData, courier: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]/50"
                      required
                    >
                      <option value="" className="bg-[#0a0a1a]">Select...</option>
                      {COURIERS.map((c) => (
                        <option key={c} value={c} className="bg-[#0a0a1a]">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-display text-xs tracking-wider text-white/40">
                      SERVICE TYPE
                    </label>
                    <input
                      type="text"
                      value={formData.service_type}
                      onChange={(e) =>
                        setFormData({ ...formData, service_type: e.target.value })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]/50"
                      placeholder="e.g. REG, YES, OKE"
                    />
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div>
                  <label className="mb-1 block font-display text-xs tracking-wider text-white/40">
                    ESTIMATED DELIVERY
                  </label>
                  <input
                    type="date"
                    value={formData.estimated_delivery}
                    onChange={(e) =>
                      setFormData({ ...formData, estimated_delivery: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]/50"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <label className="mb-1 block font-display text-xs tracking-wider text-white/40">
                    SHIPPING ADDRESS
                  </label>
                  <textarea
                    value={formData.shipping_address}
                    onChange={(e) =>
                      setFormData({ ...formData, shipping_address: e.target.value })
                    }
                    rows={2}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]/50"
                    placeholder="Full shipping address"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="mb-1 block font-display text-xs tracking-wider text-white/40">
                    NOTES
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#00f0ff]/50"
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-5 py-2.5 font-display text-sm tracking-wider text-[#00f0ff] transition-colors hover:bg-[#00f0ff]/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'SAVING...' : 'SAVE SHIPMENT'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shipments;
