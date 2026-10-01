'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Menu, LogOut, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardNavbarProps {
  role: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
  onRoleChange?: (role: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT') => void;
  onToggleSidebar: () => void;
}

export default function DashboardNavbar({
  role,
  onToggleSidebar,
}: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic title and subtitle based on route and role
  let title = 'Dashboard';
  let subtitle = 'Manage your platform resources and settings.';

  if (pathname === '/dashboard') {
    title = 'Dashboard';
    subtitle = role === 'SUPER_ADMIN'
      ? 'Platform user moderation, role controls, active services, and system analytics.'
      : role === 'PROVIDER'
      ? 'Check your consulting gigs performance, active orders, and revenue.'
      : 'Track your ongoing consulting milestones, invoices, and active orders.';
  } else if (pathname === '/dashboard/orders') {
    title = role === 'CLIENT' ? 'My Orders' : 'Manage Orders';
    subtitle = 'Track and manage your service orders and payments.';
  } else if (pathname === '/dashboard/users') {
    title = 'Users & Roles';
    subtitle = 'Manage platform users, roles, and administrative access.';
  } else if (pathname === '/dashboard/gigs') {
    title = 'Manage Gigs';
    subtitle = 'Oversee all consulting services and gig listings.';
  } else if (pathname === '/dashboard/filters') {
    title = 'Gig Filters';
    subtitle = 'Configure global search filters and categories.';
  } else if (pathname === '/dashboard/reviews') {
    title = 'Reviews';
    subtitle = 'Monitor and manage all client reviews across the platform.';
  } else if (pathname === '/dashboard/profile') {
    title = 'Profile';
    subtitle = 'Manage your personal account details and preferences.';
  } else if (pathname === '/dashboard/admin/support') {
    title = 'Support & Appeals';
    subtitle = 'Handle user tickets, support requests, and dispute appeals.';
  } else {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'Dashboard';
    title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  const handleSignOut = () => {
    logout();
    router.push('/');
  };

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
            <span className="text-slate-700 font-semibold">{title}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
            {title}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="pr-1 text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                {user?.role === 'SUPER_ADMIN' ? 'Admin' : user?.role === 'PROVIDER' ? 'Provider' : 'Client'}
              </span>
            </div>
          </Link>

          {/* Quick Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out of your account"
            className="p-2 sm:px-3 sm:py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-600 hover:text-rose-600 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
