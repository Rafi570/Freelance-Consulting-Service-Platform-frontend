'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroSearchWithSuggestions from '@/components/HeroSearchWithSuggestions';
import { getHeroData, IHeroDataResponse } from '@/lib/api';
import {
  ShieldCheck,
  Palette,
  Code2,
  TrendingUp,
  Briefcase,
  Video,
  FileText,
  Star,
  CheckCircle2,
  Bot,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Graphics & Design': Palette,
  'Programming & Tech': Code2,
  'Web Development': Code2,
  'Digital Marketing': TrendingUp,
  'Business & Consulting': Briefcase,
  'Video & Animation': Video,
  'Writing & Translation': FileText,
  'AI Services': Bot,
  'Finance & Accounting': DollarSign,
};

export default function HeroBanner() {
  const [heroData, setHeroData] = useState<IHeroDataResponse>({
    popularTags: [
      { label: 'Next.js & React', query: 'Next.js' },
      { label: 'Website Design', query: 'Website Design' },
      { label: 'Logo & Branding', query: 'Logo Design' },
      { label: 'AI Services', query: 'AI' },
      { label: 'Digital Marketing', query: 'Digital Marketing' },
      { label: 'Business Strategy', query: 'Business Strategy' },
    ],
    categories: [],
    stats: {
      totalTalent: 0,
      totalGigs: 0,
      completedOrders: 0,
    },
  });

  const [loadingHero, setLoadingHero] = useState<boolean>(true);

  // Fetch dynamic Hero data from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchHero = () => {
      getHeroData()
        .then((data) => {
          if (!isMounted) return;
          if (data) {
            setHeroData(data);
          }
        })
        .catch((err) => {
          console.error('Failed to load dynamic hero data:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingHero(false);
        });
    };

    fetchHero();

    const handleFocus = () => {
      fetchHero();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <section className="relative bg-[#04150c] text-white overflow-hidden">
      {/* Animated ambient blobs */}
      <div className="absolute -top-40 right-0 w-[520px] h-[520px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-0 -left-20 w-[420px] h-[420px] bg-[#1dbf73]/10 rounded-full blur-[150px] pointer-events-none animate-blob-2" />
      <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-teal-400/5 rounded-full blur-[130px] pointer-events-none animate-blob-3" />

      {/* Subtle animated dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none animate-grid-pan"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 relative z-10">

        {/* Centered, confident hero */}
        <div className="flex flex-col items-center text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Full-Service Freelance Marketplace &amp; Consulting</span>
            <span className="text-white/30">•</span>
            <span className="text-emerald-400 font-bold">{heroData.stats.completedOrders}+ Orders Done</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] max-w-3xl">
            Find the right{' '}
            <span className="font-serif italic font-normal text-emerald-400">freelance</span>{' '}
            service, right away
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/60 max-w-xl leading-relaxed">
            Hire vetted professionals for design, marketing, tech, business
            strategy, video, and writing — backed by milestone escrow protection.
          </p>

          {/* Dynamic Search with Backend API suggestions */}
          <div className="mt-8 w-full max-w-2xl">
            <HeroSearchWithSuggestions />
          </div>

          {/* Dynamic Popular Tags from Backend API */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-white/40 mr-1 text-xs font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Popular:
            </span>
            {heroData.popularTags.map((tag) => (
              <Link
                key={tag.query}
                href={`/gigs?searchTerm=${encodeURIComponent(tag.query)}`}
                className="px-3.5 py-1.5 rounded-full border border-white/10 text-white/70 hover:bg-white hover:text-[#04150c] hover:border-white transition-all text-xs font-medium"
              >
                {tag.label}
              </Link>
            ))}
          </div>

          {/* Trust badges with live platform stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Escrow Protection
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{heroData.stats.totalTalent}+ Vetted Consultants</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{heroData.stats.completedOrders}+ Verified Deliveries</span>
            </div>
          </div>
        </div>

        {/* Dynamic Category pill row from Backend API */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {heroData.categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || Layers;
            return (
              <Link
                key={cat.name}
                href={`/gigs?category=${encodeURIComponent(cat.name)}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-emerald-400/50 hover:bg-white/[0.08] transition-all"
              >
                <Icon className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                  {cat.name}
                </span>
                {typeof cat.count === 'number' && cat.count > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">
                    {cat.count}
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/gigs"
            className="px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:text-white transition-colors"
          >
            Browse all disciplines →
          </Link>
        </div>

        {/* Trust logos */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <span className="text-[11px] font-medium tracking-wider uppercase text-white/40">
            Trusted by teams worldwide
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 text-sm font-bold tracking-wide text-white/40">
            <span className="hover:text-white/80 transition-colors">META</span>
            <span className="hover:text-white/80 transition-colors">GOOGLE</span>
            <span className="hover:text-white/80 transition-colors">NETFLIX</span>
            <span className="hover:text-white/80 transition-colors">P&amp;G</span>
            <span className="hover:text-white/80 transition-colors">PAYPAL</span>
            <span className="hover:text-white/80 transition-colors">SPOTIFY</span>
          </div>
        </div>

      </div>
    </section>
  );
}