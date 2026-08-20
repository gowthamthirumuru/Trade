import React, { useState } from 'react';
import { Calendar, BarChart2, PieChart, Layers, Target } from 'lucide-react';

export interface MonthlyHeatmapRow {
  year: number;
  months: number[];
  ytd: number;
}

export interface DayOfWeekItem {
  day: string;
  r: number;
  positive: boolean;
  width: number;
}

export interface SessionStats {
  london_r: number;
  london_pct: number;
  ny_r: number;
  ny_pct: number;
  overlap_r: number;
  overlap_pct: number;
  asia_r: number;
  asia_pct: number;
}

export interface RDistItem {
  label: string;
  count: number;
  color: string;
}

interface BacktestAnalyticsRowProps {
  monthlyData?: MonthlyHeatmapRow[];
  dayOfWeekData?: DayOfWeekItem[];
  sessionStats?: SessionStats;
  rDistribution?: RDistItem[];
  rDistributionBySide?: {
    all?: RDistItem[];
    long?: RDistItem[];
    short?: RDistItem[];
  };
  winTrades?: number;
  lossTrades?: number;
  winRatePct?: number;
  expectancyR?: number;
}

export const BacktestAnalyticsRow: React.FC<BacktestAnalyticsRowProps> = ({
  monthlyData = [
    { year: 2025, months: [1.2, -0.4, 2.1, 0.8, 1.4, -0.6, 1.8, 0.9, 1.1, -0.2, 1.5, 0.7], ytd: 10.3 },
    { year: 2024, months: [0.8, 1.5, -0.8, 1.4, 2.2, 0.5, -0.3, 1.7, 0.6, 1.2, -0.5, 1.8], ytd: 10.1 },
    { year: 2023, months: [1.4, 0.6, 1.8, -0.5, 0.9, 1.2, -0.7, 0.8, 1.5, 2.0, 0.4, 1.1], ytd: 10.5 },
    { year: 2022, months: [-0.6, 1.1, 2.4, 0.8, -0.4, 1.5, 0.9, -0.8, 1.2, 0.7, 1.6, -0.3], ytd: 8.1 },
    { year: 2021, months: [0.9, -0.5, 1.2, 1.6, 0.7, -0.3, 1.4, 2.1, -0.6, 0.8, 1.3, 0.9], ytd: 9.5 },
    { year: 2020, months: [1.6, 2.4, -1.2, 1.8, 0.9, 1.1, 0.5, -0.4, 1.7, 0.8, 1.4, 1.2], ytd: 11.8 },
  ],
  dayOfWeekData = [
    { day: 'Mon', r: 0.31, width: 35, positive: true },
    { day: 'Tue', r: 1.02, width: 95, positive: true },
    { day: 'Wed', r: 0.84, width: 78, positive: true },
    { day: 'Thu', r: 0.72, width: 68, positive: true },
    { day: 'Fri', r: -0.18, width: 22, positive: false },
  ],
  sessionStats = {
    london_r: 0.92,
    london_pct: 41,
    ny_r: 0.61,
    ny_pct: 33,
    overlap_r: 1.04,
    overlap_pct: 16,
    asia_r: 0.14,
    asia_pct: 10,
  },
  rDistribution = [
    { label: '<-3R', count: 42, color: '#e11d48' },
    { label: '-2R', count: 184, color: '#f43f5e' },
    { label: '-1R', count: 1120, color: '#fb7185' },
    { label: '-0.5R', count: 471, color: '#fda4af' },
    { label: '0', count: 210, color: '#94a3b8' },
    { label: '+0.5R', count: 680, color: '#6ee7b7' },
    { label: '+1R', count: 1240, color: '#10b981' },
    { label: '+2R', count: 620, color: '#059669' },
    { label: '+3R', count: 190, color: '#047857' },
    { label: '>+3R', count: 64, color: '#065f46' },
  ],
  rDistributionBySide = {},
  winTrades = 3004,
  lossTrades = 1817,
  winRatePct = 62.4,
  expectancyR = 0.91,
}) => {
  const [distFilter, setDistFilter] = useState<'All Trades' | 'Long Only' | 'Short Only'>('All Trades');

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Select active distribution based on filter
  const activeRDist =
    distFilter === 'Long Only' && rDistributionBySide.long && rDistributionBySide.long.length > 0
      ? rDistributionBySide.long
      : distFilter === 'Short Only' && rDistributionBySide.short && rDistributionBySide.short.length > 0
      ? rDistributionBySide.short
      : rDistributionBySide.all && rDistributionBySide.all.length > 0
      ? rDistributionBySide.all
      : rDistribution;

  const maxDistCount = Math.max(...activeRDist.map((d) => d.count), 1);
  const totalTrades = winTrades + lossTrades;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 font-mono select-none text-xs">
      {/* ========================================================================= */}
      {/* 1. MONTHLY PERFORMANCE (R) HEATMAP (4 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-4 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Monthly Performance (R)</h3>
          </div>
          <span className="text-[10px] text-slate-400">YTD (R)</span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[10px]">
            <thead>
              <tr className="text-slate-500 border-b border-[#141a26]">
                <th className="py-1 text-left font-semibold">Yr</th>
                {monthNames.map((m) => (
                  <th key={m} className="py-1 px-0.5 font-normal">
                    {m}
                  </th>
                ))}
                <th className="py-1 px-1 font-bold text-cyan-400">YTD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141a26]">
              {monthlyData.map((row) => (
                <tr key={row.year}>
                  <td className="py-1 text-left text-slate-400 font-bold">{row.year}</td>
                  {row.months.map((val, mIdx) => {
                    const isPos = val >= 0;
                    return (
                      <td key={mIdx} className="py-1 px-0.5">
                        <span
                          className={`inline-block w-full py-0.5 rounded text-[9px] font-bold ${
                            isPos
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                              : 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {isPos ? `+${val.toFixed(1)}` : val.toFixed(1)}
                        </span>
                      </td>
                    );
                  })}
                  <td className={`py-1 px-1 font-extrabold ${row.ytd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.ytd >= 0 ? `+${row.ytd.toFixed(1)}` : row.ytd.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PERFORMANCE BY DAY OF WEEK (2 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-2 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Performance by Day</h3>
          </div>
          <span className="text-[10px] text-slate-400">Day (R)</span>
        </div>

        {/* Horizontal Bars */}
        <div className="space-y-2 text-[10px]">
          {dayOfWeekData.map((d) => (
            <div key={d.day} className="space-y-0.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold">{d.day}</span>
              </div>
              <div className="h-4 w-full bg-[#07090e] rounded overflow-hidden flex items-center">
                <div
                  style={{ width: `${d.width}%` }}
                  className={`h-full flex items-center px-1.5 font-extrabold text-[9px] rounded ${
                    d.positive
                      ? 'bg-emerald-500/80 text-black shadow-sm'
                      : 'bg-rose-500/80 text-white shadow-sm'
                  }`}
                >
                  {d.r >= 0 ? `+${d.r.toFixed(2)}` : d.r.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SESSION PERFORMANCE DONUT (2 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-2 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Session Performance</h3>
          </div>
          <span className="text-[10px] text-slate-400">Session (R)</span>
        </div>

        {/* Donut Chart & Side Alpha Stats */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Donut Visual */}
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <path
                className="text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray={`${sessionStats.london_pct}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500"
                strokeDasharray={`${sessionStats.ny_pct}, 100`}
                strokeDashoffset={`-${sessionStats.london_pct}`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray={`${sessionStats.overlap_pct}, 100`}
                strokeDashoffset={`-${sessionStats.london_pct + sessionStats.ny_pct}`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-[10px] font-extrabold text-white block leading-none">
                {expectancyR >= 0 ? `+${expectancyR.toFixed(2)}R` : `${expectancyR.toFixed(2)}R`}
              </span>
              <span className="text-[7px] text-slate-400 uppercase block font-bold">EXPECTANCY</span>
            </div>
          </div>

          {/* Side Legend & Numbers */}
          <div className="space-y-1 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-300">London ({sessionStats.london_pct}%)</span>
              <span className="text-cyan-400 font-bold ml-auto">{sessionStats.london_r >= 0 ? `+${sessionStats.london_r.toFixed(2)}R` : `${sessionStats.london_r.toFixed(2)}R`}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">NY ({sessionStats.ny_pct}%)</span>
              <span className="text-blue-400 font-bold ml-auto">{sessionStats.ny_r >= 0 ? `+${sessionStats.ny_r.toFixed(2)}R` : `${sessionStats.ny_r.toFixed(2)}R`}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">OverLap ({sessionStats.overlap_pct}%)</span>
              <span className="text-emerald-400 font-bold ml-auto">{sessionStats.overlap_r >= 0 ? `+${sessionStats.overlap_r.toFixed(2)}R` : `${sessionStats.overlap_r.toFixed(2)}R`}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-slate-300">Asia ({sessionStats.asia_pct}%)</span>
              <span className="text-amber-400 font-bold ml-auto">{sessionStats.asia_r >= 0 ? `+${sessionStats.asia_r.toFixed(2)}R` : `${sessionStats.asia_r.toFixed(2)}R`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. R-MULTIPLE DISTRIBUTION HISTOGRAM (2 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-2 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">R-Multiple Dist.</h3>
          </div>
          <select
            value={distFilter}
            onChange={(e) => setDistFilter(e.target.value as any)}
            className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-[9px] text-cyan-300 font-bold outline-none cursor-pointer"
          >
            <option value="All Trades">All Trades</option>
            <option value="Long Only">Long Only</option>
            <option value="Short Only">Short Only</option>
          </select>
        </div>

        {/* Histogram Columns */}
        <div className="h-20 flex items-end justify-between gap-1 pt-2">
          {activeRDist.map((bar) => {
            const heightPct = Math.max(8, Math.min(100, (bar.count / maxDistCount) * 100));
            return (
              <div key={bar.label} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div
                  style={{ height: `${heightPct}%`, backgroundColor: bar.color }}
                  className="w-full rounded-t transition hover:brightness-125"
                ></div>
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition absolute -top-5 bg-black border border-slate-700 px-1 py-0.5 rounded text-[8px] text-white z-10 pointer-events-none whitespace-nowrap">
                  {bar.label}: {bar.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Histogram Labels */}
        <div className="flex justify-between text-[7px] text-slate-500 font-mono">
          <span>&larr; -3R</span>
          <span>-2R</span>
          <span>-1R</span>
          <span>-0.5R</span>
          <span>0</span>
          <span>+0.5R</span>
          <span className="text-emerald-400 font-bold">+1R</span>
          <span>+2R</span>
          <span>+3R</span>
          <span>&gt;+3R</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. TRADE OUTCOME RING (2 Cols) */}
      {/* ========================================================================= */}
      <div className="xl:col-span-2 bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Trade Outcome</h3>
          </div>
          <div className="flex items-center gap-1">
            <span className={`font-extrabold text-[10px] ${winRatePct >= 50 ? 'text-emerald-400' : 'text-slate-200'}`}>
              {winRatePct.toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-400">Win</span>
          </div>
        </div>

        {/* Center Donut & Counts */}
        <div className="flex items-center justify-around gap-2 pt-1">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <path
                className="text-rose-500"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray={`${winRatePct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-[10px] font-bold text-white block leading-none">
                {totalTrades.toLocaleString()}
              </span>
              <span className="text-[6px] text-slate-400 uppercase block font-semibold">TRADES</span>
            </div>
          </div>

          <div className="space-y-1.5 text-[9px]">
            <div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300 font-bold">Winners</span>
                <span className="text-emerald-400 font-extrabold ml-auto">{winTrades.toLocaleString()}</span>
              </div>
              <span className="text-[8px] text-slate-500 block pl-2.5">{winRatePct.toFixed(1)}% of total</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-300 font-bold">Losers</span>
                <span className="text-rose-400 font-extrabold ml-auto">{lossTrades.toLocaleString()}</span>
              </div>
              <span className="text-[8px] text-slate-500 block pl-2.5">
                {(100 - winRatePct).toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
