'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface ChartsSectionProps {
  role?: 'PROVIDER' | 'SUPER_ADMIN' | 'CLIENT';
}

export default function ChartsSection({ role = 'PROVIDER' }: ChartsSectionProps) {
  // Configurable labels based on role
  const chart1Title = role === 'SUPER_ADMIN' ? 'Platform Traffic' : role === 'CLIENT' ? 'Consultation Hours' : 'Website Views';
  const chart1Subtitle = 'Last Campaign Performance';
  const chart1Footer = 'campaign sent 2 days ago';

  const chart2Title = role === 'SUPER_ADMIN' ? 'Gross Platform Volume' : role === 'CLIENT' ? 'Monthly Spend' : 'Daily Sales';
  const chart2Subtitle = '(+15%) increase in today sales.';
  const chart2Footer = 'updated 4 min ago';

  const chart3Title = role === 'SUPER_ADMIN' ? 'Completed Orders' : role === 'CLIENT' ? 'Delivered Projects' : 'Completed Tasks';
  const chart3Subtitle = 'Last Campaign Performance';
  const chart3Footer = 'just updated';

  // Bar chart data: M, T, W, T, F, S, S
  const barData = [
    { day: 'M', height: 50 },
    { day: 'T', height: 45 },
    { day: 'W', height: 22 },
    { day: 'T', height: 28 },
    { day: 'F', height: 52 },
    { day: 'S', height: 60 },
    { day: 'S', height: 80 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 1. Bar Chart Card: Website Views */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-800">{chart1Title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{chart1Subtitle}</p>

          {/* Bar Chart Canvas */}
          <div className="mt-6 h-48 w-full flex flex-col justify-end">
            <div className="flex-1 flex items-end justify-between px-2 pt-4 relative">
              {/* Horizontal gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-slate-200 w-full flex items-center">
                  <span className="text-[10px] text-slate-400 -ml-1">100</span>
                </div>
                <div className="border-b border-slate-200 w-full flex items-center">
                  <span className="text-[10px] text-slate-400 -ml-1">50</span>
                </div>
                <div className="border-b border-slate-300 w-full flex items-center">
                  <span className="text-[10px] text-slate-400 -ml-1">0</span>
                </div>
              </div>

              {/* Bars */}
              {barData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center z-10 group relative w-7">
                  <div
                    style={{ height: `${item.height * 1.5}px` }}
                    className="w-full bg-[#48bb78] rounded-md transition-all duration-300 group-hover:bg-[#38a169] group-hover:shadow-md cursor-pointer"
                  />
                  {/* Tooltip on hover */}
                  <span className="absolute -top-7 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xs">
                    {item.height}k
                  </span>
                </div>
              ))}
            </div>

            {/* X-Axis Days */}
            <div className="flex items-center justify-between px-3 pt-3 border-t border-slate-100 mt-2 text-[11px] font-medium text-slate-500">
              {barData.map((b, idx) => (
                <span key={idx} className="w-7 text-center">
                  {b.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{chart1Footer}</span>
        </div>
      </div>

      {/* 2. Line Chart Card: Daily Sales */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-800">{chart2Title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-bold text-slate-700">(+15%)</span> increase in today sales.
          </p>

          {/* SVG Line Chart */}
          <div className="mt-6 h-48 w-full flex flex-col justify-between">
            <div className="relative h-38 w-full">
              <svg viewBox="0 0 320 150" className="w-full h-full overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20" x2="320" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="320" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="320" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="320" y2="140" stroke="#cbd5e1" />

                {/* Y-axis text */}
                <text x="5" y="18" fill="#94a3b8" fontSize="9">600</text>
                <text x="5" y="58" fill="#94a3b8" fontSize="9">400</text>
                <text x="5" y="98" fill="#94a3b8" fontSize="9">200</text>
                <text x="5" y="138" fill="#94a3b8" fontSize="9">0</text>

                {/* Green Line Path */}
                <path
                  d="M 30 115 L 55 95 L 80 120 L 105 70 L 130 90 L 155 105 L 180 125 L 205 98 L 230 96 L 255 110"
                  fill="none"
                  stroke="#48bb78"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Circles on vertices */}
                {[
                  [30, 115],
                  [55, 95],
                  [80, 120],
                  [105, 70],
                  [130, 90],
                  [155, 105],
                  [180, 125],
                  [205, 98],
                  [230, 96],
                  [255, 110],
                ].map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#38a169"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="hover:r-5 transition-all cursor-pointer"
                  />
                ))}
              </svg>
            </div>

            {/* Months Axis */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 text-[10px] font-medium text-slate-400">
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, idx) => (
                <span key={idx}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{chart2Footer}</span>
        </div>
      </div>

      {/* 3. Line Chart Card: Completed Tasks */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-800">{chart3Title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{chart3Subtitle}</p>

          {/* SVG Line Chart */}
          <div className="mt-6 h-48 w-full flex flex-col justify-between">
            <div className="relative h-38 w-full">
              <svg viewBox="0 0 320 150" className="w-full h-full overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20" x2="320" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="320" y2="60" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="320" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="320" y2="140" stroke="#cbd5e1" />

                {/* Y-axis text */}
                <text x="5" y="18" fill="#94a3b8" fontSize="9">600</text>
                <text x="5" y="58" fill="#94a3b8" fontSize="9">400</text>
                <text x="5" y="98" fill="#94a3b8" fontSize="9">200</text>
                <text x="5" y="138" fill="#94a3b8" fontSize="9">0</text>

                {/* Green Line Path */}
                <path
                  d="M 25 130 L 60 130 L 95 85 L 130 100 L 165 45 L 200 95 L 235 70 L 270 98 L 305 45"
                  fill="none"
                  stroke="#48bb78"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Circles on vertices */}
                {[
                  [25, 130],
                  [60, 130],
                  [95, 85],
                  [130, 100],
                  [165, 45],
                  [200, 95],
                  [235, 70],
                  [270, 98],
                  [305, 45],
                ].map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#38a169"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="hover:r-5 transition-all cursor-pointer"
                  />
                ))}
              </svg>
            </div>

            {/* Months Axis */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 text-[10px] font-medium text-slate-400">
              {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                <span key={idx}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>{chart3Footer}</span>
        </div>
      </div>
    </div>
  );
}
