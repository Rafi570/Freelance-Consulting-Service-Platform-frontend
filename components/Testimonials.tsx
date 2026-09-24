import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
  rating: number;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'ConsulSphere gave our startup access to Silicon Valley-level design and engineering without the 6-month recruiting cycle. We launched our core MVP 3 weeks ahead of schedule.',
    author: 'Kaylee Astle',
    role: 'Co-founder & CEO',
    company: 'Bling Financial',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    quote:
      'The milestone escrow protection gave our leadership team complete peace of mind. Every single deliverable was inspected before payments were released.',
    author: 'Marcus Vance',
    role: 'VP of Engineering',
    company: 'CloudScale Technologies',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    quote:
      'Finding top-tier SEO specialists and copywriters was effortless. Our organic search revenue grew by 240% within four months of our first consultation on ConsulSphere.',
    author: 'Elena Rostova',
    role: 'Head of Growth',
    company: 'Artisan Studio',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="w-full py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1dbf73] font-mono">
            Client Success Stories
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Real stories from real businesses
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            See how forward-thinking teams use ConsulSphere freelancers to accelerate their growth
          </p>
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Stars and Quote Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-300" />
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-6">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/60">
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image
                    src={t.image}
                    alt={t.author}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {t.author}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {t.role} • <span className="font-semibold text-slate-700">{t.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
