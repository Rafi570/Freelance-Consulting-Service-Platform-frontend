import React from 'react';
import Link from 'next/link';
import { 
  Palette, 
  Code2, 
  TrendingUp, 
  Video, 
  FileText, 
  Headphones, 
  Briefcase, 
  Sparkles, 
  BadgeDollarSign, 
  Camera 
} from 'lucide-react';

interface CategoryItem {
  name: string;
  query: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryItem[] = [
  { name: 'Graphics & Design', query: 'Graphics & Design', icon: Palette },
  { name: 'Programming & Tech', query: 'Web Development', icon: Code2 },
  { name: 'Digital Marketing', query: 'Digital Marketing', icon: TrendingUp },
  { name: 'Video & Animation', query: 'Video & Animation', icon: Video },
  { name: 'Writing & Translation', query: 'Writing & Translation', icon: FileText },
  { name: 'Music & Audio', query: 'Music & Audio', icon: Headphones },
  { name: 'Business & Consulting', query: 'Business Strategy', icon: Briefcase },
  { name: 'AI Services', query: 'AI Services', icon: Sparkles },
  { name: 'Finance & Accounting', query: 'Finance & Accounting', icon: BadgeDollarSign },
  { name: 'Photography & Media', query: 'Photography & Media', icon: Camera },
];

export default function ExploreMarketplace() {
  return (
    <section className="w-full py-16 sm:py-20 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore the marketplace
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-500">
            Browse through hundreds of specialized disciplines to find your ideal match
          </p>
        </div>

        {/* 10-Item Grid (5 columns on desktop, 2-3 on tablet/mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/gigs?category=${encodeURIComponent(cat.query)}`}
                className="group flex flex-col items-center text-center p-4 rounded-xl hover:bg-slate-50 transition-all duration-200"
              >
                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-700 group-hover:text-[#1dbf73] transition-colors duration-200">
                  <Icon className="w-10 h-10 stroke-[1.5]" />
                </div>

                {/* Subtle Divider (Fiverr's signature detail: grey line turns green on hover) */}
                <div className="w-10 h-0.5 bg-slate-200 group-hover:bg-[#1dbf73] group-hover:w-14 transition-all duration-300 my-3 rounded-full" />

                {/* Category Name */}
                <span className="text-sm font-semibold text-slate-800 group-hover:text-[#1dbf73] transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
