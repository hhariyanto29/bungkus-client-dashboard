import { useQuery } from '@tanstack/react-query';
import { ordersAPI, clientsAPI, qrAPI } from '../services/api';

export const useDashboardData = () => {
  const ordersStatsQuery = useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => ordersAPI.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => ordersAPI.getRecent(5),
    staleTime: 2 * 60 * 1000,
  });

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsAPI.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const qrStatsQuery = useQuery({
    queryKey: ['qr', 'stats'],
    queryFn: () => qrAPI.getStats(),
    staleTime: 5 * 60 * 1000,
  });

  // Safely extract data (axios .data -> API .data)
  const ordersStats = ordersStatsQuery.data?.data?.data || ordersStatsQuery.data?.data || {};
  const clientsData = clientsQuery.data?.data?.data || clientsQuery.data?.data || [];
  const qrStats = qrStatsQuery.data?.data?.data || qrStatsQuery.data?.data || {};
  const recentData = recentOrdersQuery.data?.data?.data || recentOrdersQuery.data?.data || [];

  const stats = {
    totalOrders: ordersStats?.totalOrders || 0,
    pendingOrders: ordersStats?.ordersByStatus?.find((s: any) => s.status === 'pending')?.count || 0,
    totalRevenue: ordersStats?.totalRevenue || 0,
    activeClients: Array.isArray(clientsData) ? clientsData.filter((c: any) => c.status === 'active').length : 0,
    qrCodesGenerated: qrStats?.totalQRCodes || 0,
    todaysOrders: ordersStats?.todaysOrders || 0,
    avgOrderValue: ordersStats?.avgOrderValue || 0,
  };

  const recentOrders = (Array.isArray(recentData) ? recentData : []).map((order: any) => ({
    id: order.order_number,
    client: order.client_name || 'Unknown',
    items: order.items?.length || 0,
    total: `Rp ${(order.total_amount || 0).toLocaleString('id-ID')}`,
    production_status: order.production_status || 'pending',
    payment_status: order.payment_status || 'unpaid',
    time: new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
  }));

  const isLoading = ordersStatsQuery.isLoading || recentOrdersQuery.isLoading || clientsQuery.isLoading || qrStatsQuery.isLoading;
  const error = ordersStatsQuery.error || recentOrdersQuery.error || clientsQuery.error || qrStatsQuery.error;

  return {
    stats,
    recentOrders,
    isLoading,
    error,
    refetch: () => {
      ordersStatsQuery.refetch();
      recentOrdersQuery.refetch();
      clientsQuery.refetch();
      qrStatsQuery.refetch();
    },
  };
};
