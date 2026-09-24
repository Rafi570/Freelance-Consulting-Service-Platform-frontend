import React from 'react';
import Link from 'next/link';
import { 
  Crown, 
  UserCheck, 
  Users, 
  Layers, 
  CreditCard, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function ConsulSpherePro() {
  const proFeatures = [
    {
      icon: UserCheck,
      title: 'Dedicated Project Partner',
      desc: 'Get matched with a dedicated account manager who understands your business goals and assembles the right team.',
    },
    {
      icon: Crown,
      title: 'Top 1% Vetted Talent',
      desc: 'Work exclusively with pre-vetted consultants and freelancers who have verified enterprise track records.',
    },
    {
      icon: Users,
      title: 'Team Collaboration Hub',
      desc: 'Invite team members, assign project permissions, and collaborate seamlessly in a unified shared workspace.',
    },
    {
      icon: CreditCard,
      title: 'Consolidated Billing & Escrow',
      desc: 'Simplify your accounting with unified monthly invoicing, custom enterprise contracts, and milestone protection.',
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 bg-[#0a192f] text-white overflow-hidden relative">
      {/* Background ambient accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1dbf73]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-bold text-emerald-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>ConsulSphere Pro</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            A premium freelance solution for modern businesses
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Upgrade to a curated enterprise experience packed with dedicated project managers, pre-screened elite talent, and advanced team collaboration tools.
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {proFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#1dbf73] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-emerald-950/70 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-white">
              Ready to scale your business with dedicated Pro consultants?
            </h4>
            <p className="text-sm text-emerald-200/80">
              Speak with a dedicated business specialist today and get tailored project estimates.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/gigs"
              className="inline-flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg hover:shadow-emerald-500/25 cursor-pointer"
            >
              <span>Explore Pro Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
