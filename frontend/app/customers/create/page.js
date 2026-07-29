'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useNotification } from '../../context/NotificationContext';

export default function CustomerCreatePage() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormError('');
  }, [values]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setLoading(true);

    if (!values.name || !values.email) {
      setFormError('Name and email are required.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/customers', values);
      success('Customer created successfully.');
      router.push('/customers');
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to create customer.';
      setFormError(message);
      error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Add Customer</h1>
        <p className="text-slate-600">Create a new customer profile to start tracking orders.</p>
      </div>

      <div className="card">
        <div className="card-body">
          {formError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input mt-2 w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input mt-2 w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone</span>
                <input
                  type="tel"
                  value={values.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="input mt-2 w-full"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Company</span>
                <input
                  type="text"
                  value={values.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="input mt-2 w-full"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <textarea
                  value={values.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="textarea mt-2 w-full"
                  rows={4}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">City</span>
                  <input
                    type="text"
                    value={values.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="input mt-2 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">State</span>
                  <input
                    type="text"
                    value={values.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="input mt-2 w-full"
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Postal Code</span>
                  <input
                    type="text"
                    value={values.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    className="input mt-2 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Country</span>
                  <input
                    type="text"
                    value={values.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="input mt-2 w-full"
                  />
                </label>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3 flex-wrap">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving…' : 'Save Customer'}
                </button>
                <button type="button" onClick={() => router.push('/customers')} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
              <p className="text-sm text-slate-500">Customers created here are immediately available in orders.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
