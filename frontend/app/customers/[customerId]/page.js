'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';

export default function CustomerDetailPage({ params }) {
  const { customerId } = params;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/api/customers/${customerId}`);
        setCustomer(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load customer details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-slate-50 text-slate-700">
        Loading customer profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-slate-700">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Customer Details</h1>
        <p className="text-slate-600">
          Viewing profile for <span className="font-semibold">{customer.name || customer.email}</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="card-body space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Customer Summary</h2>
              <p className="text-slate-600">Customer details including contact info, order history, and support notes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="text-lg font-semibold text-slate-900">{customer.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="text-lg font-semibold text-slate-900">{customer.email || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="text-lg font-semibold text-slate-900">{customer.phone || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Orders</p>
                <p className="text-lg font-semibold text-slate-900">{customer.Orders?.length ?? 0}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Recent Orders</h3>
              {customer.Orders?.length > 0 ? (
                <div className="space-y-3">
                  {customer.Orders.map((order) => (
                    <div key={order.id} className="rounded-lg bg-white border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Status</p>
                          <p className="font-semibold text-slate-900">{order.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No recent orders found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Action</h2>
            <p className="text-slate-600">Use this page to view or edit the customer's details and contact history.</p>
            <Link href="/customers" className="btn btn-primary w-full">
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
