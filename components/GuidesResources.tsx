import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';

interface GuideItem {
  title: string;
  category: string;
  readTime: string;
  image: string;
  excerpt: string;
  href: string;
}

const GUIDES: GuideItem[] = [
  {
    title: 'How to Build and Launch a High-Converting SaaS Landing Page',
    category: 'Web Development',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=600&q=80',
    excerpt: 'Key design patterns, copy frameworks, and call-to-actions that drive actual software subscriptions.',
    href: '/gigs?category=Web+Development',
  },
  {
    title: '10 Essential Branding Strategies Every New Startup Needs in 2026',
    category: 'Branding & Design',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80',
    excerpt: 'From typography pairing to color psychology, discover how to establish a memorable market presence.',
    href: '/gigs?category=Graphics+%26+Design',
  },
  {
    title: "The Founder's Playbook: Managing Remote Freelancers Effectively",
    category: 'Business Growth',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    excerpt: 'Proven frameworks for asynchronous communication, sprint planning, and escrow milestones.',
    href: '/gigs?category=Business+Strategy',
  },
];

export default function GuidesResources() {
  return (
    <section className="w-full py-16 sm:py-20 bg-slate-50/50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1dbf73] font-mono mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ConsulSphere Guides</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inspiring guides to grow your business
            </h2>
          </div>

          <Link
            href="/gigs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1dbf73] hover:text-[#19a463] transition-colors"
          >
            <span>See more guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {GUIDES.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/70 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col"
            >
              {/* Cover Image */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                <Image
                  src={guide.image}
                  alt={guide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {guide.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{guide.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#1dbf73] transition-colors leading-snug">
                    {guide.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#1dbf73]">
                  <span>Read full guide</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
