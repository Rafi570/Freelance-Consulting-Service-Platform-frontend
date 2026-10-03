'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import ChartsSection from '@/components/dashboard/ChartsSection';
import ProjectsTable from '@/components/dashboard/ProjectsTable';
import OrdersOverview from '@/components/dashboard/OrdersOverview';
import { getDashboardStats, IDashboardStats } from '@/lib/api';
import {
  Wallet,
  Users,
  Eye,
  ShoppingBag,
  CreditCard,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Bookmark,
  Landmark,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface DashboardPageProps {
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}

export default function DashboardPage({ role = 'PROVIDER' }: DashboardPageProps) {
  const [statsData, setStatsData] = useState<IDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStatsData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}k`;
    }
    return `$${val}`;
  };

  const formatNumber = (val: number) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toString();
  };

  // Stat cards configurations tailored to the selected role
  const getStatCards = () => {
    if (role === 'SUPER_ADMIN') {
      return [
        {
          title: "Today's Money",
          value: statsData ? formatCurrency(statsData.stats.stat1) : "...",
          change: "Today",
          isPositive: true,
          timeframe: "total revenue",
          icon: Landmark,
        },
        {
          title: "Total Users",
          value: statsData ? formatNumber(statsData.stats.stat2) : "...",
          change: "Overall",
          isPositive: true,
          timeframe: "registered users",
          icon: Users,
        },
        {
          title: "Active Gigs",
          value: statsData ? formatNumber(statsData.stats.stat3) : "...",
          change: "Currently",
          isPositive: true,
          timeframe: "published services",
          icon: Eye,
        },
        {
          title: "Sales (Revenue)",
          value: statsData ? formatCurrency(statsData.stats.stat4) : "...",
          change: "Lifetime",
          isPositive: true,
          timeframe: "total platform sales",
          icon: ShoppingBag,
        },
      ];
    }

    if (role === 'CLIENT') {
      return [
        {
          title: "Total Spent",
          value: statsData ? formatCurrency(statsData.stats.stat1) : "...",
          change: "Lifetime",
          isPositive: true,
          timeframe: "investment",
          icon: CreditCard,
        },
        {
          title: "Active Orders",
          value: statsData ? formatNumber(statsData.stats.stat2) : "...",
          change: "Currently",
          isPositive: true,
          timeframe: "in progress",
          icon: ShoppingBag,
        },
        {
          title: "Total Orders",
          value: statsData ? formatNumber(statsData.stats.stat3) : "...",
          change: "Lifetime",
          isPositive: true,
          timeframe: "purchases made",
          icon: Bookmark,
        },
        {
          title: "Completed Projects",
          value: statsData ? formatNumber(statsData.stats.stat4) : "...",
          change: "Successfully",
          isPositive: true,
          timeframe: "delivered",
          icon: CheckCircle2,
        },
      ];
    }

    // Default: PROVIDER (matches exactly the values and labels from the user screenshot!)
    return [
      {
        title: "Today's Earnings",
        value: statsData ? formatCurrency(statsData.stats.stat1) : "...",
        change: "Today",
        isPositive: true,
        timeframe: "revenue generated",
        icon: Wallet,
      },
      {
        title: "Unique Clients",
        value: statsData ? formatNumber(statsData.stats.stat2) : "...",
        change: "Lifetime",
        isPositive: true,
        timeframe: "buyers",
        icon: Users,
      },
      {
        title: "Total Gigs",
        value: statsData ? formatNumber(statsData.stats.stat3) : "...",
        change: "Created",
        isPositive: true,
        timeframe: "services offered",
        icon: Eye,
      },
      {
        title: "Total Sales",
        value: statsData ? formatCurrency(statsData.stats.stat4) : "...",
        change: "Lifetime",
        isPositive: true,
        timeframe: "revenue",
        icon: ShoppingBag,
      },
    ];
  };

  const stats = getStatCards();

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Top Stat Cards (4 in a row, matching screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            isPositive={stat.isPositive}
            timeframe={stat.timeframe}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Quick Action: Gigs Management Banner */}
      <div className="rounded-2xl p-4 sm:p-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Briefcase className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>{role === 'SUPER_ADMIN' ? 'Manage Platform Gigs' : 'Launch a New Consulting Gig'}</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Webdevelopment Ready
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {role === 'SUPER_ADMIN'
                ? 'Review active categories, moderate provider listings, and configure Basic, Standard, and Premium packages.'
                : 'Offer professional web development services with tiered pricing (Basic, Standard & Premium) to attract clients.'}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/gigs"
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
        >
          <span>{role === 'SUPER_ADMIN' ? 'Manage Gigs' : '+ Create & View Gigs'}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. Middle Row: 3 Chart Cards (Website Views, Daily Sales, Completed Tasks) */}
      <ChartsSection role={role} barChartData={statsData?.barChart} />

      {/* 3. Bottom Row: Projects Table + Orders Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left wider card: Projects Table */}
        <div className="lg:col-span-2">
          <ProjectsTable role={role} projects={statsData?.projects} />
        </div>

        {/* Right card: Orders Overview Timeline */}
        <div className="lg:col-span-1">
          <OrdersOverview role={role} timeline={statsData?.timeline} />
        </div>
      </div>
    </div>
  );
}
