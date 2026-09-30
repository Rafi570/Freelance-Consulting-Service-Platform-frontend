'use client';

import React from 'react';
import GigsManagement from '@/components/dashboard/GigsManagement';

export default function DashboardGigsPage({
  role,
}: {
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}) {
  return <GigsManagement role={role} />;
}
