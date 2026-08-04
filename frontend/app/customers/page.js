'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { useNotification } from '../context/NotificationContext';

export default function CustomersPage() {
  const { success, error: notifyError } = useNotification();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/customers');
      setCustomers(response.data.data || response.data);
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to load customers';
      setError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return customers;

    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      customer.company?.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Customers</h1>
          <p className="text-slate-600">Manage customer information and relationships.</p>
        </div>
        <Link href="/customers/create" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Customer
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading customers…</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{customer.name}</h3>
                    <p className="text-sm text-slate-500">{customer.company || '—'}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1)}
                  </span>
                </div>

                <div className="flex gap-2 mb-4">
                  <Link href={`/customers/${customer.id}/edit`} className="btn btn-outline btn-sm inline-flex items-center gap-2">
                    <Edit size={16} /> Edit
                  </Link>
                  <button
                    type="button"
                    className="btn btn-error btn-sm inline-flex items-center gap-2"
                    onClick={async () => {
                      if (!window.confirm('Delete this customer?')) return;
                      try {
                        await api.delete(`/api/customers/${customer.id}`);
                        success('Customer deleted.');
                        setCustomers((prev) => prev.filter((item) => item.id !== customer.id));
                      } catch (err) {
                        const message = err.response?.data?.error || 'Unable to delete customer.';
                        notifyError(message);
                      }
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>

                <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                      {customer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                      {customer.phone || 'No phone'}
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Orders</p>
                    <p className="text-2xl font-bold text-slate-900">{customer.totalOrders ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-slate-900">${customer.totalSpent ?? '0.00'}</p>
                  </div>
                </div>

                <Link href={`/customers/${customer.id}`} className="btn btn-outline w-full">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No customers found.
        </div>
      )}
    </div>
  );
}
