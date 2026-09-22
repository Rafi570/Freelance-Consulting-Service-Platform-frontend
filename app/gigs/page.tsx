import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import GigsShowcase from '@/components/GigsShowcase';

export const metadata: Metadata = {
  title: 'Explore Services & Gigs - ConsulSphere',
  description:
    'Find and order top-rated freelance consulting services ranked by completed orders, client reviews, and verified provider expertise.',
};

export default function GigsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#1dbf73] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">
              Loading Consulting Gigs...
            </p>
          </div>
        </div>
      }
    >
      <GigsShowcase />
    </Suspense>
  );
}
