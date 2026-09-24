'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Headphones, 
  Star,
  Play,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function ValueProposition() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoModalOpen(false);
      }
    };
    if (isVideoModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVideoModalOpen]);

  const valuePoints = [
    {
      icon: CreditCard,
      title: 'The best for every budget',
      description: 'Find high-quality services at every price point. No hourly rates or surprise invoices, just transparent project-based pricing.',
    },
    {
      icon: Clock,
      title: 'Quality work done quickly',
      description: 'Filter through thousands of vetted freelancers and begin your project within minutes. Meet tight deadlines with confidence.',
    },
    {
      icon: ShieldCheck,
      title: 'Protected payments, every time',
      description: "Always know what you'll pay upfront. Funds are held safely in escrow and only released when you approve the final deliverables.",
    },
    {
      icon: Headphones,
      title: '24/7 round-the-clock support',
      description: 'Questions or need assistance with an order? Our dedicated support team is here to assist you anytime, day or night.',
    },
  ];

  return (
    <>
      <section className="w-full py-16 sm:py-24 bg-[#f1fdf7]/60 border-b border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Value points */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The ConsulSphere Guarantee</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  A whole world of freelance talent at your fingertips
                </h2>
                <p className="mt-3 text-base text-slate-600">
                  Scale your vision with world-class consultants and freelancers who deliver excellence at every step.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {valuePoints.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div key={point.title} className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 text-[#1dbf73] flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {point.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Workable Video Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div 
                onClick={() => setIsVideoModalOpen(true)}
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 aspect-video sm:aspect-4/3 group cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Play Customer Success Story Video"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsVideoModalOpen(true);
                  }
                }}
              >
                {/* Background Poster Image */}
                <Image
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                  alt="Freelance team collaboration"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Overlay with play action */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20 group-hover:from-black/90 group-hover:via-black/45 transition-colors duration-300 flex flex-col justify-between p-6">
                  
                  {/* Top Badge */}
                  <div className="flex justify-end">
                    <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>4.9 / 5 (120K+ reviews)</span>
                    </div>
                  </div>

                  {/* Center Interactive Play Button with Pulse Effect */}
                  <div className="self-center flex flex-col items-center gap-2">
                    <div className="relative">
                      {/* Outer pulse wave */}
                      <div className="absolute -inset-2 bg-emerald-400/30 rounded-full animate-ping opacity-75 pointer-events-none" />
                      
                      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/95 text-[#1dbf73] flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover:scale-115 group-hover:bg-[#1dbf73] group-hover:text-white transition-all duration-300 ring-4 ring-white/40">
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white/90 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs mt-1">
                      Click to Watch Story
                    </span>
                  </div>

                  {/* Bottom Story Info */}
                  <div className="text-white">
                    <span className="inline-block px-2.5 py-0.5 rounded-sm bg-[#1dbf73] text-[11px] font-bold uppercase tracking-wider text-white mb-1.5">
                      Customer Success Story
                    </span>
                    <p className="text-sm sm:text-base font-bold text-white leading-snug">
                      &quot;ConsulSphere enabled our startup to launch 3x faster.&quot;
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      Kaylee Astle, Co-Founder of Bling
                    </p>
                  </div>

                </div>
              </div>

              {/* Floating Trust Card (Escrow) */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-xl border border-slate-100 flex items-center gap-3 pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1dbf73] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">100% Escrow Protection</p>
                  <p className="text-[11px] text-slate-500">Funds released upon approval</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Workable Video Player Modal (Fiverr Style) */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-900/90 border-b border-white/10 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1dbf73] animate-pulse" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    How Bling Scaled 10x with ConsulSphere Freelancers
                  </h3>
                  <p className="text-xs text-slate-400">
                    Featuring Kaylee Astle • Co-Founder of Bling
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsVideoModalOpen(false)}
                aria-label="Close video"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Container (16:9 Aspect Ratio) */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/n3Xv_g3g-mA?autoplay=1&rel=0&modestbranding=1"
                title="ConsulSphere Customer Success Story Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Bottom Modal Footer with Quote & Action */}
            <div className="px-5 sm:px-6 py-4 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:inline" />
                <span>
                  &quot;ConsulSphere gave us the agility of a 50-person engineering team without the hiring overhead.&quot;
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/gigs"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="bg-[#1dbf73] hover:bg-[#19a463] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Explore Freelancers</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
