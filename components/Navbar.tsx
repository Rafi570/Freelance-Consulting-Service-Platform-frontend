'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Menu, 
  X, 
  Globe, 
  LogOut, 
  Briefcase, 
  ShoppingBag, 
  ShieldCheck, 
  ChevronDown,
  PlusCircle
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const subCategories = [
    { label: 'Graphics & Design', href: '/gigs?category=Graphics+%26+Design' },
    { label: 'Programming & Tech', href: '/gigs?category=Web+Development' },
    { label: 'Digital Marketing', href: '/gigs?category=Digital+Marketing' },
    { label: 'Video & Animation', href: '/gigs?category=Video+%26+Animation' },
    { label: 'Writing & Translation', href: '/gigs?category=Writing+%26+Translation' },
    { label: 'Business & Consulting', href: '/gigs?category=Business+Strategy' },
    { label: 'AI Services', href: '/gigs?category=AI+%26+Machine+Learning' },
    { label: 'Support & Appeals', href: '/support' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 text-slate-800">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo (Fiverr style with green dot) */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              ConsulSphere<span className="text-[#1dbf73]">.</span>
            </span>
          </Link>

          {/* Desktop Right Links (Fiverr Style) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link
              href="/gigs"
              className="hover:text-[#1dbf73] transition-colors"
            >
              Explore Gigs
            </Link>

            <Link
              href="/providers"
              className="hover:text-[#1dbf73] transition-colors"
            >
              Find Consultants
            </Link>

            {(!user || user.role === 'CLIENT') && (
              <Link
                href="/register?role=PROVIDER"
                className="hover:text-[#1dbf73] transition-colors"
              >
                Become a Provider
              </Link>
            )}

            <div className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer">
              <Globe className="w-4 h-4" />
              <span>English</span>
            </div>

            {/* If Authenticated: User Menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {getInitials(user.name || 'User')}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden lg:inline">
                    {user.name}
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-slate-100 text-slate-600 border border-slate-200">
                    {user.role === 'SUPER_ADMIN' ? 'Admin' : user.role === 'PROVIDER' ? 'Pro' : 'Client'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1dbf73] rounded-lg transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-slate-400" />
                      <span>My Orders</span>
                    </Link>

                    {user.role === 'PROVIDER' && (
                      <>
                        <Link
                          href="/gigs/my-gigs"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1dbf73] rounded-lg transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-slate-400" />
                          <span>My Gigs</span>
                        </Link>
                        <Link
                          href="/gigs/create"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1dbf73] rounded-lg transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-400" />
                          <span>Create New Gig</span>
                        </Link>
                      </>
                    )}

                    {user.role === 'SUPER_ADMIN' && (
                      <Link
                        href="/admin/users"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      href="/support"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#1dbf73] rounded-lg transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span>Support &amp; Appeals</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If Unauthenticated: Show Sign In & Join */
              <>
                <Link
                  href="/login"
                  className="hover:text-[#1dbf73] transition-colors"
                >
                  Sign in
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 rounded border border-[#1dbf73] text-[#1dbf73] hover:bg-[#1dbf73] hover:text-white transition-colors duration-200 font-bold"
                >
                  Join
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {!user ? (
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs font-bold rounded border border-[#1dbf73] text-[#1dbf73] hover:bg-[#1dbf73] hover:text-white"
              >
                Join
              </Link>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold text-xs">
                {getInitials(user.name || 'User')}
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Fiverr Secondary Category Navigation Bar */}
      <div className="hidden lg:block border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-xs sm:text-sm font-medium text-slate-600 py-2.5 overflow-x-auto scrollbar-none">
            {subCategories.map((sub) => (
              <li key={sub.label} className="shrink-0">
                <Link
                  href={sub.href}
                  className="hover:text-[#1dbf73] hover:border-b-2 hover:border-[#1dbf73] pb-2 transition-all block"
                >
                  {sub.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-6 space-y-4">
          {user && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2">
              <p className="text-xs font-bold text-slate-900">{user.name}</p>
              <p className="text-[11px] text-slate-500">{user.email}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-100 text-emerald-800">
                Role: {user.role}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-3 font-semibold text-sm text-slate-700">
            <Link
              href="/gigs"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#1dbf73]"
            >
              Explore Gigs
            </Link>
            <Link
              href="/providers"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#1dbf73]"
            >
              Find Consultants
            </Link>

            {user && (
              <Link
                href="/orders"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#1dbf73]"
              >
                My Orders
              </Link>
            )}

            {user?.role === 'PROVIDER' && (
              <Link
                href="/gigs/my-gigs"
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-[#1dbf73]"
              >
                My Gigs
              </Link>
            )}

            <Link
              href="/support"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#1dbf73]"
            >
              Support &amp; Appeals
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full py-2.5 text-center rounded bg-red-50 text-red-600 font-bold text-sm cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center rounded border border-slate-200 text-slate-700 font-bold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 text-center rounded bg-[#1dbf73] text-white font-bold text-sm shadow-sm"
                >
                  Join ConsulSphere
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
