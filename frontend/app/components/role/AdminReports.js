import React from 'react';
import Link from 'next/link';

export default function AdminReports() {
  return (
    <div className="mt-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-slate-900">Admin Reports</h3>
        </div>
        <div className="card-body">
          <p className="text-sm text-slate-600">Admins can download full reports, manage users and export data.</p>
          <div className="mt-4 flex gap-2">
            <a href="/api/analytics/reports/full.csv" className="btn bg-blue-600 text-white px-3 py-1 rounded">Download full CSV</a>
            <Link href="/users" className="btn btn-secondary px-3 py-1 rounded border">Manage users</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
