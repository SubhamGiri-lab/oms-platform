'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import { formatCurrency, formatDateShort, getStatusBadgeClass, getStatusLabel } from '../../lib/dashboardUtils';
import Skeleton from './Skeleton';

export default function RecentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentOrders = async () => {
      try {
        const response = await api.get('/api/orders?limit=5');
        setOrders(response.data?.data || []);
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecentOrders();
  }, []);
  return (
    <div className="card overflow-hidden">
      <div className="card-header flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Orders</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Latest activity across your order pipeline.</p>
        </div>
        <Link
          href="/orders"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View all
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="px-6 py-4 space-y-3">
            <Skeleton count={4} className="h-12" />
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No recent orders to show. Create an order to get started.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/70"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {order.orderNumber || order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{order.Customer?.name || '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDateShort(order.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card-footer text-center">
        <Link
          href="/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View all orders →
        </Link>
      </div>
    </div>
  );
}
