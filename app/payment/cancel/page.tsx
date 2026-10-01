'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PaymentCancelPage() {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowError(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-lg z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
          
          {/* Main Card */}
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#e4e5e7] overflow-hidden">
            
            {/* Top Rose Accent Bar */}
            <div className="h-2 w-full bg-rose-500" />

            <div className="p-8 md:p-12 text-center space-y-6">
              
              {/* Animated Icon */}
              <div className="relative w-24 h-24 mx-auto">
                <div className={`absolute inset-0 bg-rose-50 rounded-full transition-transform duration-700 ease-out ${showError ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 delay-100 ${showError ? 'scale-100' : 'scale-0'}`}>
                  <XCircle className="w-12 h-12 text-rose-500" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-black text-[#222325] tracking-tight">Payment Cancelled</h1>
                <p className="text-[#74767e] text-sm leading-relaxed max-w-sm mx-auto">
                  Your checkout process was safely interrupted. No charges were made to your account.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 space-y-3">
                <Link
                  href="/dashboard"
                  className="w-full py-4 px-6 rounded-xl bg-[#222325] hover:bg-[#404145] text-white text-sm font-black transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(34,35,37,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(34,35,37,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Return to Dashboard</span>
                </Link>
                
                <Link
                  href="/gigs"
                  className="w-full py-4 px-6 rounded-xl border border-[#e4e5e7] text-[#74767e] hover:text-[#222325] hover:bg-[#fafafa] text-sm font-bold transition-colors flex items-center justify-center"
                >
                  Browse Gigs
                </Link>
              </div>

            </div>
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
