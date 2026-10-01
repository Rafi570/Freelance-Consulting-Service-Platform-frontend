'use client';

import React, { useState } from 'react';

import { HelpCircle, Mail, MessageSquare, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 lg:py-24 font-sans">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-rose-100 text-rose-600 rounded-2xl mb-2">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Help & Support</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Need help with an order, a refund, or your account? Our support team is here for you 24/7.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
                <p className="text-slate-500">We've received your request and will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">How can we help?</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] transition-colors">
                    <option>I need help with a recent order</option>
                    <option>I want to request a refund</option>
                    <option>I want to appeal an account ban</option>
                    <option>I have a billing or payment question</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input required type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message Details</label>
                  <textarea required rows={5} placeholder="Please provide as much detail as possible..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] transition-colors resize-none"></textarea>
                </div>

                <button type="submit" className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Send Support Request</span>
                </button>
                
                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Support response times are typically under 24 hours.</span>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
  );
}
