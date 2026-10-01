'use client';

import React from 'react';
import ReviewsManagement from '@/components/dashboard/ReviewsManagement';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardReviewsPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  // Protect the route
  React.useEffect(() => {
    if (isHydrated && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reviews Management</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and manage all reviews across the platform</p>
        </div>
      </div>

      <ReviewsManagement />
    </div>
  );
}
