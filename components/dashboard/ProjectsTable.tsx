'use client';

import React from 'react';
import { Check, MoreVertical } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  category: string;
  iconBg: string;
  iconLetter: string;
  members: string[];
  budget: string;
  completion: number;
  barColor: string;
}

interface ProjectsTableProps {
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}

export default function ProjectsTable({ role = 'PROVIDER' }: ProjectsTableProps) {
  const projects: ProjectItem[] = [
    {
      id: '1',
      name: 'Material XD Version',
      category: 'UI/UX Consulting',
      iconBg: 'bg-rose-500',
      iconLetter: 'Xd',
      members: ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg', '/avatars/4.jpg'],
      budget: '$14,000',
      completion: 60,
      barColor: 'bg-blue-500',
    },
    {
      id: '2',
      name: 'Add Progress Track',
      category: 'Full Stack Engineering',
      iconBg: 'bg-blue-600',
      iconLetter: 'At',
      members: ['/avatars/2.jpg', '/avatars/4.jpg'],
      budget: '$3,000',
      completion: 10,
      barColor: 'bg-blue-400',
    },
    {
      id: '3',
      name: 'Fix Platform Errors',
      category: 'Bug Fix & DevOps',
      iconBg: 'bg-amber-500',
      iconLetter: 'Sl',
      members: ['/avatars/1.jpg', '/avatars/3.jpg'],
      budget: 'Not set',
      completion: 100,
      barColor: 'bg-emerald-500',
    },
    {
      id: '4',
      name: 'Spotify App Redesign',
      category: 'Brand & Mobile App',
      iconBg: 'bg-emerald-600',
      iconLetter: 'Sp',
      members: ['/avatars/3.jpg', '/avatars/4.jpg', '/avatars/1.jpg'],
      budget: '$20,500',
      completion: 100,
      barColor: 'bg-emerald-500',
    },
    {
      id: '5',
      name: 'Consulting Pricing Model',
      category: 'Business Strategy',
      iconBg: 'bg-indigo-600',
      iconLetter: 'In',
      members: ['/avatars/2.jpg'],
      budget: '$500',
      completion: 25,
      barColor: 'bg-rose-500',
    },
  ];

  const title = role === 'SUPER_ADMIN' ? 'Platform Contracts' : role === 'CLIENT' ? 'Active Orders' : 'Projects';
  const subtitle = role === 'SUPER_ADMIN' ? '124 active contracts' : role === 'CLIENT' ? '5 ongoing deliverables' : '30 done this month';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h4 className="text-base font-bold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
            <Check className="w-3.5 h-3.5 text-blue-500 stroke-[3]" />
            <span>
              <strong className="text-slate-700">{subtitle}</strong>
            </span>
          </p>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">COMPANIES</th>
              <th className="pb-3 px-4">MEMBERS</th>
              <th className="pb-3 px-4">BUDGET</th>
              <th className="pb-3 pl-4">COMPLETION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50/60 transition-colors">
                {/* Project Company */}
                <td className="py-3.5 pr-4 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${project.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                  >
                    {project.iconLetter}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 text-xs block">
                      {project.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {project.category}
                    </span>
                  </div>
                </td>

                {/* Members overlapping */}
                <td className="py-3.5 px-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {project.members.map((_, i) => {
                      const colors = [
                        'bg-slate-700 text-slate-100',
                        'bg-emerald-600 text-white',
                        'bg-amber-600 text-white',
                        'bg-indigo-600 text-white',
                      ];
                      return (
                        <div
                          key={i}
                          className={`inline-block h-6 w-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold ${colors[i % colors.length]}`}
                        >
                          U{i + 1}
                        </div>
                      );
                    })}
                  </div>
                </td>

                {/* Budget */}
                <td className="py-3.5 px-4 font-semibold text-slate-700">
                  {project.budget}
                </td>

                {/* Completion Progress Bar */}
                <td className="py-3.5 pl-4 min-w-[130px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 w-8">
                      {project.completion}%
                    </span>
                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${project.completion}%` }}
                        className={`h-full ${project.barColor} rounded-full`}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
