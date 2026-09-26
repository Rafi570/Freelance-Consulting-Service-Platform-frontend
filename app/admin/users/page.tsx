'use client';

import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UsersManagementTable from '@/components/dashboard/UsersManagementTable';

export default function AdminUsersPage() {
  return (
    <DashboardLayout allowedRoles={['SUPER_ADMIN']}>
      <UsersManagementTable />
    </DashboardLayout>
  );
}
