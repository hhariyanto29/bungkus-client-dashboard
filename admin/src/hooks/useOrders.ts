import { useState } from 'react';
import { ordersAPI } from '../services/api';

interface Order {
  id: number;
  order_number: string;
  client_id: number;
  client_name: string;
  table_number: string;
  items: any[];
  total_amount: number;
  status: string;
  notes: string;
  created_at: string;
  completed_at: string;
}

interface OrderFormData {
  client_id: number;
  client_name: string;
  table_number: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  total_amount: number;
  notes: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    client_id: 0,
    client_name: '',
    table_number: '',
    items: [{ name: '', qty: 1, price: 0 }],
    total_amount: 0,
    notes: '',
  });

  // Fetch all orders
  const fetchOrders = async (params?: any) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await ordersAPI.getAll(params);
      
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single order
  const fetchOrder = async (id: number) => {
    try {
      const response = await ordersAPI.getById(id);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      throw err;
    }
  };

  // Create new order
  const createOrder = async (orderData: OrderFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await ordersAPI.create(orderData);
      
      if (response.data.success) {
        const newOrder = response.data.data;
        setOrders([newOrder, ...orders]);
        return { success: true, order: newOrder };
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create order');
      return { success: false, error: err.response?.data?.error };
    } finally {
      setIsLoading(false);
    }
  };

  // Update order
  const updateOrder = async (id: number, orderData: Partial<OrderFormData>) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await ordersAPI.update(id, orderData);
      
      if (response.data.success) {
        const updatedOrder = response.data.data;
        setOrders(prev =>
          prev.map(order =>
            order.id === id ? updatedOrder : order
          )
        );
        return { success: true, order: updatedOrder };
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update order');
      return { success: false, error: err.response?.data?.error };
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (id: number, status: string, notes?: string) => {
    try {
      const response = await ordersAPI.updateStatus(id, status, notes);
      
      if (response.data.success) {
        const updatedOrder = response.data.data;
        setOrders(prev =>
          prev.map(order =>
            order.id === id ? updatedOrder : order
          )
        );
        return { success: true, order: updatedOrder };
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      return { success: false, error: err.response?.data?.error };
    }
  };

  // Delete order
  const deleteOrder = async (id: number) => {
    try {
      const response = await ordersAPI.delete(id);
      
      if (response.data.success) {
        setOrders(prev => prev.filter(order => order.id !== id));
        return { success: true };
      }
    } catch (err: any) {
      console.error('Error deleting order:', err);
      return { success: false, error: err.response?.data?.error };
    }
  };

  // Calculate total amount
  const calculateTotal = (items: Array<{ qty: number; price: number }>) => {
    return items.reduce((total, item) => total + (item.qty * item.price), 0);
  };

  // Add item to form
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', qty: 1, price: 0 }],
    }));
  };

  // Remove item from form
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Update item in form
  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate total
      const total_amount = calculateTotal(newItems);
      
      return {
        ...prev,
        items: newItems,
        total_amount,
      };
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      client_id: 0,
      client_name: '',
      table_number: '',
      items: [{ name: '', qty: 1, price: 0 }],
      total_amount: 0,
      notes: '',
    });
    setSelectedOrder(null);
    setShowOrderModal(false);
    setError('');
  };

  // Open order modal
  const openOrderModal = (order?: Order) => {
    if (order) {
      setSelectedOrder(order);
      setFormData({
        client_id: order.client_id,
        client_name: order.client_name,
        table_number: order.table_number,
        items: order.items,
        total_amount: order.total_amount,
        notes: order.notes,
      });
    } else {
      resetForm();
    }
    setShowOrderModal(true);
  };

  // Close order modal
  const closeOrderModal = () => {
    resetForm();
  };

  // Get orders by status
  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  // Get order statistics
  const getOrderStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      return response.data.success ? response.data.data : null;
    } catch (err) {
      console.error('Error fetching order stats:', err);
      return null;
    }
  };

  return {
    orders,
    isLoading,
    error,
    selectedOrder,
    showOrderModal,
    formData,
    setFormData,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    addItem,
    removeItem,
    updateItem,
    calculateTotal,
    openOrderModal,
    closeOrderModal,
    getOrdersByStatus,
    getOrderStats,
  };
};