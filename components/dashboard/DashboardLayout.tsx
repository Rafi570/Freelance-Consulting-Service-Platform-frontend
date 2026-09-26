'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import { Settings, X, Shield, Briefcase, User, Sparkles } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  initialRole?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}

export default function DashboardLayout({
  children,
  initialRole,
}: DashboardLayoutProps) {
  const { user } = useAuth();

  // If user is logged in, use their role, else fallback to initialRole or 'PROVIDER'
  const [activeRole, setActiveRole] = useState<'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT'>(
    () => {
      if (initialRole) return initialRole;
      if (user?.role === 'SUPER_ADMIN') return 'SUPER_ADMIN';
      if (user?.role === 'PROVIDER') return 'PROVIDER';
      if (user?.role === 'CLIENT') return 'CLIENT';
      return 'PROVIDER';
    }
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Sync with auth user role if user logs in
  useEffect(() => {
    if (user?.role && !initialRole) {
      setActiveRole(user.role);
    }
  }, [user, initialRole]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      <div className="flex flex-1">
        {/* Sidebar */}
        <DashboardSidebar
          role={activeRole}
          onRoleChange={setActiveRole}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
          {/* Top Navbar */}
          <DashboardNavbar
            role={activeRole}
            onRoleChange={setActiveRole}
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
            <p>© {new Date().getFullYear()} ConsulSphere Dashboard. Inspired by Soft UI &amp; Creative Tim aesthetics.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-600 cursor-pointer">Licensing</span>
              <span className="hover:text-slate-600 cursor-pointer">Documentation</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Floating Gear Settings Button (bottom right - exactly like screenshot) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="w-11 h-11 rounded-full bg-white text-slate-800 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200 flex items-center justify-center hover:scale-105 hover:shadow-lg transition-all cursor-pointer group"
          title="Dashboard Preferences"
        >
          <Settings className="w-5 h-5 text-slate-700 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      {/* Settings Modal / Quick Drawer */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  ⚙
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Dashboard Configurator</h3>
                  <p className="text-[11px] text-slate-400">Preview Layout Roles &amp; Styles</p>
                </div>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Active Layout Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('PROVIDER');
                      setSettingsOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      activeRole === 'PROVIDER'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block">Provider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('SUPER_ADMIN');
                      setSettingsOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      activeRole === 'SUPER_ADMIN'
                        ? 'border-purple-500 bg-purple-50 text-purple-800 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Shield className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    <span className="text-xs block">Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveRole('CLIENT');
                      setSettingsOpen(false);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      activeRole === 'CLIENT'
                        ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block">Client</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Role Layout Preview Ready
                </p>
                <p className="text-[11px] text-slate-500">
                  Switch between <strong>Provider</strong>, <strong>Admin</strong>, and <strong>Client</strong> to examine their specific navigation links, metric metrics, charts, and tables!
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                Close Configurator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
