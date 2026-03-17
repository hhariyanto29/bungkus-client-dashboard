import { useQuery } from '@tanstack/react-query';
import { ordersAPI, clientsAPI, qrAPI } from '../services/api';

export const useDashboardData = () => {
  // Fetch orders statistics
  const ordersStatsQuery = useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => ordersAPI.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent orders
  const recentOrdersQuery = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => ordersAPI.getRecent(5),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch clients statistics
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsAPI.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch QR codes statistics
  const qrStatsQuery = useQuery({
    queryKey: ['qr', 'stats'],
    queryFn: () => qrAPI.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate dashboard stats
  const stats = {
    totalOrders: ordersStatsQuery.data?.data?.totalOrders || 0,
    pendingOrders: ordersStatsQuery.data?.data?.ordersByStatus?.find((s: any) => s.status === 'pending')?.count || 0,
    totalRevenue: ordersStatsQuery.data?.data?.totalRevenue || 0,
    activeClients: clientsQuery.data?.data?.filter((c: any) => c.status === 'active').length || 0,
    qrCodesGenerated: qrStatsQuery.data?.data?.totalQRCodes || 0,
    todaysOrders: ordersStatsQuery.data?.data?.todaysOrders || 0,
    avgOrderValue: ordersStatsQuery.data?.data?.avgOrderValue || 0,
  };

  // Format recent orders
  const recentOrders = recentOrdersQuery.data?.data?.map((order: any) => ({
    id: order.order_number,
    client: order.client_name,
    items: order.items?.length || 0,
    total: `Rp ${order.total_amount.toLocaleString()}`,
    status: order.status,
    time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })) || [];

  // Format orders by status for chart
  const ordersByStatus = ordersStatsQuery.data?.data?.ordersByStatus?.map((item: any) => ({
    status: item.status,
    count: item.count,
  })) || [];

  // Format revenue by day (mock data for now)
  const revenueByDay = [
    { day: 'Mon', revenue: 1200000 },
    { day: 'Tue', revenue: 1800000 },
    { day: 'Wed', revenue: 1500000 },
    { day: 'Thu', revenue: 2200000 },
    { day: 'Fri', revenue: 2500000 },
    { day: 'Sat', revenue: 3000000 },
    { day: 'Sun', revenue: 2800000 },
  ];

  const isLoading = ordersStatsQuery.isLoading || recentOrdersQuery.isLoading || clientsQuery.isLoading || qrStatsQuery.isLoading;
  const error = ordersStatsQuery.error || recentOrdersQuery.error || clientsQuery.error || qrStatsQuery.error;

  return {
    stats,
    recentOrders,
    ordersByStatus,
    revenueByDay,
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