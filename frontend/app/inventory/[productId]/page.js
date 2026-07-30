'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import { useNotification } from '../../context/NotificationContext';

export default function InventoryProductPage({ params }) {
  const { productId } = params;
  const router = useRouter();
  const { success, error } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get(`/api/inventory/${productId}`);
        setProduct(response.data);
      } catch (err) {
        setErrorMessage(err.response?.data?.error || 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const deleteProduct = async () => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/inventory/${productId}`);
      success('Product deleted.');
      router.push('/inventory');
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to delete product.';
      error(message);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading product…</div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{errorMessage}</div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-slate-500">Product not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
          <p className="text-slate-600">View or delete this inventory item.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/inventory/${product.id}/edit`} className="btn btn-outline inline-flex items-center gap-2">
            <Edit size={16} /> Edit
          </Link>
          <button type="button" className="btn btn-error inline-flex items-center gap-2" onClick={deleteProduct}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Product Details</h2>
            <div className="grid gap-3 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">SKU</p>
                <p className="text-lg font-semibold text-slate-900">{product.sku}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Category</p>
                <p className="text-lg font-semibold text-slate-900">{product.category || 'General'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quantity</p>
                <p className="text-lg font-semibold text-slate-900">{product.quantity}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
                <p className="text-lg font-semibold text-slate-900">${Number(product.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                <p className="text-lg font-semibold text-slate-900">{product.status}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Inventory Notes</h2>
            <p className="text-slate-600">{product.description || 'No additional description available.'}</p>
            <p className="text-sm text-slate-500">Low stock threshold: {product.lowStockThreshold}</p>
            <p className="text-sm text-slate-500">Created at: {new Date(product.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
