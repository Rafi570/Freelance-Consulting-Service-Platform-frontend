'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';

interface SuggestionItem {
  text: string;
  category: string;
  type?: 'popular' | 'category' | 'service';
}

const ALL_SUGGESTIONS: SuggestionItem[] = [
  // Programming & Tech
  { text: 'Web Development', category: 'Programming & Tech' },
  { text: 'Next.js & React Applications', category: 'Programming & Tech' },
  { text: 'Full Stack Web App', category: 'Programming & Tech' },
  { text: 'WordPress & Shopify Development', category: 'Programming & Tech' },
  { text: 'API & Cloud Architecture', category: 'Programming & Tech' },
  { text: 'Bug Fix & Code Review', category: 'Programming & Tech' },

  // Graphics & Design
  { text: 'UI/UX Design', category: 'Graphics & Design' },
  { text: 'Logo & Brand Identity', category: 'Graphics & Design' },
  { text: 'Figma Interactive Prototype', category: 'Graphics & Design' },
  { text: 'Mobile App Interface Design', category: 'Graphics & Design' },
  { text: 'Pitch Deck & Presentation Design', category: 'Graphics & Design' },
  { text: 'Vector Art & Illustrations', category: 'Graphics & Design' },

  // Digital Marketing
  { text: 'SEO & Search Engine Optimization', category: 'Digital Marketing' },
  { text: 'Social Media Marketing', category: 'Digital Marketing' },
  { text: 'Google Ads & PPC Management', category: 'Digital Marketing' },
  { text: 'Content Strategy & Email Marketing', category: 'Digital Marketing' },

  // Business & Consulting
  { text: 'Business Strategy Consulting', category: 'Business & Consulting' },
  { text: 'Financial Modeling & Valuation', category: 'Business & Consulting' },
  { text: 'Startup Advisory & Market Research', category: 'Business & Consulting' },
  { text: 'Legal & Contract Review', category: 'Business & Consulting' },

  // Video & Audio
  { text: 'Video Editing & Post Production', category: 'Video & Animation' },
  { text: 'Animated Explainer Videos', category: 'Video & Animation' },
  { text: 'YouTube Thumbnail & Video Cut', category: 'Video & Animation' },

  // Writing
  { text: 'Copywriting & Website Content', category: 'Writing & Translation' },
  { text: 'Technical & Article Writing', category: 'Writing & Translation' },
];

const POPULAR_SEARCHES = [
  'Website Design',
  'Logo & Branding',
  'UI/UX Consulting',
  'Next.js Development',
  'SEO Marketing',
  'Business Strategy',
];

export default function HeroSearchWithSuggestions() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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

  // Compute suggestions based on input
  const filteredSuggestions = searchTerm.trim()
    ? ALL_SUGGESTIONS.filter((item) =>
      item.text.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase().trim())
    ).slice(0, 6)
    : [];

  const handleSelectSearch = (term: string) => {
    saveRecentSearch(term);
    setSearchTerm(term);
    setIsOpen(false);
    router.push(`/gigs?searchTerm=${encodeURIComponent(term)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
      handleSelectSearch(filteredSuggestions[selectedIndex].text);
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
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
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
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
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
              placeholder="Search for any service (e.g. Logo Design, SEO, Web App)..."
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none font-medium"
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

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* 1. When user has typed query and there are filtered results */}
          {searchTerm.trim().length > 0 ? (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Suggestions</span>
                <span className="text-[10px] text-emerald-600 font-semibold">{filteredSuggestions.length} results</span>
              </div>

              {filteredSuggestions.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {filteredSuggestions.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSearch(item.text)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${isSelected
                            ? 'bg-slate-100 text-slate-900'
                            : 'hover:bg-slate-50 text-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate">{item.text}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider shrink-0 hidden sm:inline">
                          {item.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  <p className="font-semibold text-slate-600">No direct suggestions found for &quot;{searchTerm}&quot;</p>
                  <button
                    type="button"
                    onClick={() => handleSelectSearch(searchTerm)}
                    className="mt-2 text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Search for &quot;{searchTerm}&quot; anyway</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* 2. When input is empty / initial focus: show Recent Searches + Popular Suggestions */
            <div className="space-y-4 p-1">
              {/* Recent Searches (if any) */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2.5 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSearch(term)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Services */}
              <div>
                <div className="px-2.5 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Trending &amp; Popular Services</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {POPULAR_SEARCHES.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearch(item)}
                      className="text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <span className="group-hover:text-emerald-600 transition-colors truncate">
                        {item}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
