import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function ManagerView() {
  const [kpis, setKpis] = useState({ teamOrders: 0, avgFulfillment: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [salesRes] = await Promise.all([
          api.get('/api/analytics/sales/overview')
        ]);

        if (!mounted) return;
        const overview = salesRes?.data || {};
        setKpis({ teamOrders: overview.totalOrders || 0, avgFulfillment: overview.avgFulfillment || 0 });
      } catch (err) {
        // keep defaults
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="mt-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-slate-900">Manager Overview</h3>
        </div>
        <div className="card-body space-y-3">
          <p className="text-sm text-slate-600">Manager view includes team KPIs and quick filters for performance.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded border bg-white dark:bg-slate-800">Team Orders: <strong>{loading ? '…' : kpis.teamOrders}</strong></div>
            <div className="p-3 rounded border bg-white dark:bg-slate-800">Avg Fulfillment: <strong>{loading ? '…' : `${kpis.avgFulfillment} days`}</strong></div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1 rounded bg-blue-600 text-white">Export team CSV</button>
            <button className="px-3 py-1 rounded border">Open team dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}
