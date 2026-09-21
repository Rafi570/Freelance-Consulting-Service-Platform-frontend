'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Globe } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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

            <Link
              href="/register?role=PROVIDER"
              className="hover:text-[#1dbf73] transition-colors"
            >
              Become a Provider
            </Link>

            <div className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer">
              <Globe className="w-4 h-4" />
              <span>English</span>
            </div>

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
          </nav>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="px-3 py-1.5 text-xs font-bold rounded border border-[#1dbf73] text-[#1dbf73] hover:bg-[#1dbf73] hover:text-white"
            >
              Join
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-700 hover:bg-slate-100"
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
            <Link
              href="/register?role=PROVIDER"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#1dbf73]"
            >
              Become a Provider
            </Link>
            <Link
              href="/support"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#1dbf73]"
            >
              Support & Appeals
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-1 hover:text-[#1dbf73]"
            >
              Sign in
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 text-center rounded bg-[#1dbf73] text-white font-bold text-sm shadow-sm"
            >
              Join ConsulSphere
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
