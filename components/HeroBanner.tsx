import Link from 'next/link';
import { 
  Search, 
  ShieldCheck, 
  Palette, 
  Code2, 
  TrendingUp, 
  Briefcase, 
  Video, 
  FileText,
  Star,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function HeroBanner() {
  const popularTags = [
    { label: 'Website Design', query: 'Website Design' },
    { label: 'Logo & Branding', query: 'Logo Design' },
    { label: 'SEO & Marketing', query: 'Digital Marketing' },
    { label: 'Web & App Dev', query: 'Web Development' },
    { label: 'Business Strategy', query: 'Business Strategy' },
    { label: 'Video Editing', query: 'Video & Animation' },
  ];

  const serviceCategories = [
    {
      title: 'Graphics & Design',
      sub: 'Logo, Branding, UI/UX & 3D',
      icon: Palette,
      gigs: '15k+ Services',
      rating: '4.9',
      bg: 'from-pink-500/10 to-rose-500/5',
      border: 'border-pink-500/20 hover:border-pink-400',
      iconColor: 'text-pink-400 bg-pink-500/10',
      href: '/gigs?category=Graphics+%26+Design',
    },
    {
      title: 'Programming & Tech',
      sub: 'Web, Mobile Apps & Cloud',
      icon: Code2,
      gigs: '18k+ Services',
      rating: '4.98',
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-400',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      href: '/gigs?category=Web+Development',
    },
    {
      title: 'Digital Marketing',
      sub: 'SEO, Social Ads & Growth',
      icon: TrendingUp,
      gigs: '12k+ Services',
      rating: '4.85',
      bg: 'from-amber-500/10 to-yellow-500/5',
      border: 'border-amber-500/20 hover:border-amber-400',
      iconColor: 'text-amber-400 bg-amber-500/10',
      href: '/gigs?category=Digital+Marketing',
    },
    {
      title: 'Business & Consulting',
      sub: 'Finance, Strategy & Legal',
      icon: Briefcase,
      gigs: '8k+ Services',
      rating: '5.0',
      bg: 'from-blue-500/10 to-indigo-500/5',
      border: 'border-blue-500/20 hover:border-blue-400',
      iconColor: 'text-blue-400 bg-blue-500/10',
      href: '/gigs?category=Business+Strategy',
    },
    {
      title: 'Video & Animation',
      sub: 'Explainer, 3D & Reels',
      icon: Video,
      gigs: '9k+ Services',
      rating: '4.92',
      bg: 'from-purple-500/10 to-violet-500/5',
      border: 'border-purple-500/20 hover:border-purple-400',
      iconColor: 'text-purple-400 bg-purple-500/10',
      href: '/gigs?category=Video+%26+Animation',
    },
    {
      title: 'Writing & Translation',
      sub: 'Copywriting, Blogs & Books',
      icon: FileText,
      gigs: '11k+ Services',
      rating: '4.9',
      bg: 'from-cyan-500/10 to-sky-500/5',
      border: 'border-cyan-500/20 hover:border-cyan-400',
      iconColor: 'text-cyan-400 bg-cyan-500/10',
      href: '/gigs?category=Writing+%26+Translation',
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-[#01220d] via-[#023317] to-[#011809] text-white overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[500px] h-[450px] bg-[#1dbf73]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pt-18 sm:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Search & Popular Filters */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            
            {/* Top Marketplace Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-xs font-semibold text-emerald-300 w-fit backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Service Freelance Marketplace &amp; Consulting</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Find the right{' '}
              <span className="font-serif italic font-normal text-emerald-400">
                freelance
              </span>{' '}
              service, right away
            </h1>

            {/* Sub-headline explicitly indicating ALL service types */}
            <p className="text-base sm:text-lg text-emerald-100/80 max-w-xl font-normal leading-relaxed">
              Hire vetted freelance professionals for design, marketing, tech, business strategy, video, and writing — backed by milestone escrow protection.
            </p>

            {/* Fiverr-Style Live Search Form (Pure Server Component) */}
            <form action="/gigs" method="GET" className="w-full max-w-xl pt-2">
              <div className="flex items-center rounded-xl bg-white overflow-hidden shadow-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
                <div className="flex items-center flex-1 px-3 py-2">
                  <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    name="searchTerm"
                    placeholder="Search for any service (e.g. Logo Design, SEO, Web App)..."
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#1dbf73] hover:bg-[#19a463] text-white px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors duration-200 flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                >
                  <span className="hidden sm:inline">Search</span>
                  <Search className="w-5 h-5 sm:hidden" />
                </button>
              </div>
            </form>

            {/* Popular Search Tags covering ALL disciplines */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs sm:text-sm text-emerald-200/90">
              <span className="font-semibold text-white">Popular:</span>
              {popularTags.map((tag) => (
                <Link
                  key={tag.query}
                  href={`/gigs?searchTerm=${encodeURIComponent(tag.query)}`}
                  className="px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-100 hover:bg-white hover:text-[#013914] transition-all text-xs font-medium"
                >
                  {tag.label}
                </Link>
              ))}
            </div>

            {/* Value Guarantees */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Escrow Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Talent</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span>Transparent 3-Tier Packages</span>
              </div>
            </div>

          </div>

          {/* Right Column: Multi-Discipline Freelance Categories Mosaic (Shows all services!) */}
          <div className="lg:col-span-6">
            <div className="p-4 sm:p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-xl shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
                  Explore by Service Category
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  Over 100,000+ Services
                </span>
              </div>

              {/* 2x3 Grid of Diverse Freelance Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.title}
                      href={cat.href}
                      className={`group p-3.5 rounded-2xl bg-gradient-to-br ${cat.bg} border ${cat.border} hover:scale-[1.02] transition-all duration-200 flex items-start gap-3`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${cat.iconColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {cat.title}
                        </h3>
                        <p className="text-[11px] text-emerald-100/70 truncate mt-0.5">
                          {cat.sub}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-300/80">
                          <span className="font-semibold">{cat.gigs}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                            ★ {cat.rating}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Category CTA */}
              <div className="mt-4 pt-3 border-t border-emerald-800/40 flex items-center justify-between text-xs">
                <span className="text-emerald-200/80">
                  Need a tailored consulting package?
                </span>
                <Link
                  href="/gigs"
                  className="font-bold text-emerald-300 hover:text-white underline transition-colors"
                >
                  Browse all 20+ disciplines →
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* Fiverr Trust Logos Bar */}
        <div className="mt-16 pt-8 border-t border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-emerald-200/70 text-xs">
          <span className="font-medium tracking-wider uppercase text-emerald-300">
            Trusted by teams worldwide:
          </span>
          <div className="flex flex-wrap items-center gap-8 sm:gap-12 font-bold tracking-widest text-sm text-white/85">
            <span className="hover:text-emerald-400 transition-colors">META</span>
            <span className="hover:text-emerald-400 transition-colors">GOOGLE</span>
            <span className="hover:text-emerald-400 transition-colors">NETFLIX</span>
            <span className="hover:text-emerald-400 transition-colors">P&amp;G</span>
            <span className="hover:text-emerald-400 transition-colors">PAYPAL</span>
            <span className="hover:text-emerald-400 transition-colors">SPOTIFY</span>
          </div>
        </div>

      </div>
    </section>
  );
}
