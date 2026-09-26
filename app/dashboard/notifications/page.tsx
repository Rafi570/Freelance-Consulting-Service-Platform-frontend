'use client';

import React from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function DashboardNotificationsPage() {
  const notifications = [
    {
      id: '1',
      title: 'New order #1832412 placed',
      desc: 'Client booked standard consultation package.',
      time: '12 minutes ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Payment Escrow Released',
      desc: '$2,400 released for Material XD project deliverable.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: '3',
      title: '5-Star Review Received',
      desc: '"Outstanding expertise and fast turnaround!"',
      time: 'Yesterday at 4:30 PM',
      unread: false,
    },
  ];

  return (
    <div className="max-w-4xl space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
          <p className="text-xs text-slate-400">Keep track of order updates, payments and client communications.</p>
        </div>
        <button className="text-xs text-emerald-600 font-semibold hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl bg-white border border-slate-100 flex items-start gap-3.5 transition-all ${
              n.unread ? 'border-l-4 border-l-emerald-500 shadow-xs' : 'opacity-80'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
