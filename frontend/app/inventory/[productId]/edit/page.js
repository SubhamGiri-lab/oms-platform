'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { useNotification } from '../../../context/NotificationContext';

export default function InventoryEditPage({ params }) {
  const { productId } = params;
  const router = useRouter();
  const { success, error } = useNotification();
  const [values, setValues] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    quantity: 0,
    lowStockThreshold: 10,
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setFormError('');

      try {
        const response = await api.get(`/api/inventory/${productId}`);
        const product = response.data;
        setValues({
          sku: product.sku || '',
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          price: product.price || '',
          cost: product.cost || '',
          quantity: product.quantity || 0,
          lowStockThreshold: product.lowStockThreshold || 10,
          status: product.status || 'active'
        });
      } catch (err) {
        setFormError(err.response?.data?.error || 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaving(true);

    if (!values.sku || !values.name || !values.price) {
      setFormError('SKU, name, and price are required.');
      setSaving(false);
      return;
    }

    try {
      await api.put(`/api/inventory/${productId}`, {
        ...values,
        price: Number(values.price),
        cost: values.cost ? Number(values.cost) : null,
        quantity: Number(values.quantity),
        lowStockThreshold: Number(values.lowStockThreshold)
      });
      success('Product updated successfully.');
      router.push('/inventory');
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to update product.';
      setFormError(message);
      error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Edit Product</h1>
        <p className="text-slate-600">Update inventory details and pricing.</p>
      </div>

      <div className="card">
        <div className="card-body">
          {formError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading product…</div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">SKU</span>
                  <input
                    type="text"
                    value={values.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className="input mt-2 w-full"
                    required
                  />
                </label>
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
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <input
                    type="text"
                    value={values.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="input mt-2 w-full"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <textarea
                    value={values.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="textarea mt-2 w-full"
                    rows={4}
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Price</span>
                    <input
                      type="number"
                      step="0.01"
                      value={values.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      className="input mt-2 w-full"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Cost</span>
                    <input
                      type="number"
                      step="0.01"
                      value={values.cost}
                      onChange={(e) => handleChange('cost', e.target.value)}
                      className="input mt-2 w-full"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Quantity</span>
                    <input
                      type="number"
                      min={0}
                      value={values.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      className="input mt-2 w-full"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Low stock threshold</span>
                    <input
                      type="number"
                      min={0}
                      value={values.lowStockThreshold}
                      onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
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
                    <option value="discontinued">Discontinued</option>
                  </select>
                </label>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Updating…' : 'Update Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => router.push('/inventory')}>
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
