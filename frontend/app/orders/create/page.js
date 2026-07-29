'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash } from 'lucide-react';
import api from '../../../lib/api';
import { useNotification } from '../../context/NotificationContext';

const emptyItem = { productId: '', quantity: 1 };

export default function OrderCreatePage() {
  const router = useRouter();
  const { success, error } = useNotification();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([emptyItem]);
  const [customerId, setCustomerId] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [priority, setPriority] = useState('normal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFormError('');

      try {
        const [customersRes, productsRes] = await Promise.all([
          api.get('/api/customers'),
          api.get('/api/inventory')
        ]);
        setCustomers(customersRes.data.data || customersRes.data);
        setProducts(productsRes.data.data || productsRes.data);
      } catch (err) {
        setFormError(err.response?.data?.error || 'Unable to load order data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const orderTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const product = products.find((product) => product.id === item.productId);
      if (!product || item.quantity <= 0) return total;
      return total + parseFloat(product.price) * item.quantity;
    }, 0);
  }, [items, products]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: field === 'quantity' ? Number(value) : value };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, emptyItem]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!customerId) {
      setFormError('Please select a customer.');
      return;
    }

    const validItems = items.filter((item) => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      setFormError('Add at least one product with a valid quantity.');
      return;
    }

    setSubmitLoading(true);

    try {
      await api.post('/api/orders', {
        orderNumber: `ORD-${Date.now()}`,
        customerId,
        items: validItems,
        shippingAddress,
        notes,
        priority
      });
      success('Order created successfully.');
      router.push('/orders');
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to create order.';
      setFormError(message);
      error(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Create Order</h1>
        <p className="text-slate-600">Build a new order and reserve inventory for your customer.</p>
      </div>

      <div className="card">
        <div className="card-body">
          {formError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading order form…</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Customer</span>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="select mt-2 w-full"
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} — {customer.company || customer.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Priority</span>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="select mt-2 w-full"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-slate-900">Order Items</h2>
                  <button type="button" onClick={addItem} className="btn btn-secondary inline-flex items-center gap-2">
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-[2fr_1fr_auto] items-end rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Product</span>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          className="select mt-2 w-full"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} — ${product.price}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-slate-700">Quantity</span>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="input mt-2 w-full"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn btn-outline btn-error h-12 w-full"
                      >
                        <Trash size={16} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Shipping Address</span>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="textarea mt-2 w-full"
                  rows={3}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="textarea mt-2 w-full"
                  rows={3}
                />
              </label>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Estimated total</p>
                    <p className="text-3xl font-semibold text-slate-900">${orderTotal.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-slate-500">Prices are calculated from current inventory data.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" disabled={submitLoading} className="btn btn-primary">
                  {submitLoading ? 'Creating Order…' : 'Create Order'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => router.push('/orders')}>
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
