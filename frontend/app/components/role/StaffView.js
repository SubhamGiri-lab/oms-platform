import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function StaffView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // attempt to fetch assigned orders; fall back to recent orders
        const res = await api.get(`/api/orders?assignedTo=${user?.id || ''}&limit=5`);
        if (!mounted) return;
        setTasks(res.data?.data || res.data || []);
      } catch (err) {
        try {
          const fallback = await api.get('/api/orders?limit=5');
          if (!mounted) return;
          setTasks(fallback.data?.data || fallback.data || []);
        } catch (e) {
          // ignore
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user?.id]);

  return (
    <div className="mt-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-slate-900">My Tasks</h3>
        </div>
        <div className="card-body">
          <p className="text-sm text-slate-600">Assigned orders and quick actions for staff members.</p>
          {loading ? (
            <div className="mt-3 text-sm text-slate-500">Loading tasks…</div>
          ) : tasks.length === 0 ? (
            <div className="mt-3 text-sm text-slate-500">No tasks assigned.</div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span>{t.orderNumber || t.id}</span>
                  <a href={`/orders/${t.id}`} className="text-blue-600">Open</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
