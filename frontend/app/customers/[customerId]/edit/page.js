'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { useNotification } from '../../../context/NotificationContext';

export default function CustomerEditPage({ params }) {
  const { customerId } = params;
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
    country: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true);
      setFormError('');

      try {
        const response = await api.get(`/api/customers/${customerId}`);
        const customer = response.data;
        setValues({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          company: customer.company || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          postalCode: customer.postalCode || '',
          country: customer.country || '',
          status: customer.status || 'active'
        });
      } catch (err) {
        setFormError(err.response?.data?.error || 'Unable to load customer.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [customerId]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);

    if (!values.name || !values.email) {
      setFormError('Name and email are required.');
      setSaving(false);
      return;
    }

    try {
      await api.put(`/api/customers/${customerId}`, values);
      success('Customer updated successfully.');
      router.push('/customers');
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to update customer.';
      setFormError(message);
      error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Edit Customer</h1>
        <p className="text-slate-600">Update customer contact and account information.</p>
      </div>

      <div className="card">
        <div className="card-body">
          {formError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading customer…</div>
          ) : (
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
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Status</span>
                  <select
                    value={values.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="select mt-2 w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </label>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Updating…' : 'Update Customer'}
                </button>
                <button type="button" onClick={() => router.push('/customers')} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
