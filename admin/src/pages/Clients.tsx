import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Client {
  id: number;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  npwp: string;
  location: string;
  address: string;
  status: 'active' | 'inactive';
  total_revenue?: number;
}

interface ClientFormData {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  npwp: string;
  location: string;
  status: string;
}

const emptyForm: ClientFormData = {
  name: '',
  company_name: '',
  email: '',
  phone: '',
  address: '',
  npwp: '',
  location: '',
  status: 'active',
};

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(emptyForm);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const q = searchQuery.toLowerCase();
    return (
      client.company_name?.toLowerCase().includes(q) ||
      client.name?.toLowerCase().includes(q) ||
      client.email?.toLowerCase().includes(q) ||
      client.phone?.toLowerCase().includes(q) ||
      client.location?.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setEditingClient(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      company_name: client.company_name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      npwp: client.npwp || '',
      location: client.location || '',
      status: client.status || 'active',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, formData);
        toast.success('Client updated successfully');
      } else {
        await clientsAPI.create(formData);
        toast.success('Client created successfully');
      }
      setShowModal(false);
      setFormData(emptyForm);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await clientsAPI.delete(id);
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-display text-4xl md:text-5xl font-bold tracking-widest text-white"
        >
          CLIENTS
        </motion.h1>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="px-6 py-3 bg-[#00f0ff] text-black font-sans font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-shadow"
        >
          + Add Client
        </motion.button>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative max-w-xl">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white font-sans placeholder-white/30 focus:outline-none focus:border-[#00f0ff]/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] transition-all"
          />
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center text-white/40 font-sans py-20 bg-white/5 rounded-xl border border-white/10">
          <p className="text-lg">No clients found</p>
        </div>
      ) : (
        /* Client Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#00f0ff]/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.06)] transition-all group"
            >
              {/* Top row: company + status */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg font-bold text-white tracking-wide leading-tight">
                  {client.company_name || 'N/A'}
                </h3>
                <span
                  className={`flex-shrink-0 ml-3 px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold uppercase tracking-wider ${
                    client.status === 'active'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {client.status}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-1.5 font-sans text-sm text-white/60 mb-4">
                <p>
                  <span className="text-white/30">Contact:</span>{' '}
                  <span className="text-white/80">{client.name}</span>
                </p>
                <p>
                  <span className="text-white/30">Email:</span>{' '}
                  <span className="text-white/80">{client.email}</span>
                </p>
                <p>
                  <span className="text-white/30">Phone:</span>{' '}
                  <span className="text-white/80">{client.phone}</span>
                </p>
                {client.npwp && (
                  <p>
                    <span className="text-white/30">NPWP:</span>{' '}
                    <span className="text-white/80">{client.npwp}</span>
                  </p>
                )}
                {client.location && (
                  <p>
                    <span className="text-white/30">Location:</span>{' '}
                    <span className="text-white/80">{client.location}</span>
                  </p>
                )}
                {client.address && (
                  <p>
                    <span className="text-white/30">Address:</span>{' '}
                    <span className="text-white/80">{client.address}</span>
                  </p>
                )}
              </div>

              {/* Revenue */}
              <div className="mb-4 px-3 py-2 bg-[#00f0ff]/5 border border-[#00f0ff]/10 rounded-lg">
                <p className="text-xs text-white/30 font-sans mb-0.5">Revenue</p>
                <p className="font-display text-lg text-[#00f0ff] tracking-wide">
                  {formatRupiah(client.total_revenue || 0)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(client)}
                  className="flex-1 py-2 text-sm font-sans font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="flex-1 py-2 text-sm font-sans font-medium text-red-400/70 bg-red-500/5 border border-red-500/10 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0a0a14] border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-2xl font-bold text-white tracking-wider mb-6">
                {editingClient ? 'EDIT CLIENT' : 'ADD CLIENT'}
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-4 font-sans"
              >
                {/* Name */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                    />
                  </div>
                </div>

                {/* NPWP + Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                      NPWP
                    </label>
                    <input
                      type="text"
                      value={formData.npwp}
                      onChange={(e) => handleChange('npwp', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00f0ff]/50 transition-colors resize-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00f0ff]/50 transition-colors"
                  >
                    <option value="active" className="bg-[#0a0a14]">
                      Active
                    </option>
                    <option value="inactive" className="bg-[#0a0a14]">
                      Inactive
                    </option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-white/60 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-semibold text-black bg-[#00f0ff] rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-shadow"
                  >
                    {editingClient ? 'Save Changes' : 'Create Client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clients;
