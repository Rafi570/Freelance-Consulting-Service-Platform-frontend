'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Table,
  User,
  LogIn,
  LogOut,
  Users,
  ShoppingBag
} from 'lucide-react';

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
  const router = useRouter();
  const { user, logout } = useAuth();

  // Navigation items based on role
  const getNavItems = () => {
    if (role === 'SUPER_ADMIN') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Users & Roles', href: '/dashboard/users', icon: Users },
      ];
    }

    // Default: PROVIDER
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Explore Gigs', href: '/gigs', icon: Table },
    ];
  };

  const navItems = getNavItems();

  const accountPages = [
    { label: 'Profile', href: '/dashboard/profile', icon: User },
    { label: 'Back to Home', href: '/', icon: LogIn },
  ];

  const roleLabel = role === 'SUPER_ADMIN' ? 'Super Admin' : 'Provider Pro';

  const roleColor =
    role === 'SUPER_ADMIN'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

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

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    if (onClose) onClose();
                    router.push('/');
                  }}
                  className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-100 text-rose-600 shadow-2xs">
                    <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
