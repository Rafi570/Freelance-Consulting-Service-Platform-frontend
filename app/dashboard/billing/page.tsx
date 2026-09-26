'use client';

import React from 'react';
import { CreditCard, ArrowUpRight, DollarSign, Download, CheckCircle2 } from 'lucide-react';

export default function DashboardBillingPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Card preview */}
        <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between h-56 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between z-10">
            <span className="font-bold text-xs uppercase tracking-widest text-slate-400">ConsulSphere Pay</span>
            <CreditCard className="w-6 h-6 text-slate-300" />
          </div>

          <div className="z-10">
            <p className="font-mono text-lg tracking-widest">•••• •••• •••• 7852</p>
            <div className="flex justify-between items-end mt-4 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Card Holder</p>
                <p className="font-bold">Nafi Mahmud</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Expires</p>
                <p className="font-bold">11/28</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payout balance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Available for Payout</span>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">$2,450.00</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready to withdraw
            </p>
          </div>
          <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md">
            Withdraw Funds
          </button>
        </div>

        {/* Invoices summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Lifetime Earnings</span>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">$53,420.00</h3>
            <p className="text-xs text-slate-400 mt-1">Across 86 completed orders</p>
          </div>
          <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-xs">
            <Download className="w-3.5 h-3.5" /> Download Tax Statement
          </button>
        </div>
      </div>
    </div>
  );
}
