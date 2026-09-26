'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, MapPin, Briefcase, Star, Clock } from 'lucide-react';

export default function DashboardProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  {user?.name || 'Authorized User'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email || 'user@consulsphere.com'}</p>
              </div>

              <span className="self-center sm:self-auto px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                {user?.role || 'ACTIVE MEMBER'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Role</span>
                <span className="font-semibold">{user?.role || 'Provider'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Rating</span>
                <span className="font-semibold text-amber-500">★ 4.98 (42 reviews)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Response Time</span>
                <span className="font-semibold">&lt; 1 hour</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
