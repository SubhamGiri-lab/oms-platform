'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import SalesChart from '../components/SalesChart';
import RecentOrders from '../components/RecentOrders';
import api from '../../lib/api';
import { formatCurrency, formatCompactNumber } from '../../lib/dashboardUtils';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';
import RoleDashboard from '../components/role/RoleDashboard';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [overviewRes, statusRes, inventoryRes] = await Promise.all([
          api.get('/api/analytics/sales/overview'),
          api.get('/api/analytics/orders/status-distribution'),
          api.get('/api/inventory?limit=1000')
        ]);

        setOverview(overviewRes.data || {});
        setStatusDistribution(statusRes.data || []);
        setInventoryCount(inventoryRes.data?.data?.length || inventoryRes.data?.length || 0);
      } catch (error) {
        setOverview({});
        setStatusDistribution([]);
        setInventoryCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const metrics = useMemo(() => [
    {
      title: 'Total Revenue',
      value: formatCurrency(overview?.totalRevenue || 0),
      change: '+12.5%',
      isPositive: true,
      icon: TrendingUp,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Total Orders',
      value: formatCompactNumber(overview?.totalOrders || 0),
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingCart,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Total Customers',
      value: formatCompactNumber(overview?.totalCustomers || 0),
      change: '+5.1%',
      isPositive: true,
      icon: Users,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Inventory Items',
      value: formatCompactNumber(inventoryCount),
      change: '-2.3%',
      isPositive: false,
      icon: Package,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ], [inventoryCount, overview]);

  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Get an overview of your order management metrics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={i} loading />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      )}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-900">Order Status</h3>
          </div>
          <div className="card-body space-y-4">
            {statusDistribution.length === 0 ? (
              <div className="text-sm text-slate-500">No order status data yet.</div>
            ) : statusDistribution.map((entry, index) => {
              const total = statusDistribution.reduce((sum, item) => sum + Number(item.count || 0), 0);
              const width = total > 0 ? `${(Number(entry.count || 0) / total) * 100}%` : '0%';
              const colorMap = {
                pending: 'bg-yellow-500',
                processing: 'bg-blue-500',
                shipped: 'bg-purple-500',
                delivered: 'bg-green-500',
                cancelled: 'bg-red-500'
              };

              return (
                <div key={entry.status || index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 capitalize">{entry.status || 'Unknown'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${colorMap[entry.status] || 'bg-slate-500'}`} style={{ width }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{entry.count || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role-based dashboard panel */}
      <RoleDashboard user={user} />

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 px-6 py-4">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">Pro Tip:</span> Use the analytics section to generate detailed reports and track trends over time. Export data as CSV or PDF for external sharing.
        </p>
      </div>
    </div>
  );
}
