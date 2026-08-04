'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { useNotification } from '../../context/NotificationContext';

export default function OrderDetailPage({ params }) {
  const { orderId } = params;
  const { success, error: notifyError } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const orderTotals = useMemo(() => {
    const subtotal = Number(order?.subtotal || 0);
    const tax = Number(order?.tax || 0);
    const shipping = Number(order?.shippingCost || 0);
    const total = Number(order?.total || subtotal + tax + shipping);

    return { subtotal, tax, shipping, total };
  }, [order]);

  const handleStatusChange = async (nextStatus) => {
    setStatusUpdating(true);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: nextStatus });
      success(`Order status updated to ${nextStatus}.`);
      await loadOrder();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Unable to update order status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePaymentChange = async (nextPaymentStatus) => {
    setPaymentUpdating(true);
    try {
      await api.patch(`/api/orders/${orderId}/payment`, { paymentStatus: nextPaymentStatus });
      success(`Payment status updated to ${nextPaymentStatus}.`);
      await loadOrder();
    } catch (err) {
      notifyError(err.response?.data?.error || 'Unable to update payment status.');
    } finally {
      setPaymentUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-slate-50 text-slate-700">
        Loading order details…
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

  if (!order) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-slate-700">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Order Details</h1>
        <p className="text-slate-600">
          Viewing details for order <span className="font-semibold">{order.orderNumber}</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="card-body space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Order Summary</h2>
              <p className="text-slate-600">Order information, customer, items, totals, and shipping details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Customer</p>
                <p className="text-lg font-semibold text-slate-900">{order.Customer?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Order Amount</p>
                <p className="text-lg font-semibold text-slate-900">${orderTotals.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="text-lg font-semibold text-slate-900 capitalize">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="text-lg font-semibold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Totals</h3>
              <div className="grid gap-2 text-sm text-slate-600">
                <div className="flex items-center justify-between"><span>Subtotal</span><span>${orderTotals.subtotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Tax</span><span>${orderTotals.tax.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Shipping</span><span>${orderTotals.shipping.toFixed(2)}</span></div>
                <div className="flex items-center justify-between font-semibold text-slate-900"><span>Total</span><span>${orderTotals.total.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Items</h3>
              {order.OrderItems?.length > 0 ? (
                <div className="space-y-3">
                  {order.OrderItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <p className="font-semibold text-slate-900">{item.Product?.name || 'Product'}</p>
                        <p className="text-sm text-slate-500">SKU: {item.Product?.sku || '—'}</p>
                      </div>
                      <div className="col-span-2 text-sm text-slate-600">Qty: {item.quantity}</div>
                      <div className="col-span-2 text-sm text-slate-600">Unit: ${item.unitPrice?.toFixed?.(2) ?? item.unitPrice}</div>
                      <div className="col-span-2 text-sm font-semibold text-slate-900">${((item.unitPrice || 0) * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No items found for this order.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Actions</h2>
            <p className="text-slate-600">Update the order lifecycle and payment state without leaving this page.</p>
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block font-medium">Order status</span>
              <select
                value={order.status || 'pending'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                className="select w-full"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              <span className="mb-2 block font-medium">Payment status</span>
              <select
                value={order.paymentStatus || 'pending'}
                onChange={(e) => handlePaymentChange(e.target.value)}
                disabled={paymentUpdating}
                className="select w-full"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </label>
            <Link href="/orders" className="btn btn-primary w-full">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
