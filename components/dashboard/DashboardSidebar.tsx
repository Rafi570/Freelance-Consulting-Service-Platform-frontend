'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Table,
  CreditCard,
  Box,
  ArrowLeftRight,
  Bell,
  User,
  LogIn,
  UserPlus,
  HelpCircle,
  ExternalLink,
  Users,
  Briefcase,
  ShoppingBag,
  Star,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Logo from '@/components/Logo';

interface SidebarProps {
  role: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
  onRoleChange?: (role: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT') => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({
  role,
  onRoleChange,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  // Navigation items based on role
  const getNavItems = () => {
    if (role === 'SUPER_ADMIN') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Users & Roles', href: '/dashboard/users', icon: Users },
        { label: 'Gig Management', href: '/dashboard/gigs', icon: Briefcase },
        { label: 'Platform Orders', href: '/dashboard/orders', icon: ShoppingBag },
        { label: 'Billing & Escrow', href: '/dashboard/billing', icon: CreditCard },
        { label: 'Analytics & RTL', href: '/dashboard/analytics', icon: ArrowLeftRight },
        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      ];
    }

    if (role === 'CLIENT') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Orders', href: '/orders', icon: ShoppingBag },
        { label: 'Consultants', href: '/providers', icon: Users },
        { label: 'Billing & Invoices', href: '/dashboard/billing', icon: CreditCard },
        { label: 'Saved Services', href: '/gigs', icon: Box },
        { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      ];
    }

    // Default: PROVIDER
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Tables & Gigs', href: '/dashboard/tables', icon: Table },
      { label: 'Billing & Payouts', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Virtual Reality', href: '/dashboard/vr', icon: Box },
      { label: 'RTL & Analytics', href: '/dashboard/rtl', icon: ArrowLeftRight },
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    ];
  };

  const navItems = getNavItems();

  const accountPages = [
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Browse Market', href: '/gigs', icon: ExternalLink },
    { label: 'Back to Home', href: '/', icon: LogIn },
  ];

  const roleLabel =
    role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'PROVIDER' ? 'Provider Pro' : 'Client Mode';

  const roleColor =
    role === 'SUPER_ADMIN'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : role === 'PROVIDER'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-slate-100 lg:border-none lg:m-4 lg:h-[calc(100vh-2rem)] lg:rounded-3xl lg:shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* Header Brand */}
          <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                ⚡
              </div>
              <div>
                <span className="font-extrabold text-slate-800 tracking-tight text-sm block">
                  ConsulSphere
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Soft UI Dashboard
                </span>
              </div>
            </div>

            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleColor}`}
            >
              {role === 'SUPER_ADMIN' ? 'Admin' : role === 'PROVIDER' ? 'Provider' : 'Client'}
            </span>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard' || pathname === '/dashboard/provider' || pathname === '/dashboard/admin'
                  : pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'bg-white text-slate-700 shadow-xs border border-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Section: Account Pages */}
          <div className="pt-2">
            <p className="px-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              ACCOUNT PAGES
            </p>
            <div className="space-y-1">
              {accountPages.map((page) => {
                const Icon = page.icon;
                const isActive = pathname === page.href;

                return (
                  <Link
                    key={page.label}
                    href={page.href}
                    onClick={onClose}
                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'bg-white text-slate-700 shadow-xs border border-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span>{page.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom CTA Block (Matches Creative Tim Screenshot) */}
        <div className="p-4 pt-0">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Need Assistance?</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Please check our platform documentation & guides.
            </p>

            <div className="pt-1 space-y-1.5">
              <Link
                href="/guides"
                className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
              >
                <span>Documentation</span>
              </Link>
              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-md shadow-slate-900/10"
              >
                <span>Upgrade to pro</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
