import React from 'react';
import { Search, FileEdit, MessageSquare, CheckCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Discover & Compare',
      desc: 'Browse through thousands of verified gigs, compare transparent 3-tier packages, and read genuine client reviews.',
      icon: Search,
    },
    {
      number: '02',
      title: 'Order & Brief',
      desc: 'Select your package, share your detailed project requirements, and set your delivery timeline with your consultant.',
      icon: FileEdit,
    },
    {
      number: '03',
      title: 'Collaborate in Real-Time',
      desc: 'Work directly with your freelancer, track milestone progress, exchange files, and request revisions with zero friction.',
      icon: MessageSquare,
    },
    {
      number: '04',
      title: 'Approve & Release Funds',
      desc: 'Inspect your completed deliverables. Your payment is safely released from escrow only when you are 100% satisfied.',
      icon: CheckCheck,
    },
  ];

  return (
    <section className="w-full py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1dbf73] font-mono">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            How ConsulSphere works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Getting high-quality freelance work done has never been this seamless and secure.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.number}
                className="relative bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-black text-slate-200 font-mono">
                      {st.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1dbf73] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {st.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
