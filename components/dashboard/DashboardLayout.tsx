'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import BlockedProviderSupport from './BlockedProviderSupport';
import { Lock, ShieldAlert, LogIn, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  initialRole?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
  allowedRoles?: ('PROVIDER' | 'SUPER_ADMIN' | 'CLIENT')[];
}

export default function DashboardLayout({
  children,
  initialRole,
  allowedRoles,
}: DashboardLayoutProps) {
  const { user, isHydrated, openAuthModal } = useAuth();
  const pathname = usePathname();

  // Role is strictly driven by the logged-in user's role
  const [activeRole, setActiveRole] = useState<'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT'>('PROVIDER');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  // Allow Super Admin to preview other roles if requested, but regular users cannot escalate
  const handleRoleChange = (newRole: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT') => {
    if (user?.role === 'SUPER_ADMIN') {
      setActiveRole(newRole);
    }
  };

  // 1. Session Hydration Loading State
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs font-bold text-slate-600 tracking-wide uppercase">
            Verifying Authentication...
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated (Logged Out) State Guard
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-xs">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              Access Restricted
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              You must be signed in to access the ConsulSphere Dashboard, view active contracts, manage services, and review platform operations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In Now</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="text-[#1dbf73] font-bold hover:underline cursor-pointer"
            >
              Join ConsulSphere
            </button>
          </p>
        </div>
      </div>
    );
  }

  // 3. Blocked Provider Guard
  if (user.status === 'BLOCKED') {
    return <BlockedProviderSupport />;
  }
  // 4. Client Role Guard (Clients do not have a dashboard)
  if (user.role === 'CLIENT') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
            <LayoutDashboard className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Client Marketplace
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Dashboard is reserved for service providers and administrators. You can browse gigs and hire consultants directly from the marketplace.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home Page</span>
            </Link>

            <Link
              href="/gigs"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Explore Gigs</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Super Admin Route Guard
  // Any route under /admin, /dashboard/users, or /dashboard/admin requires SUPER_ADMIN role
  const isAdminRoute =
    pathname?.startsWith('/admin') ||
    pathname === '/dashboard/users' ||
    pathname?.startsWith('/dashboard/admin') ||
    (allowedRoles && allowedRoles.includes('SUPER_ADMIN') && !allowedRoles.includes('CLIENT') && !allowedRoles.includes('PROVIDER'));

  if (isAdminRoute && user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              403 Forbidden
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Access Denied: Super Admin Only
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              You do not have administrative privileges to manage platform users or access admin operations.
              You are currently signed in as <strong className="text-slate-800">{user.name}</strong> with role{' '}
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                {user.role}
              </span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </Link>

            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home Page</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Role Guard for Explicit allowedRoles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-800">Unauthorized Section</h2>
            <p className="text-xs text-slate-500">
              This section is reserved for {allowedRoles.join(', ')} users.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 5. Authorized Render
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar
          role={activeRole}
          onRoleChange={user.role === 'SUPER_ADMIN' ? handleRoleChange : undefined}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
          {/* Top Navbar */}
          <DashboardNavbar
            role={activeRole}
            onRoleChange={user.role === 'SUPER_ADMIN' ? handleRoleChange : undefined}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Page Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5">
            {/* Clone child and pass activeRole if possible */}
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement<any>, { role: activeRole })
              : children}
          </main>

          {/* Footer note in dashboard */}
          <footer className="px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 gap-2">
            <p>© {new Date().getFullYear()} ConsulSphere Dashboard. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-600 cursor-pointer">Licensing</span>
              <span className="hover:text-slate-600 cursor-pointer">Documentation</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
