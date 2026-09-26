'use client';

import React from 'react';
import {
  Bell,
  Code2,
  ShoppingCart,
  CreditCard,
  KeyRound,
  ArrowUp,
  LucideIcon
} from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  time: string;
  icon: LucideIcon;
  iconColor: string;
}

interface OrdersOverviewProps {
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}

export default function OrdersOverview({ role = 'PROVIDER' }: OrdersOverviewProps) {
  const items: TimelineItem[] = [
    {
      id: '1',
      title: '$2400, Design changes',
      time: '22 DEC 7:20 PM',
      icon: Bell,
      iconColor: 'text-emerald-500',
    },
    {
      id: '2',
      title: 'New order #1832412',
      time: '21 DEC 11 PM',
      icon: Code2,
      iconColor: 'text-rose-500',
    },
    {
      id: '3',
      title: 'Server payments for April',
      time: '21 DEC 9:34 PM',
      icon: ShoppingCart,
      iconColor: 'text-blue-500',
    },
    {
      id: '4',
      title: 'New card added for order #4395133',
      time: '20 DEC 2:20 AM',
      icon: CreditCard,
      iconColor: 'text-amber-500',
    },
    {
      id: '5',
      title: 'Unlock packages for development',
      time: '18 DEC 4:54 AM',
      icon: KeyRound,
      iconColor: 'text-purple-500',
    },
  ];

  const title = role === 'SUPER_ADMIN' ? 'Platform Activity' : role === 'CLIENT' ? 'Order Updates' : 'Orders overview';
  const subtitle = '24% this month';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="pb-4">
        <h4 className="text-base font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
          <ArrowUp className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
          <span>
            <strong className="text-slate-700">{subtitle}</strong>
          </span>
        </p>
      </div>

      {/* Timeline */}
      <div className="relative mt-2">
        {/* Continuous vertical connecting line */}
        <div className="absolute left-[13px] top-3 bottom-6 w-[2px] bg-slate-100" />

        <div className="space-y-5">
          {items.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === items.length - 1;

            return (
              <div key={item.id} className="relative flex items-start gap-3.5 group">
                {/* Icon marker */}
                <div className="z-10 bg-white ring-4 ring-white rounded-full p-0.5">
                  <Icon className={`w-5 h-5 ${item.iconColor} stroke-[2.2]`} />
                </div>

                {/* Content */}
                <div className="pt-0.5">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {item.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
