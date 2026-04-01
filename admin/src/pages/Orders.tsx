import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersAPI, clientsAPI, invoicesAPI, qrAPI } from '../services/api';
import { toast } from 'react-hot-toast';

interface LineItem {
  item_name: string;
  material: string;
  size: string;
  print_type: string;
  quantity: number;
  unit_price: number;
}

const EMPTY_LINE_ITEM: LineItem = {
  item_name: '',
  material: '',
  size: '',
  print_type: '',
  quantity: 1,
  unit_price: 0,
};

const PRODUCTION_STATUSES = ['pending', 'design', 'production', 'qc', 'ready', 'shipped', 'delivered'] as const;
const PAYMENT_STATUSES = ['unpaid', 'dp', 'lunas'] as const;

const productionColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  design: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  production: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  qc: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  ready: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  shipped: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
};

const paymentColors: Record<string, string> = {
  unpaid: 'bg-red-400/20 text-red-400 border-red-400/30',
  dp: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
  lunas: 'bg-green-400/20 text-green-400 border-green-400/30',
};

const formatRp = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterProduction, setFilterProduction] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<any>(null);

  // Create order form state
  const [createForm, setCreateForm] = useState({
    client_id: '',
    discount: 0,
    notes: '',
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...EMPTY_LINE_ITEM }]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filterProduction !== 'all') params.production_status = filterProduction;
      if (filterPayment !== 'all') params.payment_status = filterPayment;
      const response = await ordersAPI.getAll(params);
      if (response.data.success) {
        setOrders(response.data.data.orders || response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      if (response.data.success) {
        setClients(response.data.data.clients || response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchClients();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filterProduction, filterPayment]);

  // Line items helpers
  const addLineItem = () => setLineItems([...lineItems, { ...EMPTY_LINE_ITEM }]);

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discountAmount = createForm.discount || 0;
  const afterDiscount = subtotal - discountAmount;
  const ppn = Math.round(afterDiscount * 0.11);
  const grandTotal = afterDiscount + ppn;

  // Actions
  const handleCreateOrder = async () => {
    if (!createForm.client_id) {
      toast.error('Please select a client');
      return;
    }
    if (lineItems.some((item) => !item.item_name || item.quantity <= 0 || item.unit_price <= 0)) {
      toast.error('Please fill in all line item fields');
      return;
    }
    try {
      const payload = {
        client_id: Number(createForm.client_id),
        items: lineItems.map((li) => ({
          item_name: li.item_name,
          material: li.material,
          size: li.size,
          print_type: li.print_type,
          quantity: li.quantity,
          unit_price: li.unit_price,
        })),
        discount: discountAmount,
        notes: createForm.notes,
      };
      const response = await ordersAPI.create(payload);
      if (response.data.success) {
        toast.success('Order created successfully');
        setShowCreateModal(false);
        setCreateForm({ client_id: '', discount: 0, notes: '' });
        setLineItems([{ ...EMPTY_LINE_ITEM }]);
        fetchOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  const handleUpdateProductionStatus = async (orderId: number, status: string) => {
    try {
      await ordersAPI.updateProductionStatus(orderId, status);
      toast.success(`Production status updated to ${status}`);
      fetchOrders();
      setShowStatusModal(null);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => prev ? { ...prev, production_status: status } : null);
      }
    } catch (error) {
      toast.error('Failed to update production status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, status: string) => {
    try {
      await ordersAPI.updatePaymentStatus(orderId, status);
      toast.success(`Payment status updated to ${status}`);
      fetchOrders();
      setShowStatusModal(null);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => prev ? { ...prev, payment_status: status } : null);
      }
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handleGenerateInvoice = async (orderId: number) => {
    try {
      await invoicesAPI.generate(orderId);
      toast.success('Invoice generated');
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  const handleGenerateQR = async (orderId: number) => {
    try {
      await qrAPI.generate(orderId);
      toast.success('QR code generated');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  // Parse items helper
  const parseItems = (items: any) => {
    if (!items) return [];
    return typeof items === 'string' ? JSON.parse(items) : items;
  };

  // -- Input class for consistency --
  const inputCls =
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#00f0ff]/50 transition-colors font-sans';
  const selectCls =
    'px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]/50 transition-colors font-sans appearance-none cursor-pointer';

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <h1 className="text-4xl font-display font-bold tracking-widest text-white uppercase">
            Orders
          </h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 rounded-lg font-sans font-medium transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Order
          </button>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 font-sans uppercase tracking-wider">Production</label>
            <select
              value={filterProduction}
              onChange={(e) => setFilterProduction(e.target.value)}
              className={selectCls}
            >
              <option value="all">All Statuses</option>
              {PRODUCTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white/40 font-sans uppercase tracking-wider">Payment</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className={selectCls}
            >
              <option value="all">All Payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00f0ff]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-white/40 py-20 bg-white/5 rounded-xl border border-white/10">
            <p className="text-lg font-sans">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {orders.map((order, index) => {
                const items = parseItems(order.items);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white/5 backdrop-blur rounded-xl p-5 border border-white/10 hover:border-[#00f0ff]/20 transition-all cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="font-mono text-[#00f0ff] text-sm whitespace-nowrap">
                          #{order.order_number || order.id}
                        </span>
                        <span className="text-white font-sans font-medium truncate">
                          {order.client_name || order.client?.name || '-'}
                        </span>
                        <span className="text-white/40 font-sans text-sm hidden md:inline">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-medium border uppercase tracking-wide ${
                            productionColors[order.production_status] || 'bg-white/10 text-white/60 border-white/10'
                          }`}
                        >
                          {order.production_status || '-'}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-medium border uppercase tracking-wide ${
                            paymentColors[order.payment_status] || 'bg-white/10 text-white/60 border-white/10'
                          }`}
                        >
                          {order.payment_status || '-'}
                        </span>
                        <span className="font-sans font-semibold text-white text-right min-w-[120px]">
                          {formatRp(order.total_amount || order.grand_total || 0)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStatusModal(order);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white/70 rounded-lg font-sans"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ===== ORDER DETAIL MODAL ===== */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-6 pt-16 overflow-y-auto"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gray-950 rounded-2xl p-8 max-w-3xl w-full border border-white/10 shadow-2xl mb-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white tracking-wider">
                    Order{' '}
                    <span className="font-mono text-[#00f0ff]">
                      #{selectedOrder.order_number || selectedOrder.id}
                    </span>
                  </h2>
                  <p className="text-white/50 font-sans mt-1">
                    {selectedOrder.client_name || selectedOrder.client?.name}
                    {selectedOrder.created_at && (
                      <span className="ml-3 text-white/30">{formatDate(selectedOrder.created_at)}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-white/30 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex gap-3 mb-6">
                <span
                  className={`px-3 py-1.5 rounded text-xs font-medium border uppercase tracking-wide ${
                    productionColors[selectedOrder.production_status] || 'bg-white/10 text-white/60 border-white/10'
                  }`}
                >
                  {selectedOrder.production_status || '-'}
                </span>
                <span
                  className={`px-3 py-1.5 rounded text-xs font-medium border uppercase tracking-wide ${
                    paymentColors[selectedOrder.payment_status] || 'bg-white/10 text-white/60 border-white/10'
                  }`}
                >
                  {selectedOrder.payment_status || '-'}
                </span>
              </div>

              {/* Line Items Table */}
              <div className="mb-6">
                <h3 className="text-xs font-display uppercase tracking-widest text-white/40 mb-3">Line Items</h3>
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                        <th className="text-left p-3">Item</th>
                        <th className="text-left p-3">Material</th>
                        <th className="text-left p-3">Size</th>
                        <th className="text-right p-3">Qty</th>
                        <th className="text-right p-3">Unit Price</th>
                        <th className="text-right p-3">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseItems(selectedOrder.items).map((item: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 text-white/80">
                          <td className="p-3">{item.item_name || item.name || '-'}</td>
                          <td className="p-3 text-white/50">{item.material || '-'}</td>
                          <td className="p-3 text-white/50">{item.size || '-'}</td>
                          <td className="p-3 text-right">{item.quantity || item.qty || 0}</td>
                          <td className="p-3 text-right">{formatRp(item.unit_price || item.price || 0)}</td>
                          <td className="p-3 text-right font-medium">
                            {formatRp(
                              (item.total_price ??
                                (item.quantity || item.qty || 0) * (item.unit_price || item.price || 0))
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-6">
                <div className="space-y-2 font-sans text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>{formatRp(selectedOrder.subtotal || selectedOrder.total_amount || 0)}</span>
                  </div>
                  {(selectedOrder.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-white/60">
                      <span>Discount</span>
                      <span className="text-red-400">-{formatRp(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>PPN 11%</span>
                    <span>{formatRp(selectedOrder.ppn || selectedOrder.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-[#00f0ff]">
                      {formatRp(selectedOrder.grand_total || selectedOrder.total_amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleGenerateInvoice(selectedOrder.id)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg text-sm font-sans transition-colors"
                >
                  Generate Invoice
                </button>
                <button
                  onClick={() => handleGenerateQR(selectedOrder.id)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg text-sm font-sans transition-colors"
                >
                  Generate QR
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setShowStatusModal(selectedOrder);
                  }}
                  className="px-4 py-2.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 rounded-lg text-sm font-sans transition-colors"
                >
                  Update Status
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== UPDATE STATUS MODAL ===== */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
            onClick={() => setShowStatusModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-950 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display font-bold text-white tracking-wider mb-6">
                Update Status
              </h3>

              <div className="mb-6">
                <label className="text-xs font-sans uppercase tracking-wider text-white/40 mb-2 block">
                  Production Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCTION_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateProductionStatus(showStatusModal.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        showStatusModal.production_status === status
                          ? productionColors[status] + ' ring-1 ring-white/20'
                          : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-sans uppercase tracking-wider text-white/40 mb-2 block">
                  Payment Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdatePaymentStatus(showStatusModal.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        showStatusModal.payment_status === status
                          ? paymentColors[status] + ' ring-1 ring-white/20'
                          : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowStatusModal(null)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-lg font-sans text-sm transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CREATE ORDER MODAL ===== */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-6 pt-12 overflow-y-auto"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-gray-950 rounded-2xl p-8 max-w-3xl w-full border border-white/10 shadow-2xl mb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-display font-bold text-white tracking-wider mb-6">
                Create Order
              </h2>

              {/* Client Select */}
              <div className="mb-6">
                <label className="text-xs font-sans uppercase tracking-wider text-white/40 mb-2 block">
                  Client
                </label>
                <select
                  value={createForm.client_id}
                  onChange={(e) => setCreateForm({ ...createForm, client_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company_name ? `- ${client.company_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-sans uppercase tracking-wider text-white/40">
                    Line Items
                  </label>
                  <button
                    onClick={addLineItem}
                    className="text-xs text-[#00f0ff] hover:text-[#00f0ff]/80 font-sans transition-colors"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl border border-white/10 p-4"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.item_name}
                          onChange={(e) => updateLineItem(index, 'item_name', e.target.value)}
                          className={inputCls}
                        />
                        <input
                          type="text"
                          placeholder="Material"
                          value={item.material}
                          onChange={(e) => updateLineItem(index, 'material', e.target.value)}
                          className={inputCls}
                        />
                        <input
                          type="text"
                          placeholder="Size"
                          value={item.size}
                          onChange={(e) => updateLineItem(index, 'size', e.target.value)}
                          className={inputCls}
                        />
                        <input
                          type="text"
                          placeholder="Print type"
                          value={item.print_type}
                          onChange={(e) => updateLineItem(index, 'print_type', e.target.value)}
                          className={inputCls}
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                          className={inputCls}
                        />
                        <input
                          type="number"
                          placeholder="Unit price"
                          min={0}
                          value={item.unit_price || ''}
                          onChange={(e) => updateLineItem(index, 'unit_price', Number(e.target.value))}
                          className={inputCls}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/30 font-sans">
                          Line total: {formatRp(item.quantity * item.unit_price)}
                        </span>
                        {lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(index)}
                            className="text-xs text-red-400/70 hover:text-red-400 font-sans transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount + Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs font-sans uppercase tracking-wider text-white/40 mb-2 block">
                    Discount (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={createForm.discount || ''}
                    onChange={(e) => setCreateForm({ ...createForm, discount: Number(e.target.value) })}
                    className={inputCls}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs font-sans uppercase tracking-wider text-white/40 mb-2 block">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    className={inputCls}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="bg-white/5 rounded-xl border border-white/10 p-5 mb-6">
                <div className="space-y-2 font-sans text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>{formatRp(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-white/60">
                      <span>Discount</span>
                      <span className="text-red-400">-{formatRp(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>PPN 11%</span>
                    <span>{formatRp(ppn)}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-white/10">
                    <span>Grand Total</span>
                    <span className="text-[#00f0ff]">{formatRp(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-lg font-sans text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="flex-1 py-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 rounded-lg font-sans font-medium text-sm transition-colors"
                >
                  Save Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
