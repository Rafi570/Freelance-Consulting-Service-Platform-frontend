'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CallToAction() {
  const { user, openAuthModal } = useAuth();

  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-r from-[#012f12] via-[#025220] to-[#01220d] text-white relative overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px] bg-[#1dbf73]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Start Building Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Suddenly everything is{' '}
            <span className="font-serif italic font-normal text-emerald-400">
              do-able.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-emerald-100/80 max-w-xl mx-auto">
            Find the perfect freelance service for your next big idea, project, or enterprise breakthrough.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user ? (
              <button
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto bg-[#1dbf73] hover:bg-[#19a463] text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 shadow-xl hover:shadow-emerald-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Join ConsulSphere</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/gigs"
                className="w-full sm:w-auto bg-[#1dbf73] hover:bg-[#19a463] text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 shadow-xl hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>Browse All Gigs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/gigs"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors duration-200 backdrop-blur-sm"
            >
              Explore Services
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
