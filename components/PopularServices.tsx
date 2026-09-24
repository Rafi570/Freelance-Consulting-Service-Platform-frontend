'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface PopularService {
  title: string;
  subtitle: string;
  category: string;
  searchTerm: string;
  image: string;
  bgGradient: string;
}

const POPULAR_SERVICES: PopularService[] = [
  {
    title: 'Website Development',
    subtitle: 'Build your web presence',
    category: 'Web Development',
    searchTerm: 'Website',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-emerald-900/80 via-black/40 to-transparent',
  },
  {
    title: 'Logo & Brand Identity',
    subtitle: 'Build your brand',
    category: 'Graphics & Design',
    searchTerm: 'Logo Design',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-orange-950/80 via-black/40 to-transparent',
  },
  {
    title: 'SEO & Search Growth',
    subtitle: 'Unlock organic growth',
    category: 'Digital Marketing',
    searchTerm: 'SEO',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-blue-950/80 via-black/40 to-transparent',
  },
  {
    title: 'AI & Machine Learning',
    subtitle: 'Automate & innovate',
    category: 'AI Services',
    searchTerm: 'AI',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-purple-950/80 via-black/40 to-transparent',
  },
  {
    title: 'Video & Animation',
    subtitle: 'Engage your audience',
    category: 'Video & Animation',
    searchTerm: 'Video Editing',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-rose-950/80 via-black/40 to-transparent',
  },
  {
    title: 'Business Consulting',
    subtitle: 'Scale your enterprise',
    category: 'Business Strategy',
    searchTerm: 'Consulting',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-slate-950/80 via-black/40 to-transparent',
  },
  {
    title: 'Content & Copywriting',
    subtitle: 'Words that convert',
    category: 'Writing & Translation',
    searchTerm: 'Copywriting',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-teal-950/80 via-black/40 to-transparent',
  },
  {
    title: 'Cloud & DevOps',
    subtitle: 'Architect resilient systems',
    category: 'Cloud Architecture',
    searchTerm: 'DevOps',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    bgGradient: 'from-cyan-950/80 via-black/40 to-transparent',
  },
];

export default function PopularServices() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Scroll Arrows */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Popular professional services
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-500">
              Vetted talent ready to execute your most critical projects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 transition shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center text-slate-600 transition shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {POPULAR_SERVICES.map((srv) => (
            <Link
              key={srv.title}
              href={`/gigs?category=${encodeURIComponent(srv.category)}&searchTerm=${encodeURIComponent(srv.searchTerm)}`}
              className="group relative flex-shrink-0 w-64 sm:w-72 h-84 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 snap-start transform hover:-translate-y-1"
            >
              {/* Image */}
              <Image
                src={srv.image}
                alt={srv.title}
                fill
                sizes="(max-width: 640px) 256px, 288px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${srv.bgGradient}`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Text content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                <div>
                  <span className="text-xs font-medium text-white/90 drop-shadow">
                    {srv.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-white drop-shadow mt-1 leading-snug">
                    {srv.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-[#1dbf73] transition-colors">
                  <span>Explore service</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
