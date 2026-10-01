'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Plus,
  Search,
  Filter,
  Layers,
  Tag,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  X,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  IGigFilter,
  getGigFilters,
  createGigFilter,
  updateGigFilter,
  deleteGigFilter
} from '@/lib/api';

const EMOJI_OPTIONS = [
  { emoji: '💻', name: 'Web & Tech' },
  { emoji: '🎨', name: 'Design' },
  { emoji: '📱', name: 'Mobile' },
  { emoji: '🤖', name: 'AI' },
  { emoji: '📈', name: 'Marketing' },
  { emoji: '🎬', name: 'Video' },
  { emoji: '✍️', name: 'Writing' },
  { emoji: '💼', name: 'Business' },
  { emoji: '🛡️', name: 'Security' },
  { emoji: '⚡', name: 'Innovation' },
  { emoji: '💰', name: 'Finance' },
  { emoji: '🌐', name: 'Cloud' },
];

export default function GigFiltersManagement() {
  const { user: currentAuthUser } = useAuth();

  const [filters, setFilters] = useState<IGigFilter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    label: '',
    type: 'CATEGORY' as 'CATEGORY' | 'TAG' | 'FEATURED',
    description: '',
    icon: '💻',
    isActive: true,
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Edit Modal state
  const [editingFilter, setEditingFilter] = useState<IGigFilter | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    label: '',
    type: 'CATEGORY' as 'CATEGORY' | 'TAG' | 'FEATURED',
    description: '',
    icon: '💻',
    isActive: true,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Confirmation state
  const [deletingFilter, setDeletingFilter] = useState<IGigFilter | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Fetch all filters
  const loadFilters = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getGigFilters({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        isActive: statusFilter !== 'ALL' ? statusFilter === 'ACTIVE' : undefined,
        searchTerm: searchTerm.trim() || undefined,
      });
      setFilters(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load gig filters');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle Create Filter
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      setErrorMessage('Filter name is required');
      return;
    }

    setIsSubmittingCreate(true);
    setErrorMessage(null);
    try {
      const newFilter = await createGigFilter({
        name: createForm.name.trim(),
        label: createForm.label.trim() || createForm.name.trim(),
        type: createForm.type,
        description: createForm.description.trim() || undefined,
        icon: createForm.icon || '💻',
        isActive: createForm.isActive,
      });

      setSuccessMessage(`Filter "${newFilter.name}" created successfully! It is now live in marketplace filters.`);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        label: '',
        type: 'CATEGORY',
        description: '',
        icon: '💻',
        isActive: true,
      });
      loadFilters();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create gig filter');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (filter: IGigFilter) => {
    setEditingFilter(filter);
    setEditForm({
      name: filter.name,
      label: filter.label || filter.name,
      type: filter.type,
      description: filter.description || '',
      icon: filter.icon || '💻',
      isActive: filter.isActive,
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilter) return;
    if (!editForm.name.trim()) {
      setErrorMessage('Filter name is required');
      return;
    }

    setIsSubmittingEdit(true);
    setErrorMessage(null);
    try {
      await updateGigFilter(editingFilter.id, {
        name: editForm.name.trim(),
        label: editForm.label.trim() || editForm.name.trim(),
        type: editForm.type,
        description: editForm.description.trim() || undefined,
        icon: editForm.icon || '💻',
        isActive: editForm.isActive,
      });

      setSuccessMessage(`Filter "${editForm.name}" updated successfully!`);
      setEditingFilter(null);
      loadFilters();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update gig filter');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleStatus = async (filter: IGigFilter) => {
    try {
      const updatedStatus = !filter.isActive;
      await updateGigFilter(filter.id, { isActive: updatedStatus });
      setSuccessMessage(`Filter "${filter.name}" is now ${updatedStatus ? 'ACTIVE' : 'INACTIVE'}.`);
      loadFilters();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to toggle filter status');
    }
  };

  // Handle Delete Filter
  const handleDeleteSubmit = async () => {
    if (!deletingFilter) return;

    setIsSubmittingDelete(true);
    setErrorMessage(null);
    try {
      await deleteGigFilter(deletingFilter.id);
      setSuccessMessage(`Filter "${deletingFilter.name}" deleted successfully.`);
      setDeletingFilter(null);
      loadFilters();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete gig filter');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Security Access Guard: Only SUPER_ADMIN can view and manage
  if (currentAuthUser && currentAuthUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Super Admin Access Only
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Only verified <strong>Super Administrators</strong> have authorization to create, configure, and manage marketplace gig filters and categories.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter metrics
  const totalCount = filters.length;
  const activeCount = filters.filter((f) => f.isActive).length;
  const categoryCount = filters.filter((f) => f.type === 'CATEGORY').length;
  const tagCount = filters.filter((f) => f.type === 'TAG').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Super Admin Control Panel</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gig Filters &amp; Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create and manage marketplace search filters, categories, and tags. Changes update the marketplace in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Filter</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Filters</p>
            <p className="text-xl font-black text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Filters</p>
            <p className="text-xl font-black text-slate-900">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
            <p className="text-xl font-black text-slate-900">{categoryCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Skill Tags</p>
            <p className="text-xl font-black text-slate-900">{tagCount}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar: Search & Filtering */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search filters by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="CATEGORY">Category</option>
            <option value="TAG">Tag / Skill</option>
            <option value="FEATURED">Featured</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadFilters}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Reload Filters"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-sm">All Platform Filters</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              {filters.length} filters
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Page 1 of 1
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Loading Gig Filters...
            </p>
          </div>
        ) : filters.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
              <SlidersHorizontal className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">No Gig Filters Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No filters match your current search criteria. Try resetting filters.'
                  : 'Start by creating your first marketplace gig category or filter using the button above.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Filter</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">FILTER NAME & ICON</th>
                  <th className="py-3.5 px-4">TYPE</th>
                  <th className="py-3.5 px-4">DESCRIPTION</th>
                  <th className="py-3.5 px-4 text-center">LIVE GIGS</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filters.map((filter) => (
                  <tr
                    key={filter.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Name & Icon */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                          {filter.icon || '💻'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs block group-hover:text-purple-700 transition-colors">
                            {filter.name}
                          </p>
                          {filter.label && filter.label !== filter.name && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              Display: {filter.label}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${filter.type === 'CATEGORY'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : filter.type === 'TAG'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          }`}
                      >
                        {filter.type === 'CATEGORY' ? (
                          <Layers className="w-3 h-3" />
                        ) : filter.type === 'TAG' ? (
                          <Tag className="w-3 h-3" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{filter.type}</span>
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 max-w-xs truncate text-slate-500 text-[11px]">
                      {filter.description || '—'}
                    </td>

                    {/* Live Gigs Count */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${(filter.gigCount || 0) > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                          }`}
                      >
                        {filter.gigCount ?? 0}
                      </span>
                    </td>

                    {/* Active Toggle Switch */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(filter)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${filter.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${filter.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                        />
                        <span>{filter.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-5 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        {/* View in marketplace link */}
                        <Link
                          href={`/gigs?${filter.type === 'TAG' ? 'tag' : 'category'}=${encodeURIComponent(filter.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                          title="View Live Gigs with this Filter"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(filter)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                          title="Edit Filter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingFilter(filter)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                          title="Delete Filter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE FILTER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Create New Gig Filter
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Accessible to Super Admins only
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              {/* Filter Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Filter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Development, Cyber Security"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Filter Type */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, type: 'CATEGORY' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${createForm.type === 'CATEGORY'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Layers className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span className="text-[11px] block">Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, type: 'TAG' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${createForm.type === 'TAG'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Tag className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span className="text-[11px] block">Skill Tag</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, type: 'FEATURED' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${createForm.type === 'FEATURED'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                  <span className="text-[11px] block">Featured</span>
                </button>
              </div>

              {/* Icon / Emoji Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Badge Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((item) => (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() =>
                        setCreateForm({ ...createForm, icon: item.emoji })
                      }
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base transition-all cursor-pointer ${createForm.icon === item.emoji
                          ? 'border-emerald-500 bg-emerald-100 scale-110 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      title={item.name}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description for providers and clients..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Live Status in Marketplace
                  </p>
                  <p className="text-[10px] text-slate-500">
                    When active, clients and providers can immediately filter by this.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCreate && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Create Filter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FILTER MODAL */}
      {editingFilter && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Edit Gig Filter
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Updating: {editingFilter.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingFilter(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Filter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>

              {/* Type */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, type: 'CATEGORY' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${editForm.type === 'CATEGORY'
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Layers className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <span className="text-[11px] block">Category</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, type: 'TAG' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${editForm.type === 'TAG'
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Tag className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                  <span className="text-[11px] block">Skill Tag</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, type: 'FEATURED' })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${editForm.type === 'FEATURED'
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                  <span className="text-[11px] block">Featured</span>
                </button>
              </div>

              {/* Emoji selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Badge Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((item) => (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, icon: item.emoji })
                      }
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center text-base transition-all cursor-pointer ${editForm.icon === item.emoji
                          ? 'border-blue-500 bg-blue-100 scale-110 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Live Status in Marketplace
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Toggle to make this filter visible or hidden across the platform.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFilter(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingFilter && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Filter &ldquo;{deletingFilter.name}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure? This will remove the filter from the marketplace categories and search bar.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingFilter(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isSubmittingDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingDelete && (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Delete Filter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
