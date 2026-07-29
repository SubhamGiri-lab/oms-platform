'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useNotification } from '../context/NotificationContext';

const reportList = [
  { key: 'salesOverview', label: 'Sales Overview', endpoint: '/api/analytics/sales/overview' },
  { key: 'salesByDate', label: 'Sales by Date', endpoint: '/api/analytics/sales/by-date?days=30' },
  { key: 'topProducts', label: 'Top Products', endpoint: '/api/analytics/products/top?limit=10' },
  { key: 'topCustomers', label: 'Top Customers', endpoint: '/api/analytics/customers/top?limit=10' }
];

export default function DocumentsPage() {
  const { success, error } = useNotification();
  const [activeReport, setActiveReport] = useState(reportList[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReport = async (report) => {
    setLoading(true);
    setErrorMessage('');
    setReportData(null);

    try {
      const response = await api.get(report.endpoint);
      setReportData(response.data);
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to load report.';
      setErrorMessage(message);
      error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport]);

  const downloadReport = () => {
    if (!reportData) return;

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeReport.key}.json`;
    link.click();
    URL.revokeObjectURL(url);
    success('Report downloaded.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Documents</h1>
        <p className="text-slate-600">Download analytics reports and export documents.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Available Reports</h2>
            <p className="mt-2 text-sm text-slate-500">Select a report and download the JSON export.</p>
          </div>
          {reportList.map((report) => (
            <button
              key={report.key}
              type="button"
              onClick={() => setActiveReport(report)}
              className={`w-full rounded-xl border px-4 py-4 text-left ${activeReport.key === report.key ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <div className="font-semibold">{report.label}</div>
              <div className="text-sm text-slate-500">Endpoint: {report.endpoint}</div>
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{activeReport.label}</h2>
                <p className="text-sm text-slate-500">Review the latest export data for this report.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={downloadReport} disabled={!reportData || loading}>
                Download JSON
              </button>
            </div>

            {loading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">Loading report…</div>
            ) : errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">{errorMessage}</div>
            ) : (
              <pre className="max-h-[520px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100">{JSON.stringify(reportData, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
