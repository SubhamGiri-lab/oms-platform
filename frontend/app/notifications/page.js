'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useNotification } from '../context/NotificationContext';

export default function NotificationsPage() {
  const { success, error } = useNotification();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data || []);
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to load notifications.';
      setErrorMessage(message);
      error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      success('All notifications marked as read.');
      await loadNotifications();
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to mark all read.';
      error(message);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      success('Notification marked as read.');
      setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to update notification.';
      error(message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      success('Notification deleted.');
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to delete notification.';
      error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-600">Review all alerts and activity messages for your account.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={markAllRead} disabled={loading}>
          Mark all as read
        </button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading notifications…</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No notifications available.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`rounded-lg border p-4 ${notification.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{notification.title || 'Notification'}</p>
                  <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{notification.type}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!notification.read && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => markAsRead(notification.id)}>
                      Mark read
                    </button>
                  )}
                  <button type="button" className="btn btn-error btn-sm" onClick={() => deleteNotification(notification.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
