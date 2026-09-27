'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSearchSuggestions, ISearchSuggestionItem } from '@/lib/api';
import {
  Search,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  X,
  Palette,
  Code2,
  Briefcase,
  Layers,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function HeroSearchWithSuggestions() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [apiSuggestions, setApiSuggestions] = useState<ISearchSuggestionItem[]>([]);
  const [defaultPopular, setDefaultPopular] = useState<{
    popularSearches: string[];
    popularCategories: string[];
    featuredGigs: ISearchSuggestionItem[];
  }>({
    popularSearches: ['Next.js Development', 'Website Design', 'Logo & Branding', 'AI Services', 'SEO Marketing'],
    popularCategories: ['Web Development', 'Graphics & Design', 'Digital Marketing', 'Business & Consulting'],
    featuredGigs: [],
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('consulsphere_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 4));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch initial popular defaults from backend API
  useEffect(() => {
    let isMounted = true;
    getSearchSuggestions('')
      .then((data: any) => {
        if (!isMounted) return;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setDefaultPopular({
            popularSearches:
              Array.isArray(data.popularSearches) && data.popularSearches.length > 0
                ? data.popularSearches
                : ['Next.js Development', 'Website Design', 'Logo & Branding', 'AI Services', 'SEO Marketing'],
            popularCategories:
              Array.isArray(data.popularCategories) && data.popularCategories.length > 0
                ? data.popularCategories
                : ['Web Development', 'Graphics & Design', 'Digital Marketing', 'Business & Consulting'],
            featuredGigs: Array.isArray(data.featuredGigs) ? data.featuredGigs : [],
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load default suggestions from API:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Live Debounced Search API Call
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setApiSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    const timeoutId = setTimeout(() => {
      getSearchSuggestions(trimmed)
        .then((res: any) => {
          if (Array.isArray(res)) {
            setApiSuggestions(res);
          } else if (res && Array.isArray(res.suggestions)) {
            setApiSuggestions(res.suggestions);
          } else {
            setApiSuggestions([]);
          }
        })
        .catch((err) => {
          console.error('Search suggestions API call failed:', err);
          setApiSuggestions([]);
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Save to recent searches
  const saveRecentSearch = (term: string) => {
    try {
      const cleaned = term.trim();
      if (!cleaned) return;
      const updated = [cleaned, ...recentSearches.filter((s) => s.toLowerCase() !== cleaned.toLowerCase())].slice(0, 4);
      setRecentSearches(updated);
      localStorage.setItem('consulsphere_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('consulsphere_recent_searches');
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectSearch = (term: string, specificGigId?: string) => {
    saveRecentSearch(term);
    setSearchTerm(term);
    setIsOpen(false);
    if (specificGigId) {
      router.push(`/gigs/${specificGigId}`);
    } else {
      router.push(`/gigs?searchTerm=${encodeURIComponent(term)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && apiSuggestions[selectedIndex]) {
      const item = apiSuggestions[selectedIndex];
      handleSelectSearch(item.text, item.id);
      return;
    }

    if (searchTerm.trim()) {
      handleSelectSearch(searchTerm.trim());
    } else {
      router.push('/gigs');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < apiSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : apiSuggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-xl relative pt-2 z-40">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center rounded-2xl bg-white overflow-hidden shadow-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-400 transition-all border border-slate-100">
          <div className="flex items-center flex-1 px-3 py-2">
            {loadingSuggestions ? (
              <Loader2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              name="searchTerm"
              autoComplete="off"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search for any service (e.g. Next.js, Logo, SEO, Web App)..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-hidden font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors mr-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-[#1dbf73] hover:bg-[#19a463] text-white px-6 sm:px-8 py-3 rounded-xl text-sm sm:text-base font-semibold transition-colors duration-200 flex items-center justify-center shrink-0 cursor-pointer shadow-md"
          >
            <span className="hidden sm:inline">Search</span>
            <Search className="w-5 h-5 sm:hidden" />
          </button>
        </div>
      </form>

      {/* Dynamic Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* 1. When user has typed query: Live Backend Suggestions */}
          {searchTerm.trim().length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Live Database Suggestions</span>
                {loadingSuggestions ? (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Querying API...
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold">{apiSuggestions.length} results</span>
                )}
              </div>

              {apiSuggestions.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {apiSuggestions.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSearch(item.text, item.id)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{item.text}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                            {item.type || item.category}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : !loadingSuggestions ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No exact match. Press Enter to search marketplace for &quot;<strong>{searchTerm}</strong>&quot;
                </div>
              ) : null}
            </div>
          ) : (
            /* 2. When search input is empty: Dynamic Popular Searches & Recent Searches */
            <div className="space-y-3.5 divide-y divide-slate-100">
              {/* Recent Searches (from local history) */}
              {recentSearches.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-slate-600 lowercase cursor-pointer"
                    >
                      clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3 pt-1">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSearch(term)}
                        className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Trending Keywords from API */}
              <div className="pt-3">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Trending Searches (From API)</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-3 pt-1.5">
                  {defaultPopular.popularSearches.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearch(term)}
                      className="px-3 py-1.5 rounded-full border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1 group"
                    >
                      <span>{term}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories from API */}
              {defaultPopular.popularCategories.length > 0 && (
                <div className="pt-3">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Popular Categories</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 px-3 pt-1.5">
                    {defaultPopular.popularCategories.map((cat, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/gigs?category=${encodeURIComponent(cat)}`);
                        }}
                        className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition flex items-center justify-between group"
                      >
                        <span className="truncate">{cat}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
