'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  IGig,
  IGigCategory,
  getGigs,
  getGigCategories,
  IGigPackage
} from '@/lib/api';
import {
  Search,
  Star,
  Flame,
  Clock,
  ArrowUpDown,
  Filter,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

export default function GigsShowcase() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL query params
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('searchTerm') || '';
  const initialSort = searchParams.get('sortBy') || 'orders';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [categories, setCategories] = useState<IGigCategory[]>([]);
  const [gigs, setGigs] = useState<IGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGigModal, setSelectedGigModal] = useState<IGig | null>(null);
  const [activePackageTab, setActivePackageTab] = useState<'BASIC' | 'STANDARD' | 'PREMIUM'>('BASIC');

  // Load categories
  useEffect(() => {
    let isMounted = true;
    getGigCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch((err) => console.error('Error fetching categories:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected category if URL changes (e.g. from Navbar)
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  // Load Gigs whenever search/filter/sort parameters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const timer = setTimeout(() => {
      getGigs({
        searchTerm: searchTerm.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy,
        sortOrder: 'desc',
        limit: 50,
      })
        .then((result) => {
          if (isMounted) {
            setGigs(result.data || []);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error fetching gigs:', err);
          if (isMounted) {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, sortBy, minPrice, maxPrice]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    const params = new URLSearchParams(window.location.search);
    if (catName === 'All') {
      params.delete('category');
    } else {
      params.set('category', catName);
    }
    router.replace(`/gigs?${params.toString()}`, { scroll: false });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CS';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('orders');
    setMinPrice('');
    setMaxPrice('');
    router.replace('/gigs', { scroll: false });
  };

  const activePackage = useMemo(() => {
    if (!selectedGigModal?.packages) return null;
    return (
      selectedGigModal.packages.find((p) => p.tier === activePackageTab) ||
      selectedGigModal.packages[0]
    );
  }, [selectedGigModal, activePackageTab]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner / Breadcrumb */}
      <section className="bg-white border-b border-slate-200 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
            <Link href="/" className="hover:text-[#1dbf73] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Services &amp; Gigs</span>
            {selectedCategory !== 'All' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[#1dbf73] font-bold">{selectedCategory}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-3">
                <Flame className="w-3.5 h-3.5 text-[#1dbf73] animate-pulse" />
                <span>Ranked by Highest Orders &amp; Top Client Rating</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
                {selectedCategory === 'All'
                  ? 'Explore Professional Services'
                  : `${selectedCategory} Services`}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Browse verified freelance consultants and industry specialists. Gigs are listed dynamically with completed orders and authentic client ratings.
              </p>
            </div>

            {/* Search Input Box */}
            <div className="w-full md:w-96 relative">
              <label htmlFor="gig-search" className="sr-only">
                Search gigs
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="gig-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, skills or keyword..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-[#1dbf73] focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              type="button"
              onClick={() => handleCategorySelect('All')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-[#1dbf73] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && cat.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === cat.name
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Filter and Sort Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Left: Summary Stats & Active Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <SlidersHorizontal className="w-4 h-4 text-[#1dbf73]" />
              <span>
                {loading ? 'Finding top gigs...' : `${gigs.length} Services Available`}
              </span>
            </div>

            {(selectedCategory !== 'All' || searchTerm || minPrice || maxPrice) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100/70 px-2.5 py-1 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Right: Budget Range & Sort Options */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Price Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">Budget:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-18 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1dbf73]"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-18 px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1dbf73]"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="gig-sort" className="font-semibold text-slate-500">
                Sort by:
              </label>
              <select
                id="gig-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:border-[#1dbf73] cursor-pointer shadow-2xs"
              >
                <option value="orders">🔥 Most Ordered (Best Selling)</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price_asc">💲 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="createdAt">✨ Newest Gigs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gigs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse p-4 space-y-3"
              >
                <div className="h-44 bg-slate-200 rounded-xl" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-4/5" />
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#1dbf73] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              No matching gigs found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              We couldn&apos;t find any active services matching &quot;{searchTerm || selectedCategory}&quot;. Try adjusting your keywords, price budget, or category filters.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={clearFilters}
                className="px-5 py-2.5 rounded-xl bg-[#1dbf73] text-white text-xs font-bold shadow-sm hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          /* Gigs Showcase Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gigs.map((gig) => {
              const lowestPrice =
                gig.packages && gig.packages.length > 0
                  ? Math.min(...gig.packages.map((p) => p.price))
                  : 50;

              const fastestDelivery =
                gig.packages && gig.packages.length > 0
                  ? Math.min(...gig.packages.map((p) => p.deliveryTimeInDays))
                  : 1;

              return (
                <div
                  key={gig.id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                >
                  {/* Image Showcase */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        gig.images && gig.images[0]
                          ? gig.images[0]
                          : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
                      }
                      alt={gig.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Overlay Tag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-lg bg-slate-900/80 backdrop-blur-md text-white border border-white/10 shadow-xs">
                        {gig.category}
                      </span>
                    </div>

                    {/* Order Rank Highlight Badge (CRITICAL REQUIREMENT) */}
                    {gig.totalSold > 0 && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="flex items-center gap-1 px-2 py-0.8 text-[11px] font-bold rounded-md bg-emerald-600 text-white shadow-md">
                          <Flame className="w-3.5 h-3.5" />
                          <span>{gig.totalSold} Orders Placed</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* PROVIDER DETAILS SECTION (CRITICAL REQUIREMENT) */}
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {getInitials(gig.provider?.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {gig.provider?.name || 'Verified Specialist'}
                            </span>
                            <span title="Verified Consultant">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#1dbf73] shrink-0" />
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {gig.provider?.profile?.bio ||
                              gig.provider?.profile?.experience ||
                              'Top Tier Consultant'}
                          </p>
                        </div>
                      </div>

                      {/* Gig Title */}
                      <h3
                        onClick={() => setSelectedGigModal(gig)}
                        className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#1dbf73] transition-colors cursor-pointer leading-snug"
                        title={gig.title}
                      >
                        {gig.title}
                      </h3>

                      {/* Star Rating & Review Count */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs">
                        <div className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                          <span>{gig.averageRating > 0 ? gig.averageRating.toFixed(1) : '5.0'}</span>
                        </div>
                        <span className="text-slate-400 font-medium">
                          ({gig.totalReviews || gig.totalSold || 1})
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {fastestDelivery}d delivery
                        </span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action Bar */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Starting at
                        </span>
                        <span className="text-base font-extrabold text-slate-900">
                          ${lowestPrice}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedGigModal(gig)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#1dbf73] text-emerald-800 hover:text-white font-bold text-xs transition-colors duration-200 cursor-pointer border border-emerald-200/60"
                      >
                        View Packages
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Package Detail & Order Modal */}
      {selectedGigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative p-6 sm:p-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedGigModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Provider Header in Modal */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {getInitials(selectedGigModal.provider?.name)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedGigModal.provider?.name}
                  </h4>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-100 text-emerald-800">
                    Verified Consultant
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedGigModal.provider?.profile?.bio ||
                    selectedGigModal.provider?.email}
                </p>
              </div>
            </div>

            {/* Gig Title */}
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
              {selectedGigModal.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {selectedGigModal.description}
            </p>

            {/* Order Count & Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Flame className="w-3.5 h-3.5 text-[#1dbf73]" />
                <span>{selectedGigModal.totalSold} Completed Orders</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>
                  {selectedGigModal.averageRating > 0
                    ? selectedGigModal.averageRating.toFixed(1)
                    : '5.0'}{' '}
                  Rating ({selectedGigModal.totalReviews || 1} Reviews)
                </span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedGigModal.category}</span>
              </div>
            </div>

            {/* 3 Tier Package Selector */}
            {selectedGigModal.packages && selectedGigModal.packages.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                {/* Tabs */}
                <div className="grid grid-cols-3 bg-slate-100 text-xs font-bold border-b border-slate-200">
                  {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((tier) => {
                    const pkg = selectedGigModal.packages.find((p) => p.tier === tier);
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setActivePackageTab(tier)}
                        className={`py-3 px-2 text-center transition-all cursor-pointer ${
                          activePackageTab === tier
                            ? 'bg-white text-slate-900 border-b-2 border-[#1dbf73]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <div>{tier}</div>
                        {pkg && <div className="text-[11px] font-normal text-slate-500">${pkg.price}</div>}
                      </button>
                    );
                  })}
                </div>

                {/* Active Package Details */}
                {activePackage && (
                  <div className="p-5 bg-white">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {activePackage.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {activePackage.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900">
                          ${activePackage.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 my-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#1dbf73]" />
                        <span>{activePackage.deliveryTimeInDays} Days Delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>{activePackage.revisions} Revisions Included</span>
                      </div>
                    </div>

                    {/* Features List */}
                    {activePackage.features && activePackage.features.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <span className="text-xs font-bold text-slate-700 block">
                          Included Deliverables:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activePackage.features.map((feat, fIdx) => (
                            <li
                              key={fIdx}
                              className="flex items-center gap-2 text-xs text-slate-600"
                            >
                              <Check className="w-4 h-4 text-[#1dbf73] shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {selectedGigModal.tags && selectedGigModal.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-6">
                <span className="text-xs font-bold text-slate-500 mr-1">Skills:</span>
                {selectedGigModal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedGigModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/register?role=CLIENT`}
                className="px-6 py-2.5 rounded-xl bg-[#1dbf73] hover:bg-emerald-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Continue (${activePackage?.price || 50})</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
