'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Settings,
  Bell,
  User,
  Star,
  Menu,
  Sparkles,
  ExternalLink,
  Shield,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardNavbarProps {
  role: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
  onRoleChange: (role: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT') => void;
  onToggleSidebar: () => void;
}

export default function DashboardNavbar({
  role,
  onRoleChange,
  onToggleSidebar,
}: DashboardNavbarProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic subtitle based on role
  const subtitle =
    role === 'SUPER_ADMIN'
      ? 'Check the sales, platform users, active gigs and revenue metrics.'
      : role === 'PROVIDER'
      ? 'Check your gig performance, active client orders and monthly revenue.'
      : 'Track your ongoing consulting milestones, invoices and active orders.';

  return (
    <header className="w-full pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Breadcrumbs & Page Heading */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link href="/dashboard" className="hover:text-slate-700 transition-colors">
              Pages
            </Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Dashboard</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Right: Actions, Search, Role Switcher & User Profile */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Quick Role Switcher (Allows testing Admin, Provider & Client instantly) */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onRoleChange('PROVIDER')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                role === 'PROVIDER'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Provider
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('SUPER_ADMIN')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                role === 'SUPER_ADMIN'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('CLIENT')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                role === 'CLIENT'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Client
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Type here..."
              className="w-36 sm:w-44 pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-700 placeholder:text-slate-400 shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Online Builder Button (Matches Creative Tim Screenshot) */}
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-pink-600 border border-pink-400/80 rounded-xl hover:bg-pink-50 transition-colors bg-white shadow-2xs"
          >
            <span>Online Builder</span>
          </button>

          {/* Star Button (Matches Creative Tim Screenshot) */}
          <div className="hidden md:inline-flex items-center text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <span className="flex items-center gap-1 pr-2 border-r border-slate-200">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Star</span>
            </span>
            <span className="pl-2 text-slate-600 font-semibold">12,066</span>
          </div>

          {/* Settings Icon */}
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notifications Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200 relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            {/* Notification Dropdown Preview */}
            {showNotifications && (
              <div
                onMouseLeave={() => setShowNotifications(false)}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                  <span>Notifications</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    3 New
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-800">New order #1832412</p>
                    <p className="text-[11px] text-slate-400">Payment received • 21 Dec</p>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <p className="font-semibold text-slate-800">Service deliverable approved</p>
                    <p className="text-[11px] text-slate-400">Material XD Project • 20 Dec</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden xl:inline pr-2">
              {user?.name || (role === 'SUPER_ADMIN' ? 'Admin' : role === 'PROVIDER' ? 'Provider' : 'Client')}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
