'use client';

import React from 'react';
import ProjectsTable from '@/components/dashboard/ProjectsTable';

export default function DashboardTablesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-bold text-slate-800">Tables &amp; Catalog Management</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review active consulting listings, engagements, and deliverables in table format.
        </p>
      </div>

      <ProjectsTable role="PROVIDER" />
    </div>
  );
}
