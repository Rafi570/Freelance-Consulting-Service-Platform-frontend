'use client';

import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ChartsSection from '@/components/dashboard/ChartsSection';
import ProjectsTable from '@/components/dashboard/ProjectsTable';
import OrdersOverview from '@/components/dashboard/OrdersOverview';
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
  Landmark
} from 'lucide-react';

interface DashboardPageProps {
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}

export default function DashboardPage({ role = 'PROVIDER' }: DashboardPageProps) {
  // Stat cards configurations tailored to the selected role
  const getStatCards = () => {
    if (role === 'SUPER_ADMIN') {
      return [
        {
          title: "Today's Money",
          value: "$53k",
          change: "+55%",
          isPositive: true,
          timeframe: "than last week",
          icon: Landmark,
        },
        {
          title: "Today's Users",
          value: "2300",
          change: "+3%",
          isPositive: true,
          timeframe: "than last month",
          icon: Users,
        },
        {
          title: "Ads Views",
          value: "3,462",
          change: "-2%",
          isPositive: false,
          timeframe: "than yesterday",
          icon: Eye,
        },
        {
          title: "Sales",
          value: "$103,430",
          change: "+5%",
          isPositive: true,
          timeframe: "than yesterday",
          icon: ShoppingBag,
        },
      ];
    }

    if (role === 'CLIENT') {
      return [
        {
          title: "Total Spent",
          value: "$4,850",
          change: "+12%",
          isPositive: true,
          timeframe: "than last month",
          icon: CreditCard,
        },
        {
          title: "Active Orders",
          value: "3",
          change: "1 arriving",
          isPositive: true,
          timeframe: "today",
          icon: ShoppingBag,
        },
        {
          title: "Saved Experts",
          value: "24",
          change: "+4 new",
          isPositive: true,
          timeframe: "this week",
          icon: Bookmark,
        },
        {
          title: "Completed Projects",
          value: "18",
          change: "100%",
          isPositive: true,
          timeframe: "satisfaction",
          icon: CheckCircle2,
        },
      ];
    }

    // Default: PROVIDER (matches exactly the values and labels from the user screenshot!)
    return [
      {
        title: "Today's Money",
        value: "$53k",
        change: "+55%",
        isPositive: true,
        timeframe: "than last week",
        icon: Wallet,
      },
      {
        title: "Today's Users",
        value: "2300",
        change: "+3%",
        isPositive: true,
        timeframe: "than last month",
        icon: Users,
      },
      {
        title: "Ads Views",
        value: "3,462",
        change: "-2%",
        isPositive: false,
        timeframe: "than yesterday",
        icon: Eye,
      },
      {
        title: "Sales",
        value: "$103,430",
        change: "+5%",
        isPositive: true,
        timeframe: "than yesterday",
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

      {/* 2. Middle Row: 3 Chart Cards (Website Views, Daily Sales, Completed Tasks) */}
      <ChartsSection role={role} />

      {/* 3. Bottom Row: Projects Table + Orders Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left wider card: Projects Table */}
        <div className="lg:col-span-2">
          <ProjectsTable role={role} />
        </div>

        {/* Right card: Orders Overview Timeline */}
        <div className="lg:col-span-1">
          <OrdersOverview role={role} />
        </div>
      </div>
    </div>
  );
}
