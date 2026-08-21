import React from 'react';
import { Layers, Activity, Calendar, Clock } from 'lucide-react';

export interface AttributionItem {
  day?: string;
  session?: string;
  return_pct: number;
  expectancy_r?: number;
  win_rate_pct: number;
  trades: number;
}

interface PerformanceAttributionGridProps {
  dayOfWeek?: AttributionItem[];
  sessions?: AttributionItem[];
}

export const PerformanceAttributionGrid: React.FC<PerformanceAttributionGridProps> = ({
  dayOfWeek = [],
  sessions = [],
}) => {
  const safeDow = dayOfWeek.length > 0 ? dayOfWeek : [
    { day: 'Monday', return_pct: 4.2, expectancy_r: 0.42, win_rate_pct: 64.2, trades: 840 },
    { day: 'Tuesday', return_pct: 12.8, expectancy_r: 0.88, win_rate_pct: 69.5, trades: 1280 },
    { day: 'Wednesday', return_pct: 9.5, expectancy_r: 0.65, win_rate_pct: 66.8, trades: 1150 },
    { day: 'Thursday', return_pct: 8.8, expectancy_r: 0.58, win_rate_pct: 65.4, trades: 1100 },
    { day: 'Friday', return_pct: -1.5, expectancy_r: -0.12, win_rate_pct: 48.2, trades: 451 },
  ];

  const safeSess = sessions.length > 0 ? sessions : [
    { session: 'Asia', return_pct: 6.5, win_rate_pct: 61.2, trades: 1450 },
    { session: 'London', return_pct: 18.2, win_rate_pct: 71.4, trades: 2840 },
    { session: 'New York', return_pct: 14.6, win_rate_pct: 68.9, trades: 2120 },
    { session: 'NY Close', return_pct: 2.1, win_rate_pct: 54.5, trades: 680 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs select-none">
      {/* 1. Day of Week Alpha Attribution */}
      <div className="lg:col-span-6 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white text-xs">
              Day-of-Week Alpha Attribution
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Weekly Seasonality</span>
        </div>

        <div className="space-y-2">
          {safeDow.map((d) => {
            const isPos = d.return_pct >= 0;
            return (
              <div
                key={d.day}
                className="p-2.5 bg-[#07090e] border border-[#161c28] rounded-lg flex items-center justify-between"
              >
                <span className="font-bold text-white text-xs">{d.day}</span>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase">Win Rate</span>
                    <span className="font-bold text-cyan-300">{d.win_rate_pct.toFixed(1)}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase">Return</span>
                    <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? `+${d.return_pct.toFixed(1)}%` : `${d.return_pct.toFixed(1)}%`}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500">{d.trades.toLocaleString()} trades</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Intraday Session Alpha Attribution */}
      <div className="lg:col-span-6 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">
              Intraday Session Alpha Attribution
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Macro Liquidity Blocks</span>
        </div>

        <div className="space-y-2">
          {safeSess.map((s) => {
            const isPos = s.return_pct >= 0;
            return (
              <div
                key={s.session}
                className="p-2.5 bg-[#07090e] border border-[#161c28] rounded-lg flex items-center justify-between"
              >
                <span className="font-bold text-white text-xs">{s.session}</span>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase">Win Rate</span>
                    <span className="font-bold text-cyan-300">{s.win_rate_pct.toFixed(1)}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block uppercase">Return</span>
                    <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? `+${s.return_pct.toFixed(1)}%` : `${s.return_pct.toFixed(1)}%`}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500">{s.trades.toLocaleString()} trades</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
