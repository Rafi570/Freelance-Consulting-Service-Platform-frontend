'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  UserCheck,
  UserX,
  Clock,
  Mail,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  IUser,
  getAllUsers,
  blockUser,
  unblockUser,
  updateUserStatus,
  IGetUsersParams
} from '@/lib/api';

export default function UsersManagementTable() {
  const { user: currentAuthUser } = useAuth();

  const [users, setUsers] = useState<IUser[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Block modal state
  const [blockModalUser, setBlockModalUser] = useState<IUser | null>(null);
  const [blockReason, setBlockReason] = useState<string>('Violation of community guidelines');
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Status update dropdown
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!currentAuthUser || currentAuthUser.role !== 'SUPER_ADMIN') {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params: IGetUsersParams = {
        page,
        limit,
        searchTerm: searchTerm.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      };

      const res = await getAllUsers(params);
      setUsers(res.data || []);
      setTotalCount(res.meta?.total || (res.data ? res.data.length : 0));
      setTotalPages(res.meta?.totalPage || 1);
    } catch (err: any) {
      setUsers([]);
      setTotalCount(0);
      setTotalPages(1);
      setErrorMessage(err.message || 'Failed to fetch platform users from backend.');
    } finally {
      setIsLoading(false);
    }
  }, [currentAuthUser, page, limit, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    if (currentAuthUser?.role === 'SUPER_ADMIN') {
      fetchUsers();
    }
  }, [fetchUsers, currentAuthUser]);

  // Handle Unblock (Strict Live API call)
  const handleUnblock = async (userToUnblock: IUser) => {
    if (!currentAuthUser || currentAuthUser.role !== 'SUPER_ADMIN') {
      setErrorMessage('Unauthorized: Only Super Admins can unblock accounts.');
      return;
    }

    setIsSubmittingAction(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await unblockUser(userToUnblock.id);

      // Update state upon confirmed server success
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToUnblock.id
            ? { ...u, status: 'ACTIVE', blockReason: null, blockedAt: null }
            : u
        )
      );

      setSuccessMessage(`User "${userToUnblock.name}" has been unblocked and activated successfully!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to unblock user on server.');
    } finally {
      setIsSubmittingAction(false);
      setActionMenuUserId(null);
    }
  };

  // Handle Block Confirm (Strict Live API call)
  const handleConfirmBlock = async () => {
    if (!blockModalUser) return;
    if (!currentAuthUser || currentAuthUser.role !== 'SUPER_ADMIN') {
      setErrorMessage('Unauthorized: Only Super Admins can block accounts.');
      return;
    }

    setIsSubmittingAction(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await blockUser(blockModalUser.id, blockReason);

      // Update state upon confirmed server success
      setUsers((prev) =>
        prev.map((u) =>
          u.id === blockModalUser.id
            ? {
                ...u,
                status: 'BLOCKED',
                blockReason: blockReason,
                blockedAt: new Date().toISOString(),
              }
            : u
        )
      );

      setSuccessMessage(`User "${blockModalUser.name}" has been blocked successfully.`);
      setBlockModalUser(null);
      setBlockReason('Violation of community guidelines');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to block user on server.');
    } finally {
      setIsSubmittingAction(false);
      setActionMenuUserId(null);
    }
  };

  // Handle Change Status directly (Strict Live API call)
  const handleChangeStatus = async (
    targetUser: IUser,
    newStatus: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DRAFT'
  ) => {
    if (newStatus === 'BLOCKED') {
      setBlockModalUser(targetUser);
      return;
    }

    if (!currentAuthUser || currentAuthUser.role !== 'SUPER_ADMIN') {
      setErrorMessage('Unauthorized: Only Super Admins can change user statuses.');
      return;
    }

    setIsSubmittingAction(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateUserStatus(targetUser.id, newStatus);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                status: newStatus,
                blockReason: newStatus === 'ACTIVE' ? null : u.blockReason,
              }
            : u
        )
      );

      setSuccessMessage(`User status changed to ${newStatus}.`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update user status on server.');
    } finally {
      setIsSubmittingAction(false);
      setActionMenuUserId(null);
    }
  };

  // Immediate Security Access Guard for Non-Super Admin
  if (!currentAuthUser || currentAuthUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)] max-w-lg mx-auto text-center space-y-5 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            403 Forbidden
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Super Admin Access Required
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            User management, account blocking, unblocking, and status controls are restricted strictly to Super Administrators.
            {currentAuthUser ? (
              <span className="block mt-2 font-medium text-slate-700">
                You are currently signed in as <strong>{currentAuthUser.name}</strong> ({currentAuthUser.role}).
              </span>
            ) : (
              <span className="block mt-2 font-medium text-slate-700">
                You are currently not signed in.
              </span>
            )}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md text-center"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors text-center"
          >
            Home Page
          </Link>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case 'PROVIDER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            Provider
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <Users className="w-3 h-3 text-blue-600" />
            Client
          </span>
        );
    }
  };

  const getStatusBadge = (status: string, reason?: string | null) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case 'BLOCKED':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs">
              <Ban className="w-3 h-3 text-rose-500" />
              Blocked
            </span>
            {reason && (
              <span className="text-[10px] text-rose-400 font-medium max-w-[170px] truncate" title={reason}>
                Reason: {reason}
              </span>
            )}
          </div>
        );
      case 'SUSPENDED':
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Suspended
            </span>
            {reason && (
              <span className="text-[10px] text-amber-500 font-medium max-w-[170px] truncate" title={reason}>
                {reason}
              </span>
            )}
          </div>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
            <Clock className="w-3 h-3 text-slate-400" />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              User Management &amp; Access Control
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Admin privilege: Inspect, filter, activate, block, or unblock marketplace participants.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/10 focus:border-purple-500 transition-all font-medium"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/10"
            >
              <option value="ALL">All Roles (All)</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="PROVIDER">Provider</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600/10"
            >
              <option value="ALL">All Statuses (All)</option>
              <option value="ACTIVE">Active Only</option>
              <option value="BLOCKED">Blocked Only</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Showcase Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-sm">All Platform Users</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              {totalCount} users
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">USER PROFILE</th>
                <th className="py-3.5 px-4">ROLE</th>
                <th className="py-3.5 px-4">ACCOUNT STATUS</th>
                <th className="py-3.5 px-4">JOINED DATE</th>
                <th className="py-3.5 px-5 text-right">ADMIN ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
                    <span>Loading platform users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <UserX className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No users found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isBlocked = u.status === 'BLOCKED';
                  const isSuspended = u.status === 'SUSPENDED';
                  const isSuperAdmin = u.role === 'SUPER_ADMIN';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* User Profile */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {u.name
                              ? u.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()
                              : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs block group-hover:text-purple-700 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">{getRoleBadge(u.role)}</td>

                      {/* Status */}
                      <td className="py-4 px-4">{getStatusBadge(u.status, u.blockReason)}</td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-slate-500 font-medium text-[11px]">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recent'}
                      </td>

                      {/* Actions: Block / Unblock */}
                      <td className="py-4 px-5 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin ? (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              Protected Admin
                            </span>
                          ) : isBlocked || isSuspended ? (
                            /* Unblock Button */
                            <button
                              type="button"
                              onClick={() => handleUnblock(u)}
                              disabled={isSubmittingAction}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Unblock</span>
                            </button>
                          ) : (
                            /* Block Button */
                            <button
                              type="button"
                              onClick={() => setBlockModalUser(u)}
                              disabled={isSubmittingAction}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5 text-rose-600" />
                              <span>Block</span>
                            </button>
                          )}

                          {/* More dropdown options */}
                          {!isSuperAdmin && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActionMenuUserId(
                                    actionMenuUserId === u.id ? null : u.id
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {actionMenuUserId === u.id && (
                                <div
                                  onMouseLeave={() => setActionMenuUserId(null)}
                                  className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 text-left text-xs animate-in fade-in zoom-in-95"
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(u, 'ACTIVE')}
                                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Set as Active</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(u, 'SUSPENDED')}
                                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-amber-50 hover:text-amber-700 font-medium flex items-center gap-2"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Suspend Access</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleChangeStatus(u, 'DRAFT')}
                                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Move to Draft</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {users.length} of {totalCount} total users
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700 px-1">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {blockModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Block User Account
                  </h3>
                  <p className="text-xs text-slate-400">
                    Restricting platform privileges for this account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlockModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
                <p className="text-xs font-bold text-slate-800">{blockModalUser.name}</p>
                <p className="text-[11px] text-slate-400">{blockModalUser.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Role:</span>
                  {getRoleBadge(blockModalUser.role)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Reason for Blocking (Optional):
                </label>
                <textarea
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter specific reason (e.g. Terms violation, spamming, non-delivery of services)..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 font-medium"
                />
              </div>

              <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 text-[11px] text-rose-700 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>
                  Once blocked, this user cannot create gigs, place orders, or login until an administrator unblocks them.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBlockModalUser(null)}
                disabled={isSubmittingAction}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                disabled={isSubmittingAction}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isSubmittingAction ? 'Processing...' : 'Confirm Block'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
