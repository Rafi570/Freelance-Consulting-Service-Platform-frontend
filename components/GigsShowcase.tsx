'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Heart,
  ChevronDown,
  Check,
  X,
  Clock,
  Zap,
  ChevronRight,
  Flame,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function GigsShowcase() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search & Filters state
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('searchTerm') || searchParams.get('query') || '';
  const initialSort = searchParams.get('sortBy') || 'orders';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('any');
  const [proOnly, setProOnly] = useState(false);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [likedGigs, setLikedGigs] = useState<Record<string, boolean>>({});

  // Active Dropdowns
  const [openDropdown, setOpenDropdown] = useState<'category' | 'budget' | 'delivery' | null>(null);

  const [categories, setCategories] = useState<IGigCategory[]>([]);
  const [gigs, setGigs] = useState<IGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedGigModal, setSelectedGigModal] = useState<IGig | null>(null);
  const [activePackageTab, setActivePackageTab] = useState<'BASIC' | 'STANDARD' | 'PREMIUM'>('BASIC');

  // Fast In-Memory Cache on client component level
  const localCache = useRef<Record<string, IGig[]>>({});

  // Load categories with 0ms lag
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

  // Sync category & search from URL
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
    const query = searchParams.get('query') || searchParams.get('searchTerm');
    if (query !== null && query !== searchTerm) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Load Gigs with Instant Cache-First approach (eliminates loading delays)
  useEffect(() => {
    let isMounted = true;
    const cacheKey = `${selectedCategory}_${searchTerm}_${sortBy}_${minPrice}_${maxPrice}_${deliveryFilter}`;

    // 1. If we have local cached results, display them immediately with 0ms delay!
    if (localCache.current[cacheKey]) {
      setGigs(localCache.current[cacheKey]);
      setLoading(false);
      return;
    }

    // 2. Only show loading skeleton on very first load if we don't have any gigs yet
    if (gigs.length === 0) {
      setLoading(true);
    } else {
      setIsUpdating(true);
    }

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
            let list = result.data || [];
            if (deliveryFilter === '24h') {
              list = list.filter((g) =>
                g.packages?.some((p) => p.deliveryTimeInDays <= 1)
              );
            } else if (deliveryFilter === '3d') {
              list = list.filter((g) =>
                g.packages?.some((p) => p.deliveryTimeInDays <= 3)
              );
            } else if (deliveryFilter === '7d') {
              list = list.filter((g) =>
                g.packages?.some((p) => p.deliveryTimeInDays <= 7)
              );
            }
            localCache.current[cacheKey] = list;
            setGigs(list);
            setLoading(false);
            setIsUpdating(false);
          }
        })
        .catch((err) => {
          console.error('Error fetching gigs:', err);
          if (isMounted) {
            setLoading(false);
            setIsUpdating(false);
          }
        });
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, sortBy, minPrice, maxPrice, deliveryFilter]);

  const handleCategorySelect = (catName: string) => {
    setSelectedCategory(catName);
    setOpenDropdown(null);
    const params = new URLSearchParams(window.location.search);
    if (catName === 'All') {
      params.delete('category');
    } else {
      params.set('category', catName);
    }
    router.replace(`/gigs?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortBy('orders');
    setMinPrice('');
    setMaxPrice('');
    setDeliveryFilter('any');
    setProOnly(false);
    setOnlineOnly(false);
    setOpenDropdown(null);
    router.replace('/gigs', { scroll: false });
  };

  const toggleLike = (e: React.MouseEvent, gigId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedGigs((prev) => ({ ...prev, [gigId]: !prev[gigId] }));
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

  const activePackage = useMemo(() => {
    if (!selectedGigModal?.packages) return null;
    return (
      selectedGigModal.packages.find((p) => p.tier === activePackageTab) ||
      selectedGigModal.packages[0]
    );
  }, [selectedGigModal, activePackageTab]);

  // Related suggestion tags (exact Fiverr search page header)
  const relatedTags = [
    'website development',
    'wordpress website',
    'web developer',
    'custom web application',
    'responsive website',
    'ecommerce website',
    'landing page design',
    'full stack developer',
    'frontend development'
  ];

  return (
    <div className="min-h-screen bg-white text-[#222325] pb-24 font-sans antialiased">
      {/* 1. FIVERR HEADER CONTAINER */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#74767e] mb-3">
          <Link href="/" className="hover:text-[#1dbf73] transition-colors">
            ConsulSphere
          </Link>
          <span className="text-[#c5c6c9]">/</span>
          <Link href="/gigs" className="hover:text-[#1dbf73] transition-colors">
            Programming &amp; Tech
          </Link>
          {selectedCategory !== 'All' && (
            <>
              <span className="text-[#c5c6c9]">/</span>
              <span className="text-[#222325] font-semibold">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Big Fiverr Heading */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#222325] tracking-tight">
              {selectedCategory === 'All'
                ? searchTerm
                  ? `Results for "${searchTerm}"`
                  : 'Website Development Services'
                : `${selectedCategory} Services`}
            </h1>
            <p className="mt-1 text-sm text-[#62646a] max-w-3xl leading-relaxed">
              Find the perfect verified consultant for your project. Professional development services to enhance your online presence. Get started today!
            </p>
          </div>

          {/* Search bar inside header */}
          <div className="w-full md:w-84 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="What service are you looking for?"
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#c5c6c9] bg-white text-sm text-[#222325] placeholder:text-[#95979d] focus:outline-none focus:border-[#222325]"
            />
            <Search className="w-4 h-4 text-[#74767e] absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74767e] hover:text-[#222325]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Related Searches Tag Chips (Fiverr Style) */}
        <div className="mt-4 pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-xs font-bold text-[#74767e] shrink-0 mr-1">
            Suggested:
          </span>
          {relatedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchTerm(tag);
                setSelectedCategory('All');
              }}
              className="shrink-0 px-3 py-1 rounded-full border border-[#e4e5e7] hover:border-[#222325] bg-white text-xs font-semibold text-[#404145] hover:text-[#222325] transition-all cursor-pointer whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. FIVERR ICONIC FILTER ROW */}
      <div className="border-y border-[#e4e5e7] bg-white sticky top-18 z-30 shadow-2xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-4">
          {/* Left: Filter Dropdown Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'category' ? null : 'category')
                }
                className={`px-3.5 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  selectedCategory !== 'All'
                    ? 'border-[#222325] bg-[#f7f7f7] text-[#222325]'
                    : 'border-[#c5c6c9] bg-white text-[#404145] hover:border-[#222325]'
                }`}
              >
                <span>Category{selectedCategory !== 'All' ? `: ${selectedCategory}` : ''}</span>
                <ChevronDown className={`w-4 h-4 text-[#74767e] transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'category' && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white border border-[#e4e5e7] shadow-xl p-2 z-50">
                  <div className="max-h-64 overflow-y-auto space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('All')}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer ${
                        selectedCategory === 'All' ? 'bg-[#f4f5f7] text-[#1dbf73]' : 'text-[#404145] hover:bg-[#f7f7f7]'
                      }`}
                    >
                      <span>All Categories</span>
                      {selectedCategory === 'All' && <Check className="w-4 h-4" />}
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleCategorySelect(c.name)}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer ${
                          selectedCategory === c.name ? 'bg-[#f4f5f7] text-[#1dbf73]' : 'text-[#404145] hover:bg-[#f7f7f7]'
                        }`}
                      >
                        <span className="truncate">{c.name}</span>
                        {c.count !== undefined && c.count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#e8faf4] text-[#1dbf73] font-bold rounded">
                            {c.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Budget Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'budget' ? null : 'budget')
                }
                className={`px-3.5 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  minPrice || maxPrice
                    ? 'border-[#222325] bg-[#f7f7f7] text-[#222325]'
                    : 'border-[#c5c6c9] bg-white text-[#404145] hover:border-[#222325]'
                }`}
              >
                <span>Budget{minPrice || maxPrice ? ` ($${minPrice || '0'} - $${maxPrice || '∞'})` : ''}</span>
                <ChevronDown className={`w-4 h-4 text-[#74767e] transition-transform ${openDropdown === 'budget' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'budget' && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-[#e4e5e7] shadow-xl p-4 z-50">
                  <h4 className="text-xs font-bold text-[#222325] uppercase tracking-wider mb-3">
                    Budget (USD)
                  </h4>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-[#74767e] block mb-1">
                        Min.
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#74767e]">$</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-[#c5c6c9] text-xs text-[#222325] focus:outline-none focus:border-[#222325]"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-[#74767e] block mb-1">
                        Max.
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#74767e]">$</span>
                        <input
                          type="number"
                          placeholder="Any"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-[#c5c6c9] text-xs text-[#222325] focus:outline-none focus:border-[#222325]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#e4e5e7]">
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        setOpenDropdown(null);
                      }}
                      className="text-xs font-bold text-[#74767e] hover:text-[#222325] cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(null)}
                      className="px-4 py-1.5 rounded-lg bg-[#222325] text-white text-xs font-bold hover:bg-black cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Time Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === 'delivery' ? null : 'delivery')
                }
                className={`px-3.5 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  deliveryFilter !== 'any'
                    ? 'border-[#222325] bg-[#f7f7f7] text-[#222325]'
                    : 'border-[#c5c6c9] bg-white text-[#404145] hover:border-[#222325]'
                }`}
              >
                <span>Delivery Time</span>
                <ChevronDown className={`w-4 h-4 text-[#74767e] transition-transform ${openDropdown === 'delivery' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'delivery' && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white border border-[#e4e5e7] shadow-xl p-3 z-50 space-y-2">
                  {[
                    { id: 'any', label: 'Anytime' },
                    { id: '24h', label: 'Express 24 Hours' },
                    { id: '3d', label: 'Up to 3 Days' },
                    { id: '7d', label: 'Up to 7 Days' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2.5 text-xs font-semibold text-[#404145] hover:text-[#222325] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryFilter === opt.id}
                        onChange={() => {
                          setDeliveryFilter(opt.id);
                          setOpenDropdown(null);
                        }}
                        className="accent-[#222325]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Clear All Filters Button */}
            {(selectedCategory !== 'All' || searchTerm || minPrice || maxPrice || deliveryFilter !== 'any') && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#b52a2a] hover:underline flex items-center gap-1 cursor-pointer ml-2"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear filters</span>
              </button>
            )}
          </div>

          {/* Right: Fiverr Pro & Online Switch Toggles */}
          <div className="flex items-center gap-5 text-sm font-semibold text-[#404145]">
            {/* Pro services toggle */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold">
                <span className="px-1.5 py-0.5 rounded bg-[#222325] text-white text-[10px] font-black tracking-wider">PRO</span>
                Services
              </span>
              <button
                type="button"
                onClick={() => setProOnly(!proOnly)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  proOnly ? 'bg-[#1dbf73]' : 'bg-[#c5c6c9]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    proOnly ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Online sellers toggle */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#1dbf73]" />
                Online Sellers
              </span>
              <button
                type="button"
                onClick={() => setOnlineOnly(!onlineOnly)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  onlineOnly ? 'bg-[#1dbf73]' : 'bg-[#c5c6c9]'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    onlineOnly ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RESULTS BAR (Count + Sort By) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-xs sm:text-sm text-[#74767e]">
        <div className="font-semibold text-[#222325] flex items-center gap-2">
          {loading && gigs.length === 0 ? (
            <span>Loading services...</span>
          ) : (
            <span>
              <strong className="text-[#222325]">{gigs.length}</strong> services available
            </span>
          )}
          {isUpdating && (
            <span className="inline-block w-2 h-2 rounded-full bg-[#1dbf73] animate-ping" />
          )}
        </div>

        {/* Fiverr Sort By Select */}
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-[#74767e]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="font-bold text-[#222325] bg-transparent border-0 focus:outline-none cursor-pointer pr-1"
          >
            <option value="orders">Best Selling (Most Ordered)</option>
            <option value="rating">Highest Rated</option>
            <option value="createdAt">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* 4. THE AUTHENTIC FIVERR GIG CARDS GRID (Exact Fiverr HTML/CSS Layout) */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {loading && gigs.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="animate-pulse space-y-2.5">
                <div className="aspect-[16/10] bg-slate-100 rounded-xl" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-5/6" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="p-16 text-center border border-[#e4e5e7] rounded-2xl bg-white my-8 max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-[#222325]">No Services Found</h3>
            <p className="text-sm text-[#74767e] mt-2">
              Try adjusting your search query, budget range, or filter options.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 px-5 py-2 rounded-lg bg-[#222325] text-white text-xs font-bold hover:bg-black cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
            {gigs.map((gig) => {
              const lowestPrice =
                gig.packages && gig.packages.length > 0
                  ? Math.min(...gig.packages.map((p) => p.price))
                  : 50;

              const isLiked = likedGigs[gig.id] || false;

              return (
                <Link
                  key={gig.id}
                  href={`/gigs/${gig.id}`}
                  className="group relative flex flex-col cursor-pointer bg-white"
                >
                  {/* 1. Image Container (16:10 Ratio with Rounded Corners like Fiverr) */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#f4f5f7] mb-2.5">
                    <img
                      src={
                        gig.images && gig.images[0]
                          ? gig.images[0]
                          : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
                      }
                      alt={gig.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Top Left Badge: Choice / Top Seller */}
                    {gig.totalSold >= 20 ? (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#222325] text-white shadow-xs">
                          Choice
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#222325]/75 backdrop-blur-xs text-white">
                          {gig.category}
                        </span>
                      </div>
                    )}

                    {/* Wishlist Heart Icon (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => toggleLike(e, gig.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/25 hover:bg-black/45 backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Save to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isLiked
                            ? 'fill-[#f74040] text-[#f74040]'
                            : 'fill-transparent text-white hover:text-[#f74040]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 2. Seller / Provider Info Row (Fiverr layout: flex-between flex-items-center) */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        {getInitials(gig.provider?.name)}
                      </div>
                      <span className="text-sm font-bold text-[#222325] hover:underline truncate">
                        {gig.provider?.name || 'Verified Specialist'}
                      </span>
                    </div>

                    {/* Seller Level 2 Badge with 2 diamond icons */}
                    <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-[#74767e]">
                      <span>Level 2</span>
                      <div className="flex gap-0.5 text-[#1dbf73]">
                        <span className="w-1.5 h-1.5 rotate-45 bg-[#1dbf73] inline-block" />
                        <span className="w-1.5 h-1.5 rotate-45 bg-[#1dbf73] inline-block" />
                      </div>
                    </div>
                  </div>

                  {/* 3. Gig Title (Fiverr style "I will create website web developer") */}
                  <h2 className="text-[15px] font-normal text-[#222325] group-hover:text-[#1dbf73] line-clamp-2 leading-[1.3] my-1 transition-colors">
                    {gig.title}
                  </h2>

                  {/* 4. Rating Row (Exact Fiverr Black Star + Bold Score + Count) */}
                  <div className="flex items-center gap-1.5 text-sm my-1">
                    <Star className="w-3.5 h-3.5 fill-[#222325] text-[#222325] shrink-0" />
                    <strong className="font-bold text-[#222325]">
                      {gig.averageRating > 0 ? gig.averageRating.toFixed(1) : '5.0'}
                    </strong>
                    <span className="text-[#74767e] font-normal">
                      ({gig.totalReviews || gig.totalSold || 1})
                    </span>
                  </div>

                  {/* 5. Orders / Clients Served Note (Fiverr sub-label) */}
                  {gig.totalSold > 0 && (
                    <p className="text-xs text-[#74767e] font-normal mb-1">
                      {gig.totalSold}+ clients served • {gig.totalSold} orders
                    </p>
                  )}

                  {/* 6. Card Bottom Price (Exact Fiverr: From $XX) */}
                  <div className="pt-2 mt-auto flex items-baseline justify-end">
                    <span className="text-xs font-normal text-[#74767e] mr-1">From</span>
                    <strong className="text-base text-[#222325] font-bold">
                      ${lowestPrice}
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. FIVERR 3-TIER PACKAGES MODAL */}
      {selectedGigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e4e5e7] shadow-2xl relative p-6 sm:p-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedGigModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#74767e] hover:text-[#222325] hover:bg-[#f4f5f7] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Provider Header in Modal */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#e4e5e7] mb-4">
              <div className="w-12 h-12 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold text-base shadow-xs">
                {getInitials(selectedGigModal.provider?.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#222325]">
                    {selectedGigModal.provider?.name}
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#f4f5f7] text-[#222325] border border-[#e4e5e7]">
                    Top Rated Consultant
                  </span>
                </div>
                <p className="text-xs text-[#74767e] mt-0.5">
                  {selectedGigModal.provider?.profile?.bio || selectedGigModal.provider?.email}
                </p>
              </div>
            </div>

            {/* Gig Title */}
            <h2 className="text-lg sm:text-xl font-bold text-[#222325] mb-2 leading-snug">
              {selectedGigModal.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#62646a] leading-relaxed mb-5">
              {selectedGigModal.description}
            </p>

            {/* Service Delivery Stats Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#f7f7f7] border border-[#e4e5e7] mb-6 text-center">
              <div className="p-2.5 bg-white rounded-lg border border-[#e4e5e7]/60">
                <span className="text-[10px] uppercase font-bold text-[#74767e] block">Clients Served</span>
                <span className="text-base font-black text-[#1dbf73]">{selectedGigModal.totalSold}+</span>
                <span className="text-[10px] text-[#74767e] block">Happy Buyers</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#e4e5e7]/60">
                <span className="text-[10px] uppercase font-bold text-[#74767e] block">Orders Finished</span>
                <span className="text-base font-black text-[#222325]">{selectedGigModal.totalSold}</span>
                <span className="text-[10px] text-[#74767e] block">Delivered</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#e4e5e7]/60">
                <span className="text-[10px] uppercase font-bold text-[#74767e] block">Rating</span>
                <span className="text-base font-black text-[#222325] flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#222325]" />
                  <span>{selectedGigModal.averageRating > 0 ? selectedGigModal.averageRating.toFixed(1) : '5.0'}</span>
                </span>
                <span className="text-[10px] text-[#74767e] block">100% Positive</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#e4e5e7]/60">
                <span className="text-[10px] uppercase font-bold text-[#74767e] block">Category</span>
                <span className="text-xs font-bold text-[#222325] truncate block mt-0.5">{selectedGigModal.category}</span>
                <span className="text-[10px] text-[#1dbf73] block font-semibold">Verified</span>
              </div>
            </div>

            {/* 3 Tier Package Selector */}
            {selectedGigModal.packages && selectedGigModal.packages.length > 0 && (
              <div className="border border-[#e4e5e7] rounded-xl overflow-hidden mb-6">
                {/* Tabs */}
                <div className="grid grid-cols-3 bg-[#f7f7f7] text-xs font-bold border-b border-[#e4e5e7]">
                  {(['BASIC', 'STANDARD', 'PREMIUM'] as const).map((tier) => {
                    const pkg = selectedGigModal.packages.find((p) => p.tier === tier);
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setActivePackageTab(tier)}
                        className={`py-3 px-2 text-center transition-all cursor-pointer ${
                          activePackageTab === tier
                            ? 'bg-white text-[#222325] border-b-2 border-[#1dbf73] font-bold'
                            : 'text-[#74767e] hover:text-[#222325]'
                        }`}
                      >
                        <div>{tier}</div>
                        {pkg && <div className="text-[11px] font-normal text-[#74767e]">${pkg.price}</div>}
                      </button>
                    );
                  })}
                </div>

                {/* Active Package Details */}
                {activePackage && (
                  <div className="p-5 bg-white">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="text-base font-bold text-[#222325]">
                          {activePackage.name}
                        </h4>
                        <p className="text-xs text-[#62646a] mt-1 leading-relaxed">
                          {activePackage.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-[#222325]">
                          ${activePackage.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 text-xs font-semibold text-[#62646a] my-4 pb-3 border-b border-[#f0f0f0]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#74767e]" />
                        <span>{activePackage.deliveryTimeInDays} Days Delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-[#74767e]" />
                        <span>{activePackage.revisions} Revisions</span>
                      </div>
                    </div>

                    {/* Features List */}
                    {activePackage.features && activePackage.features.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <span className="text-xs font-bold text-[#222325] block">
                          Included in this package:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activePackage.features.map((feat, fIdx) => (
                            <li
                              key={fIdx}
                              className="flex items-center gap-2 text-xs text-[#62646a]"
                            >
                              <Check className="w-3.5 h-3.5 text-[#1dbf73] shrink-0" />
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

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e4e5e7]">
              <button
                type="button"
                onClick={() => setSelectedGigModal(null)}
                className="px-4 py-2 rounded-lg border border-[#c5c6c9] text-[#222325] text-xs font-bold hover:bg-[#f7f7f7] cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/register?role=CLIENT`}
                className="px-6 py-2.5 rounded-lg bg-[#1dbf73] hover:bg-[#19a463] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
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
