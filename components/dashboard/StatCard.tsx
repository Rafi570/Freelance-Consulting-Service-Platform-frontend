'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
  timeframe?: string;
  icon: LucideIcon;
  iconBg?: string;
}

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  timeframe = 'than last week',
  icon: Icon,
  iconBg = 'bg-slate-900',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
            <span
              className={`font-bold ${
                isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {change}
            </span>
            <span className="text-slate-400">{timeframe}</span>
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl ${iconBg} text-white flex items-center justify-center shadow-lg shadow-slate-900/10 shrink-0`}
        >
          <Icon className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
      </div>
    </div>
  );
}
