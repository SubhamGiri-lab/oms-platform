'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { useNotification } from '../context/NotificationContext';

export default function InventoryPage() {
  const { success, error } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProducts = async (lowStock = false) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get('/api/inventory', {
        params: lowStock ? { filter: 'low-stock' } : {}
      });
      setProducts(response.data.data || response.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Unable to load inventory.');
      error(err.response?.data?.error || 'Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(filterLowStock);
  }, [filterLowStock]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-600">Track products, stock levels, and low inventory alerts.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className={`btn ${filterLowStock ? 'btn-error' : 'btn-outline'}`}
            onClick={() => setFilterLowStock((prev) => !prev)}
          >
            <AlertTriangle size={18} />
            {filterLowStock ? 'Showing low-stock only' : 'Show low-stock'}
          </button>
          <Link href="/inventory/create" className="btn btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading inventory…</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 text-left text-sm font-semibold text-slate-700">
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Low Stock</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category || 'General'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{product.quantity}</td>
                    <td className="px-6 py-4 text-sm">
                      {product.quantity <= product.lowStockThreshold ? (
                        <span className="badge badge-error">Low</span>
                      ) : (
                        <span className="badge badge-success">Healthy</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">${Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{product.status}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/inventory/${product.id}`} className="btn btn-outline btn-sm inline-flex items-center gap-2">
                          <Edit size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-error btn-sm inline-flex items-center gap-2"
                          onClick={async () => {
                            if (!window.confirm('Delete this product?')) return;
                            try {
                              await api.delete(`/api/inventory/${product.id}`);
                              success('Product deleted.');
                              setProducts((prev) => prev.filter((item) => item.id !== product.id));
                            } catch (err) {
                              const message = err.response?.data?.error || 'Unable to delete product.';
                              error(message);
                            }
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No products found. Create a new product to start tracking inventory.
        </div>
      )}
    </div>
  );
}
