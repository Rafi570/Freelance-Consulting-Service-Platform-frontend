import React from 'react';

import { Users, Globe2, Trophy } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
        
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1dbf73]/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Empowering global <span className="text-[#1dbf73]">consultants</span> and businesses.
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              ConsulSphere is the premier platform connecting top-tier technical consultants and strategists with businesses that need expert guidance.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Global Reach</h3>
              <p className="text-slate-600 leading-relaxed">
                We break down geographical barriers, allowing businesses to hire the best consultants from anywhere in the world.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Top Quality</h3>
              <p className="text-slate-600 leading-relaxed">
                Our platform features highly vetted professionals specializing in Cloud Architecture, AI, and Tech Strategy.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Secure Collaboration</h3>
              <p className="text-slate-600 leading-relaxed">
                With Stripe Escrow Protection and dedicated workspaces, both clients and providers are guaranteed a secure experience.
              </p>
            </div>
          </div>
        </section>

      </div>
  );
}
