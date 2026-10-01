'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { verifyPaymentSession } from '@/lib/api';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [showConfetti, setShowConfetti] = useState(false);
  const { user, isHydrated } = useAuth();
  const router = useRouter();

  const isClient = user?.role === 'CLIENT';

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/');
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    // Small delay for the pop-in animation
    const timer = setTimeout(() => setShowConfetti(true), 300);
    
    // Verify payment automatically
    if (sessionId) {
      verifyPaymentSession(sessionId).catch(console.error);
    }
    
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1dbf73]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-lg z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
          
          {/* Main Card */}
          <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-[#e4e5e7] overflow-hidden">
            
            {/* Top Green Accent Bar */}
            <div className="h-2 w-full bg-[#1dbf73]" />

            <div className="p-8 md:p-12 text-center space-y-6">
              
              {/* Animated Icon */}
              <div className="relative w-24 h-24 mx-auto">
                <div className={`absolute inset-0 bg-emerald-100 rounded-full transition-transform duration-700 ease-out ${showConfetti ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 delay-200 ${showConfetti ? 'scale-100' : 'scale-0'}`}>
                  <CheckCircle2 className="w-12 h-12 text-[#1dbf73]" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-black text-[#222325] tracking-tight">Payment Successful!</h1>
                <p className="text-[#74767e] text-sm leading-relaxed max-w-sm mx-auto">
                  Your payment has been securely processed. The consultant has been notified and will begin work on your order shortly.
                </p>
              </div>

              {/* Receipt / Details Box */}
              <div className="bg-[#fafafa] border border-[#f0f1f3] rounded-2xl p-5 mt-8 text-left space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-[#f0f1f3] pb-3">
                  <span className="font-bold text-[#74767e] uppercase tracking-wider">Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-[#1dbf73] uppercase tracking-wide">
                    <CheckCircle2 className="w-3 h-3" />
                    Paid
                  </span>
                </div>
                
                {sessionId && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-[#b5b6ba] uppercase tracking-wider block">Transaction ID</span>
                    <span className="text-xs font-mono text-[#404145] break-all bg-white px-2 py-1 rounded-md border border-[#e4e5e7] block">
                      {sessionId}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-3">
                <Link
                  href={isClient ? "/orders" : "/dashboard"}
                  className="w-full py-4 px-6 rounded-xl bg-[#1dbf73] hover:bg-[#19a463] text-white text-sm font-black transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(29,191,115,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(29,191,115,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <span>{isClient ? "Go to My Orders" : "Go to Dashboard"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/gigs"
                  className="w-full py-4 px-6 rounded-xl border border-[#e4e5e7] text-[#74767e] hover:text-[#222325] hover:bg-[#fafafa] hover:border-[#c5c6c9] text-sm font-bold transition-colors flex items-center justify-center"
                >
                  Explore More Gigs
                </Link>
              </div>

            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs font-semibold text-[#b5b6ba]">
              Secure payment processed via Stripe <br className="sm:hidden"/> 
              <span className="hidden sm:inline"> • </span> 
              ConsulSphere Escrow Guarantee
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
