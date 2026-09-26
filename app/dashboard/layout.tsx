import React from 'react';
import type { Metadata } from 'next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: 'Dashboard - ConsulSphere',
  description: 'Manage services, orders, analytics, and platform operations.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
