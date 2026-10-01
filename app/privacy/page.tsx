import React from 'react';

import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 lg:py-24 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-[#1dbf73]/10 text-[#1dbf73] rounded-2xl mb-2">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Your privacy is our priority. Learn how ConsulSphere protects and handles your personal information.
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider pt-4">Last Updated: October 1, 2026</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-12">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#1dbf73]" />
                1. Information We Collect
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed">
                <p>
                  When you use ConsulSphere, we collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us.
                </p>
                <ul className="list-none space-y-2 pl-0">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#1dbf73] shrink-0 mt-0.5" />
                    <span><strong>Account Information:</strong> Name, email address, password, profile picture, and role preferences.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#1dbf73] shrink-0 mt-0.5" />
                    <span><strong>Transaction Information:</strong> Payment details, order history, and billing addresses securely processed via Stripe.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Lock className="w-6 h-6 text-[#1dbf73]" />
                2. How We Use Your Information
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed">
                <p>
                  We use the information we collect to provide, maintain, and improve our services. Specifically, we use your information to:
                </p>
                <ul className="list-disc pl-5 space-y-2 marker:text-slate-300">
                  <li>Process payments and escrow transactions securely.</li>
                  <li>Facilitate communication between Clients and Providers.</li>
                  <li>Monitor and analyze trends, usage, and activities.</li>
                  <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
                </ul>
              </div>
            </section>

            <hr className="border-slate-100" />

            <div className="bg-slate-50 rounded-2xl p-6 text-center">
              <p className="text-slate-600 font-medium">Have questions about your privacy?</p>
              <a href="/support" className="inline-block mt-3 text-[#1dbf73] font-bold hover:underline">
                Contact our Privacy Team &rarr;
              </a>
            </div>

          </div>
        </div>
      </div>
  );
}
