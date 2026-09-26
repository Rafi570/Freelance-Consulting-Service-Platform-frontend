'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return <main className="min-h-screen w-full bg-[#f8f9fa]">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </>
  );
}
