'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  bgColor,
  iconColor
  , loading
}) {
  return (
    <div className="card group hover:-translate-y-1 hover:shadow-xl">
      <div className="card-body">
        {loading ? (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-32 mb-2 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-2" />
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
            <div className={`rounded-2xl p-3 ${bgColor} shadow-sm`}>
              <div className={`h-6 w-6 rounded ${iconColor ?? 'bg-slate-300 dark:bg-slate-600'}`} />
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
              <p className="mb-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <ArrowUpRight size={18} className="text-green-600" />
                ) : (
                  <ArrowDownRight size={18} className="text-red-600" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {change}
                </span>
                <span className="ml-1 text-sm text-slate-500 dark:text-slate-400">vs last month</span>
              </div>
            </div>
            <div className={`rounded-2xl p-3 ${bgColor} shadow-sm`}>
              <Icon size={24} className={iconColor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
