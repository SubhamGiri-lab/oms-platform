'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
import api from '../../lib/api';

const statusMap = {
  pending: 'badge-warning',
  processing: 'badge-info',
  shipped: 'badge-neutral',
  delivered: 'badge-success',
  cancelled: 'badge-error'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/api/orders', {
          params: statusFilter !== 'all' ? { status: statusFilter } : {}
        });
        setOrders(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) =>
      order.orderNumber.toLowerCase().includes(term) ||
      order.Customer?.name?.toLowerCase().includes(term)
    );
  }, [orders, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Orders</h1>
          <p className="text-slate-600">Manage and track all customer orders.</p>
        </div>
        <Link href="/orders/create" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Create Order
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading orders…</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      <Link href={`/orders/${order.id}`} className="hover:text-blue-700">
                        {order.orderNumber || order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.Customer?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">${order.total ?? order.subtotal ?? '0.00'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusMap[order.status] || 'badge-neutral'}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No orders found.
        </div>
      )}
    </div>
  );
}
