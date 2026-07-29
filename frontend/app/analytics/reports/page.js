'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { BarChart3, TrendingUp, FileText } from 'lucide-react';

export default function AnalyticsReportsPage() {
  const [topProducts, setTopProducts] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');

      try {
        const [productsRes, statusRes] = await Promise.all([
          api.get('/api/analytics/products/top?limit=5'),
          api.get('/api/analytics/orders/status-distribution')
        ]);

        setTopProducts(productsRes.data || []);
        setStatusDistribution(statusRes.data || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load analytics reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Analytics Reports</h1>
          <p className="text-slate-600">Export the latest product and order status analytics.</p>
        </div>
        <Link href="/analytics" className="btn btn-secondary inline-flex items-center gap-2">
          <FileText size={18} /> Back to Analytics
        </Link>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading reports…</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Order Status Distribution</h2>
                  <p className="text-sm text-slate-500">Review the current status mix for orders.</p>
                </div>
              </div>
              <div className="space-y-3">
                {statusDistribution.map((status) => (
                  <div key={status.status} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{status.status}</span>
                    <span className="text-sm font-semibold text-slate-900">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body space-y-4">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Top Selling Products</h2>
                  <p className="text-sm text-slate-500">See the products driving the most revenue.</p>
                </div>
              </div>
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <div key={product.productId || product.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{product.Product?.name || product.name || 'Unnamed Product'}</p>
                        <p className="text-sm text-slate-500">SKU: {product.Product?.sku || product.sku || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Sold</p>
                        <p className="font-semibold text-slate-900">{product.totalSold || product.total_sold || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
