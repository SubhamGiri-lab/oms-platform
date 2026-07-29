'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';
import { buildSalesChartData, formatCurrency } from '../../lib/dashboardUtils';
import Skeleton from './Skeleton';

export default function SalesChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const response = await api.get('/api/analytics/sales/by-date?days=30');
        setData(buildSalesChartData(response.data || []));
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, []);
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Sales & Revenue</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Performance over the last 30 days.</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              Last 30 days
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="py-6">
            <Skeleton count={3} />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-slate-500 dark:text-slate-400">No sales data available yet.</div>
        ) : (
          <>
            <div className="flex items-center justify-end mb-3 gap-2">
              <button
                onClick={() => {
                  // download CSV
                  const csv = [Object.keys(data[0]).join(','), ...data.map((r) => Object.values(r).join(','))].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sales.csv';
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                }}
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                Export CSV
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.12} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.08)'
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#revenueGradient)" fillOpacity={0.3} />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
