import React from 'react';

import { Scale, BookOpen, AlertTriangle } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 lg:py-24 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-2xl mb-2">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Please read these terms carefully before using the ConsulSphere platform.
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider pt-4">Effective Date: October 1, 2026</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-indigo-500" />
                1. Acceptance of Terms
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed">
                <p>
                  By accessing and using ConsulSphere, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                2. User Conduct & Responsibilities
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed">
                <p>
                  Users of ConsulSphere are expected to maintain professional conduct. You agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2 marker:text-slate-300">
                  <li>Violate any local, state, national, or international law.</li>
                  <li>Harass, abuse, or harm another person or group.</li>
                  <li>Provide false or misleading information in your profile or gigs.</li>
                  <li>Attempt to bypass the platform's payment escrow system.</li>
                </ul>
              </div>
            </section>
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                3. Payments & Escrow
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed">
                <p>
                  All payments are held securely in escrow via Stripe until the service is delivered and marked as completed. Funds are released to the Provider upon successful completion. Refunds are subject to the ConsulSphere dispute resolution process.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
  );
}
