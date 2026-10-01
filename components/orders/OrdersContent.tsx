'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getMyOrders,
  cancelOrder,
  getCancellationReasons,
  submitOrderReview,
  IOrder,
  ICancellationReason,
  updateOrderStatus,
} from '@/lib/api';
import {
  ChevronLeft,
  ShoppingBag,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Star,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Calendar,
  Layers,
  ArrowRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronRight,
  Copy,
  Check,
  User as UserIcon,
  DollarSign,
  TrendingUp,
  Table,
} from 'lucide-react';

type TabStatus = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type SortOption = 'NEWEST' | 'OLDEST' | 'PRICE_HIGH' | 'PRICE_LOW';

export default function OrdersContent({ isDashboard = false }: { isDashboard?: boolean }) {
  const router = useRouter();
  const { user, isHydrated, openAuthModal } = useAuth();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>(isDashboard ? 'table' : 'grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<IOrder | null>(null);
  const [cancellationReasons, setCancellationReasons] = useState<ICancellationReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>('ORDERED_BY_MISTAKE');
  const [cancellationNote, setCancellationNote] = useState<string>('');
  const [cancelSubmitting, setCancelSubmitting] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Details Modal State
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<IOrder | null>(null);

  // Review Modal State
  const [reviewModalOrder, setReviewModalOrder] = useState<IOrder | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const [updateStatusLoading, setUpdateStatusLoading] = useState<string | null>(null);

  const handleMarkCompleted = async (orderId: string) => {
    try {
      setUpdateStatusLoading(orderId);
      const updated = await updateOrderStatus(orderId, { status: 'COMPLETED' });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdateStatusLoading(null);
    }
  };

  // Fetch orders from API
  const fetchOrders = async (isManualRefresh = false) => {
    if (!user) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const fetched = await getMyOrders();
      setOrders(fetched);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isHydrated && user) {
      fetchOrders();
    } else if (isHydrated && !user) {
      setLoading(false);
    }
  }, [isHydrated, user]);

  // Load cancellation reasons once
  useEffect(() => {
    async function loadReasons() {
      try {
        const reasons = await getCancellationReasons();
        if (reasons && reasons.length > 0) {
          setCancellationReasons(reasons);
          setSelectedReason(reasons[0].code);
        }
      } catch (err) {
        console.error('Error loading cancellation reasons:', err);
      }
    }
    loadReasons();
  }, []);

  // Reset page when tab, search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

  // Format date like: "Aug 9, 2026 • 01:19 PM"
  const formatOrderDate = (isoString?: string): string => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Recent';

      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return `${formattedDate} • ${formattedTime}`;
    } catch {
      return 'Recent';
    }
  };

  // Copy order ID helper
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Tab counts & Summary Stats
  const counts = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((o) => o.status === 'PENDING').length,
      IN_PROGRESS: orders.filter((o) => o.status === 'IN_PROGRESS').length,
      COMPLETED: orders.filter((o) => o.status === 'COMPLETED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [orders]);

  const stats = useMemo(() => {
    const totalSpent = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.price || 0), 0);
    return {
      totalSpent,
      totalOrders: orders.length,
      completedOrders: counts.COMPLETED,
      activeOrders: counts.IN_PROGRESS + counts.PENDING,
    };
  }, [orders, counts]);

  // Filtered & Sorted orders list
  const filteredAndSortedOrders = useMemo(() => {
    const result = orders.filter((order) => {
      // Tab filter
      if (activeTab === 'PENDING' && order.status !== 'PENDING') return false;
      if (activeTab === 'IN_PROGRESS' && order.status !== 'IN_PROGRESS') return false;
      if (activeTab === 'COMPLETED' && order.status !== 'COMPLETED') return false;
      if (activeTab === 'CANCELLED' && order.status !== 'CANCELLED') return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const shortId = order.id.slice(0, 8).toLowerCase();
        const fullId = order.id.toLowerCase();
        const gigTitle = order.gig?.title?.toLowerCase() || '';
        const pkgName = order.package?.name?.toLowerCase() || '';
        const category = order.gig?.category?.toLowerCase() || '';
        const providerName = order.gig?.provider?.name?.toLowerCase() || '';
        return (
          shortId.includes(query) ||
          fullId.includes(query) ||
          gigTitle.includes(query) ||
          pkgName.includes(query) ||
          category.includes(query) ||
          providerName.includes(query)
        );
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'PRICE_HIGH') {
        return (b.price || 0) - (a.price || 0);
      }
      if (sortBy === 'PRICE_LOW') {
        return (a.price || 0) - (b.price || 0);
      }
      return 0;
    });

    return result;
  }, [orders, activeTab, searchQuery, sortBy]);

  // Paginated orders
  const totalPages = Math.ceil(filteredAndSortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedOrders.slice(start, start + pageSize);
  }, [filteredAndSortedOrders, currentPage, pageSize]);

  // Handle Cancel Submit
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    setCancelSubmitting(true);
    setCancelError(null);

    try {
      const updated = await cancelOrder(cancelModalOrder.id, {
        cancellationReason: selectedReason,
        cancellationNote: cancellationNote.trim() || undefined,
      });

      // Update in state
      setOrders((prev) =>
        prev.map((o) => (o.id === cancelModalOrder.id ? { ...o, ...updated, status: 'CANCELLED' } : o))
      );
      setCancelModalOrder(null);
      setCancellationNote('');
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel the order.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Handle Review Submit
  const handleConfirmReview = async () => {
    if (!reviewModalOrder) return;
    if (!reviewComment.trim()) {
      setReviewError('Please share your thoughts in the comment.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const result = await submitOrderReview(reviewModalOrder.id, reviewRating, reviewComment.trim());
      // Update in state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === reviewModalOrder.id
            ? { ...o, review: result }
            : o
        )
      );
      setReviewSuccess('Thank you! Your review has been submitted.');
      setTimeout(() => {
        setReviewModalOrder(null);
        setReviewComment('');
        setReviewSuccess(null);
      }, 1500);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Badge stylings
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#e8f5fd] text-[#0284c7] border border-sky-200">
            Processing
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#fff7ed] text-[#ea580c] border border-orange-200">
            Pending
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#ecfdf5] text-[#16a34a] border border-emerald-200">
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#fff1f2] text-[#e11d48] border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Not authenticated view
  if (isHydrated && !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-[#fafafa]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#1dbf73] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Sign in to view My Orders</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your service purchases, consulting progress, and live order status.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-6 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isDashboard ? "space-y-6 pb-6" : "min-h-screen bg-[#f8f9fa] pb-20 pt-6 sm:pt-8"}>
      {/* Container adapts gracefully to full desktop width (max-w-7xl) */}
      <div className={isDashboard ? "w-full space-y-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"}>

        {/* 1. Header Bar with Back Button, Page Title & Client Stat Strip */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer shadow-2xs flex-shrink-0"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5 -ml-0.5" />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#222325] tracking-tight">
                    {user?.role === 'SUPER_ADMIN' ? 'Manage All Orders' : 'My Orders'}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#1dbf73] border border-emerald-200">
                    {user?.role === 'SUPER_ADMIN' ? 'Admin Portal' : user?.role === 'PROVIDER' ? 'Provider Portal' : 'Client Portal'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {user?.role === 'SUPER_ADMIN' ? 'Oversee all marketplace transactions, deliverables, and communications.' : user?.role === 'PROVIDER' ? 'Manage your client requests, track deliverables, and communicate.' : 'Manage, track deliverables, communicate with consultants and reorder services.'}
                </p>
              </div>
            </div>

            {/* Quick Action Refresh */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-[#1dbf73] transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#1dbf73]' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Refresh Orders'}</span>
              </button>

              <Link
                href="/gigs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs sm:text-sm font-bold transition shadow-xs"
              >
                <span>Browse Gigs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Smart Client Metrics Dashboard Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-5">
            {/* Metric 1: Total Orders */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 truncate block">
                  {stats.totalOrders}
                </span>
              </div>
            </div>

            {/* Metric 2: Completed Orders */}
            <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Completed
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-950 truncate block">
                  {stats.completedOrders}
                </span>
              </div>
            </div>

            {/* Metric 3: Active Orders */}
            <div className="bg-sky-50/50 border border-sky-200/70 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                  In Progress / Pending
                </span>
                <span className="text-lg sm:text-xl font-black text-sky-950 truncate block">
                  {stats.activeOrders}
                </span>
              </div>
            </div>

            {/* Metric 4: Total Spent / Invested */}
            <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#222325] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <CreditCard className="w-5 h-5 text-[#1dbf73]" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Total Spent
                </span>
                <span className="text-lg sm:text-xl font-black text-[#1dbf73] truncate block">
                  ${stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Smart Toolbar: Tabs (Left), Search, Sorting & View Toggle (Right) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* Status Filter Tabs (Pill style matching user design) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {/* Tab: All */}
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'ALL'
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>All</span>
                {counts.ALL > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === 'ALL'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {counts.ALL}
                  </span>
                )}
              </button>

              {/* Tab: Pending */}
              <button
                type="button"
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'PENDING'
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>Pending</span>
                {counts.PENDING > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === 'PENDING'
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {counts.PENDING}
                  </span>
                )}
              </button>

              {/* Tab: Processing (IN_PROGRESS) */}
              <button
                type="button"
                onClick={() => setActiveTab('IN_PROGRESS')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'IN_PROGRESS'
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>Processing</span>
                {counts.IN_PROGRESS > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === 'IN_PROGRESS'
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {counts.IN_PROGRESS}
                  </span>
                )}
              </button>

              {/* Tab: Completed */}
              <button
                type="button"
                onClick={() => setActiveTab('COMPLETED')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'COMPLETED'
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>Completed</span>
                {counts.COMPLETED > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === 'COMPLETED'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {counts.COMPLETED}
                  </span>
                )}
              </button>

              {/* Tab: Cancelled */}
              {counts.CANCELLED > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('CANCELLED')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'CANCELLED'
                      ? 'bg-[#18181b] text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>Cancelled</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === 'CANCELLED'
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {counts.CANCELLED}
                  </span>
                </button>
              )}
            </div>

            {/* Right Tools: Live Search, Sorting & View Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, gigs, consultant..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73] transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                </select>
              </div>

              {/* View Switcher: Grid vs List (Desktop) */}
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold">Unable to load orders</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchOrders(false)}
              className="px-3 py-1 bg-white border border-red-300 rounded-lg text-xs font-bold text-red-700 hover:bg-red-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4. Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="h-4 w-28 bg-slate-200 rounded-md" />
                  <div className="h-3 w-24 bg-slate-100 rounded-md" />
                </div>
                <div className="flex gap-3.5 items-start">
                  <div className="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-4/5 bg-slate-200 rounded-md" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded-md" />
                    <div className="h-4 w-20 bg-slate-200 rounded-md mt-2" />
                  </div>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <div className="flex-1 h-9 bg-slate-100 rounded-xl" />
                  <div className="flex-1 h-9 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Empty State */}
        {!loading && !error && filteredAndSortedOrders.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">
                {searchQuery
                  ? 'No matching orders found'
                  : activeTab === 'ALL'
                  ? 'No orders placed yet'
                  : `No ${activeTab.toLowerCase().replace('_', ' ')} orders`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching with a different order ID, gig title, or keyword.'
                  : 'Browse top rated gigs and consulting services on ConsulSphere to get started.'}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/gigs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs sm:text-sm font-bold transition shadow-xs"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 6. Orders Rendering */}
        {!loading && !error && paginatedOrders.length > 0 && (
          <>
            {/* View Mode: GRID VIEW (Default for large screens) */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedOrders.map((order) => {
                  const shortId = order.id.slice(0, 8).toUpperCase();
                  const gigImage =
                    order.gig?.images && order.gig.images.length > 0
                      ? order.gig.images[0]
                      : null;

                  const isCancelled = order.status === 'CANCELLED';
                  const isCompleted = order.status === 'COMPLETED';
                  const isProcessing = order.status === 'IN_PROGRESS';
                  const isPending = order.status === 'PENDING';

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-300"
                    >
                      {/* Top Header Row: Order ID & Date */}
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-[#222325] tracking-tight">
                              Order #{shortId}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyId(order.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                              title="Copy full Order ID"
                            >
                              {copiedId === order.id ? (
                                <Check className="w-3 h-3 text-[#1dbf73]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {formatOrderDate(order.createdAt)}
                          </span>
                        </div>

                        {/* Body Row: Image & Content */}
                        <div className="flex items-start gap-3.5">
                          {/* Thumbnail Image */}
                          <Link
                            href={`/gigs/${order.gig?.id || ''}`}
                            className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative group block"
                          >
                            {gigImage ? (
                              <Image
                                src={gigImage}
                                alt={order.gig?.title || 'Service Thumbnail'}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-[#1dbf73]">
                                <ShoppingBag className="w-7 h-7" />
                              </div>
                            )}
                          </Link>

                          {/* Content Details */}
                          <div className="flex-1 min-w-0">
                            {/* Title & Status Badge */}
                            <div className="flex items-start justify-between gap-1.5 mb-1">
                              <Link
                                href={`/gigs/${order.gig?.id || ''}`}
                                className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 hover:text-[#1dbf73] transition-colors leading-snug"
                                title={order.gig?.title}
                              >
                                {order.gig?.title || 'Consulting Service Order'}
                              </Link>
                            </div>

                            {/* Package Name / Category Subtitle */}
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 font-medium mb-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                {order.package?.name || 'Standard'}
                              </span>
                              {(user?.role === 'PROVIDER' || user?.role === 'SUPER_ADMIN') && order.client?.name ? (
                                <span className="text-emerald-600 truncate max-w-[120px] font-semibold">
                                  • Client: {order.client.name}
                                </span>
                              ) : order.gig?.category ? (
                                <span className="text-slate-400 truncate max-w-[120px]">
                                  • {order.gig.category}
                                </span>
                              ) : null}
                            </div>

                            {/* Status badge inline for grid */}
                            <div className="mb-2">
                              {renderStatusBadge(order.status)}
                            </div>

                            {/* Price & Qty */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100/70">
                              <div className="font-black text-sm sm:text-base text-slate-900">
                                ${order.price?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-xs text-slate-400 font-medium">
                                Qty: 1
                              </div>
                            </div>

                            {/* Payment Status & Total */}
                            <div className="flex items-center justify-between mt-1 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                                <span className={`w-2 h-2 rounded-full inline-block ${order.paymentStatus === 'REFUNDED' ? 'bg-amber-500' : 'bg-[#1dbf73]'}`} />
                                <span className={`truncate max-w-[100px] ${order.paymentStatus === 'REFUNDED' ? 'text-amber-600 font-bold' : ''}`}>
                                  {order.paymentStatus === 'REFUNDED'
                                    ? 'Refunded'
                                    : order.payment?.paymentGateway
                                    ? `${order.payment.paymentGateway}`
                                    : order.paymentStatus === 'PAID'
                                    ? 'Paid Escrow'
                                    : 'Secured'}
                                </span>
                              </div>
                              <div className="text-xs font-medium text-slate-600">
                                Total:{' '}
                                <span className="font-black text-[#f97316] text-sm">
                                  ${order.price?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2.5">
                          {/* Left Button */}
                          {isCancelled ? (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(order)}
                              className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer text-center"
                            >
                              Cancelled Info
                            </button>
                          ) : isCompleted ? (
                            order.review ? (
                              <div className="flex-1 py-2 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Rated {order.review.rating} ★</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewModalOrder(order);
                                  setReviewRating(5);
                                  setReviewComment('');
                                  setReviewError(null);
                                }}
                                className="flex-1 py-2 px-3 rounded-xl border border-[#1dbf73] text-[#1dbf73] hover:bg-emerald-50 text-xs font-bold transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                              >
                                <Star className="w-3.5 h-3.5 fill-[#1dbf73]" />
                                <span>Leave Review</span>
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelError(null);
                              }}
                              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer text-center"
                            >
                              Cancel/Refund
                            </button>
                          )}

                          {/* Right Button: Action based on Role */}
                          {user?.role === 'CLIENT' ? (
                            <Link
                              href={`/gigs/${order.gig?.id || ''}`}
                              className="flex-1 py-2 px-3 rounded-xl bg-[#222325] hover:bg-[#1dbf73] text-white text-xs font-bold transition-all duration-200 cursor-pointer text-center shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <span>Buy again</span>
                            </Link>
                          ) : (user?.role === 'PROVIDER' || user?.role === 'SUPER_ADMIN') && order.status === 'IN_PROGRESS' ? (
                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(order.id)}
                              disabled={updateStatusLoading === order.id}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold transition-all duration-200 cursor-pointer text-center shadow-xs flex items-center justify-center gap-1.5"
                            >
                              {updateStatusLoading === order.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              <span>Mark Completed</span>
                            </button>
                          ) : null}
                        </div>

                        {/* Specs trigger */}
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(order)}
                            className="text-[11px] text-slate-400 hover:text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer transition"
                          >
                            <span>View specifications &amp; notes</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : viewMode === 'list' ? (
              /* View Mode: LIST VIEW (Horizontal Rows across the width) */
              <div className="space-y-3.5">
                {paginatedOrders.map((order) => {
                  const shortId = order.id.slice(0, 8).toUpperCase();
                  const gigImage =
                    order.gig?.images && order.gig.images.length > 0
                      ? order.gig.images[0]
                      : null;

                  const isCancelled = order.status === 'CANCELLED';
                  const isCompleted = order.status === 'COMPLETED';

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Gig Details */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <Link
                          href={`/gigs/${order.gig?.id || ''}`}
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 relative group block"
                        >
                          {gigImage ? (
                            <Image
                              src={gigImage}
                              alt={order.gig?.title || 'Service Thumbnail'}
                              fill
                              sizes="90px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-[#1dbf73]">
                              <ShoppingBag className="w-7 h-7" />
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-800 tracking-tight">
                              Order #{shortId}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-400">
                              {formatOrderDate(order.createdAt)}
                            </span>
                            <span className="text-slate-300">•</span>
                            {renderStatusBadge(order.status)}
                          </div>

                          <Link
                            href={`/gigs/${order.gig?.id || ''}`}
                            className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1 hover:text-[#1dbf73] transition-colors block"
                          >
                            {order.gig?.title || 'Consulting Service Order'}
                          </Link>

                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="font-semibold text-slate-700">
                              Tier: {order.package?.name || 'Standard'}
                            </span>
                            {order.gig?.category && (
                              <span>Category: {order.gig.category}</span>
                            )}
                            {(user?.role === 'PROVIDER' || user?.role === 'SUPER_ADMIN') ? (
                              order.client && (
                                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                                  <UserIcon className="w-3 h-3" />
                                  Client: {order.client.name}
                                </span>
                              )
                            ) : (
                              order.gig?.provider && (
                                <span className="text-slate-600 flex items-center gap-1">
                                  <UserIcon className="w-3 h-3 text-slate-400" />
                                  {order.gig.provider.name}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Pricing breakdown */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <div className="text-xs text-slate-400 font-medium">
                            Unit Price: ${order.price?.toFixed(2)} (Qty: 1)
                          </div>
                          <div className="text-sm font-medium text-slate-600">
                            Total:{' '}
                            <span className="font-black text-[#f97316] text-base sm:text-lg">
                              ${order.price?.toFixed(2)}
                            </span>
                          </div>
                          <div className={`text-[11px] font-semibold flex items-center lg:justify-end gap-1 ${order.paymentStatus === 'REFUNDED' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'REFUNDED' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span>{order.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Escrow Protected'}</span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                          {isCompleted && !order.review && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewModalOrder(order);
                                setReviewRating(5);
                                setReviewComment('');
                                setReviewError(null);
                              }}
                              className="py-2 px-3 rounded-xl border border-[#1dbf73] text-[#1dbf73] hover:bg-emerald-50 text-xs font-bold transition cursor-pointer"
                            >
                              Review
                            </button>
                          )}

                          {!isCancelled && !isCompleted && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelError(null);
                              }}
                              className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}

                          {user?.role === 'CLIENT' ? (
                            <Link
                              href={`/gigs/${order.gig?.id || ''}`}
                              className="py-2 px-4 rounded-xl bg-[#222325] hover:bg-[#1dbf73] text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs"
                            >
                              Buy again
                            </Link>
                          ) : (user?.role === 'PROVIDER' || user?.role === 'SUPER_ADMIN') && order.status === 'IN_PROGRESS' ? (
                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(order.id)}
                              disabled={updateStatusLoading === order.id}
                              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                              {updateStatusLoading === order.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              <span>Mark Completed</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                            title="View details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View Mode: TABLE VIEW */
              <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 text-sm">All Orders</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {filteredAndSortedOrders.length} orders
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-5">ORDER ID / SERVICE</th>
                        <th className="py-3.5 px-4">ROLE INFO</th>
                        <th className="py-3.5 px-4">PRICE & PAYMENT</th>
                        <th className="py-3.5 px-4">STATUS</th>
                        <th className="py-3.5 px-4">DATE</th>
                        <th className="py-3.5 px-5 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedOrders.map((order) => {
                        const shortId = order.id.slice(0, 8).toUpperCase();
                        const isCancelled = order.status === 'CANCELLED';
                        const isCompleted = order.status === 'COMPLETED';
                        
                        const gigImage =
                          order.gig?.images && order.gig.images.length > 0
                            ? order.gig.images[0]
                            : null;
                        
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group">
                            {/* Order ID & Service */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                {gigImage ? (
                                  <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 relative shadow-xs">
                                    <Image src={gigImage} alt="Gig" fill className="object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                                    <ShoppingBag className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <Link
                                    href={`/gigs/${order.gig?.id || ''}`}
                                    className="font-bold text-slate-800 text-xs block group-hover:text-[#1dbf73] transition-colors"
                                  >
                                    {order.gig?.title || 'Consulting Service Order'}
                                  </Link>
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono uppercase">
                                    #{shortId}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Role Info */}
                            <td className="py-4 px-4 text-[11px] text-slate-500 font-medium">
                              {user?.role === 'PROVIDER' || user?.role === 'SUPER_ADMIN' ? (
                                <div className="flex items-center gap-1.5">
                                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-slate-700">Client: <span className="font-bold">{order.client?.name || 'Unknown'}</span></span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-slate-700">Provider: <span className="font-bold">{order.gig?.provider?.name || 'Unknown'}</span></span>
                                </div>
                              )}
                            </td>

                            {/* Price & Payment */}
                            <td className="py-4 px-4">
                              <div className="font-black text-[#f97316] text-sm">${order.price?.toFixed(2)}</div>
                              <div className={`text-[10px] font-semibold mt-0.5 flex items-center gap-1 ${order.paymentStatus === 'REFUNDED' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === 'REFUNDED' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                {order.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Escrow Protected'}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4">
                              {renderStatusBadge(order.status)}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-slate-500 font-medium text-[11px]">
                              {formatOrderDate(order.createdAt)}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right relative">
                              <div className="flex items-center justify-end gap-2">
                                {isCompleted && !order.review && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewModalOrder(order);
                                      setReviewRating(5);
                                      setReviewComment('');
                                      setReviewError(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                  >
                                    Review
                                  </button>
                                )}

                                {!isCancelled && !isCompleted && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCancelModalOrder(order);
                                      setCancelError(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}

                                {user?.role === 'CLIENT' ? (
                                  <Link
                                    href={`/gigs/${order.gig?.id || ''}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#222325] hover:bg-[#1dbf73] text-white rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                  >
                                    Buy again
                                  </Link>
                                ) : (user?.role === 'PROVIDER' || user?.role === 'SUPER_ADMIN') && order.status === 'IN_PROGRESS' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkCompleted(order.id)}
                                    disabled={updateStatusLoading === order.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white border border-emerald-600 rounded-xl font-bold text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                                  >
                                    {updateStatusLoading === order.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    <span>Mark Completed</span>
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderDetails(order)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                                  title="View details"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. Smart Pagination Bar */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-xs text-slate-500 font-medium">
                  Showing{' '}
                  <span className="font-bold text-slate-800">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-bold text-slate-800">
                    {Math.min(currentPage * pageSize, filteredAndSortedOrders.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-bold text-slate-800">
                    {filteredAndSortedOrders.length}
                  </span>{' '}
                  orders
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNumber = Math.min(currentPage - 2 + i, totalPages - (4 - i));
                      }
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                            currentPage === pageNumber
                              ? 'bg-[#18181b] text-white shadow-xs'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* ============================================================== */}
      {/* 8. CANCEL / REFUND MODAL                                       */}
      {/* ============================================================== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setCancelModalOrder(null);
                setCancelError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Cancel &amp; Request Refund
              </h3>
              <p className="text-xs text-slate-500">
                Order #{cancelModalOrder.id.slice(0, 8).toUpperCase()} •{' '}
                {cancelModalOrder.gig?.title}
              </p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {cancelError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Reason for Cancellation *
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
                >
                  {cancellationReasons.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                  {cancellationReasons.length === 0 && (
                    <>
                      <option value="ORDERED_BY_MISTAKE">Ordered by mistake</option>
                      <option value="PROVIDER_UNRESPONSIVE">Provider is unresponsive</option>
                      <option value="REQUIREMENTS_MISMATCH">Requirements mismatch</option>
                      <option value="MUTUAL_AGREEMENT">Mutual agreement</option>
                      <option value="OTHER">Other reason</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Additional Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={cancellationNote}
                  onChange={(e) => setCancellationNote(e.target.value)}
                  placeholder="Provide any details to help process this cancellation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  ConsulSphere Escrow Guarantee
                </p>
                <p>
                  If this order was paid, the funds (${cancelModalOrder.price.toFixed(2)}) will be automatically returned to your payment balance or original payment method.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOrder(null);
                  setCancelError(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50"
              >
                {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. LEAVE REVIEW MODAL                                         */}
      {/* ============================================================== */}
      {reviewModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => {
                setReviewModalOrder(null);
                setReviewError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Rate &amp; Review Consultant
              </h3>
              <p className="text-xs text-slate-500">
                Share your experience for order #{reviewModalOrder.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {reviewSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#1dbf73] mx-auto" />
                <p className="font-bold text-slate-900">{reviewSuccess}</p>
              </div>
            ) : (
              <>
                {reviewError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {reviewError}
                  </div>
                )}

                {/* Star rating selector */}
                <div className="text-center py-2">
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer transition hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-1">
                    {reviewRating === 5
                      ? '5 Stars - Exceptional Work!'
                      : reviewRating === 4
                      ? '4 Stars - Great Experience'
                      : reviewRating === 3
                      ? '3 Stars - Average'
                      : 'Needs Improvement'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Review Feedback *
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the quality of delivery, communication, and if you recommend this consultant..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReview}
                    disabled={reviewSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Posting...' : 'Submit Review'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. ORDER SPECIFICATIONS DETAILS MODAL                        */}
      {/* ============================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 relative space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Order Overview
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                #{selectedOrderDetails.id}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {selectedOrderDetails.gig?.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Category: {selectedOrderDetails.gig?.category || 'Consulting'}
                  </p>
                </div>
                {renderStatusBadge(selectedOrderDetails.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/70 pt-2.5">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Package Tier</span>
                  <span className="font-bold text-slate-800">
                    {selectedOrderDetails.package?.name || 'Standard'} ({selectedOrderDetails.package?.tier || 'BASIC'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Time</span>
                  <span className="font-bold text-slate-800">
                    {selectedOrderDetails.package?.deliveryTimeInDays || 3} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                  <span className="font-bold text-[#1dbf73] text-sm">
                    ${selectedOrderDetails.price.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Status</span>
                  <span className={`font-bold ${selectedOrderDetails.paymentStatus === 'REFUNDED' ? 'text-amber-600' : 'text-slate-800'}`}>
                    {selectedOrderDetails.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Requirements provided by client */}
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-700">Project Requirements / Brief:</h5>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {selectedOrderDetails.requirements || 'No specific requirements submitted.'}
              </p>
            </div>

            {/* Provider info */}
            {selectedOrderDetails.gig?.provider && (
              <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Consultant
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedOrderDetails.gig.provider.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {selectedOrderDetails.gig.provider.email}
                  </span>
                </div>
                <Link
                  href={`/gigs/${selectedOrderDetails.gig?.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#1dbf73] hover:text-white text-xs font-bold text-slate-700 transition flex items-center gap-1"
                >
                  <span>View Gig</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Cancellation reason if cancelled */}
            {selectedOrderDetails.status === 'CANCELLED' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <span className="font-bold block">Cancellation Reason:</span>
                <p>
                  {selectedOrderDetails.cancellationReason?.replace(/_/g, ' ') || 'Cancelled by user'}
                </p>
                {selectedOrderDetails.cancellationNote && (
                  <p className="italic text-rose-600">
                    &quot;{selectedOrderDetails.cancellationNote}&quot;
                  </p>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
