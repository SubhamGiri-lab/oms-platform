'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/api/analytics/sales/overview');
        setOverview(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600">View key sales metrics, trends, and reports.</p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading analytics…</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{overview.totalOrders ?? 0}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">${overview.totalRevenue ?? 0}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-slate-500">Average Order</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">${overview.avgOrderValue ?? 0}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-slate-500">Customers</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{overview.totalCustomers ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
