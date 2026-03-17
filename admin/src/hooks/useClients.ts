import { useState } from 'react';
import { clientsAPI } from '../services/api';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  tables: number;
  status: 'active' | 'inactive';
  join_date: string;
  revenue: number;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  tables: number;
  status: 'active' | 'inactive';
  revenue: number;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    tables: 0,
    status: 'active',
    revenue: 0,
  });

  // Fetch all clients
  const fetchClients = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await clientsAPI.getAll();
      
      if (response.data.success) {
        setClients(response.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single client
  const fetchClient = async (id: number) => {
    try {
      const response = await clientsAPI.getById(id);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching client:', err);
      throw err;
    }
  };

  // Fetch client statistics
  const fetchClientStats = async (id: number) => {
    try {
      const response = await clientsAPI.getStats(id);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching client stats:', err);
      return null;
    }
  };

  // Create new client
  const createClient = async (clientData: ClientFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await clientsAPI.create(clientData);
      
      if (response.data.success) {
        const newClient = response.data.data;
        setClients([newClient, ...clients]);
        return { success: true, client: newClient };
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create client');
      return { success: false, error: err.response?.data?.error };
    } finally {
      setIsLoading(false);
    }
  };

  // Update client
  const updateClient = async (id: number, clientData: Partial<ClientFormData>) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await clientsAPI.update(id, clientData);
      
      if (response.data.success) {
        const updatedClient = response.data.data;
        setClients(prev =>
          prev.map(client =>
            client.id === id ? updatedClient : client
          )
        );
        return { success: true, client: updatedClient };
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update client');
      return { success: false, error: err.response?.data?.error };
    } finally {
      setIsLoading(false);
    }
  };

  // Delete client
  const deleteClient = async (id: number) => {
    try {
      const response = await clientsAPI.delete(id);
      
      if (response.data.success) {
        setClients(prev => prev.filter(client => client.id !== id));
        return { success: true };
      }
    } catch (err: any) {
      console.error('Error deleting client:', err);
      return { success: false, error: err.response?.data?.error };
    }
  };

  // Search clients
  const searchClients = async (query: string) => {
    try {
      const response = await clientsAPI.search(query);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error searching clients:', err);
      return [];
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      tables: 0,
      status: 'active',
      revenue: 0,
    });
    setSelectedClient(null);
    setShowClientModal(false);
    setError('');
  };

  // Open client modal
  const openClientModal = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        location: client.location,
        tables: client.tables,
        status: client.status,
        revenue: client.revenue,
      });
    } else {
      resetForm();
    }
    setShowClientModal(true);
  };

  // Close client modal
  const closeClientModal = () => {
    resetForm();
  };

  // Get active clients
  const getActiveClients = () => {
    return clients.filter(client => client.status === 'active');
  };

  // Get inactive clients
  const getInactiveClients = () => {
    return clients.filter(client => client.status === 'inactive');
  };

  // Get top revenue clients
  const getTopRevenueClients = (limit: number = 5) => {
    return [...clients]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  };

  // Calculate total revenue
  const calculateTotalRevenue = () => {
    return clients.reduce((total, client) => total + client.revenue, 0);
  };

  // Calculate average revenue per client
  const calculateAverageRevenue = () => {
    if (clients.length === 0) return 0;
    return calculateTotalRevenue() / clients.length;
  };

  // Get clients by location
  const getClientsByLocation = () => {
    const locations = clients.reduce((acc, client) => {
      const location = client.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locations).map(([location, count]) => ({
      location,
      count,
    }));
  };

  return {
    clients,
    isLoading,
    error,
    selectedClient,
    showClientModal,
    formData,
    setFormData,
    fetchClients,
    fetchClient,
    fetchClientStats,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    openClientModal,
    closeClientModal,
    getActiveClients,
    getInactiveClients,
    getTopRevenueClients,
    calculateTotalRevenue,
    calculateAverageRevenue,
    getClientsByLocation,
  };
};