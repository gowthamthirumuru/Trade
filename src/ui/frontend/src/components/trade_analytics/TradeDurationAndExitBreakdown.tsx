import React from 'react';
import { Clock, ShieldCheck, Target, AlertTriangle } from 'lucide-react';

export interface DurationBin {
  range: string;
  count: number;
}

export interface ExitReasonItem {
  reason: string;
  count: number;
  pct: number;
  status: string;
}

interface TradeDurationAndExitBreakdownProps {
  durationBins?: DurationBin[];
  exitReasons?: ExitReasonItem[];
}

export const TradeDurationAndExitBreakdown: React.FC<TradeDurationAndExitBreakdownProps> = ({
  durationBins = [],
  exitReasons = [],
}) => {
  const safeDurations = durationBins.length > 0 ? durationBins : [
    { range: '1 – 3 Bars', count: 420 },
    { range: '4 – 8 Bars', count: 680 },
    { range: '9 – 20 Bars', count: 510 },
    { range: '21 – 50 Bars', count: 180 },
    { range: '> 50 Bars', count: 50 },
  ];

  const safeExits = exitReasons.length > 0 ? exitReasons : [
    { reason: 'Take Profit (TP)', count: 1180, pct: 64.1, status: 'TARGET' },
    { reason: 'Stop Loss (SL)', count: 520, pct: 28.3, status: 'RISK' },
    { reason: 'Time-Based Exit', count: 95, pct: 5.2, status: 'EXPIRY' },
    { reason: 'Trailing / Signal Inversion', count: 45, pct: 2.4, status: 'DYNAMIC' },
  ];

  const maxDur = Math.max(...safeDurations.map((d) => d.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs select-none">
      {/* 1. Holding Duration Breakdown */}
      <div className="lg:col-span-6 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">
              Holding Period Duration Breakdown
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Intraday Bar Horizons</span>
        </div>

        <div className="space-y-2">
          {safeDurations.map((d) => {
            const frac = (d.count / maxDur) * 100;
            return (
              <div key={d.range} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-bold">{d.range}</span>
                  <span className="text-slate-400">{d.count.toLocaleString()} trades</span>
                </div>
                <div className="h-2 w-full bg-[#07090e] border border-[#161c28] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${frac}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Exit Reason Breakdown */}
      <div className="lg:col-span-6 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-xs">
              Trade Exit Reason Attribution
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Execution Termination Type</span>
        </div>

        <div className="space-y-2">
          {safeExits.map((e) => (
            <div
              key={e.reason}
              className="p-2.5 bg-[#07090e] border border-[#161c28] rounded-lg flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs block">{e.reason}</span>
                <span className="text-[10px] text-slate-400">{e.count.toLocaleString()} executions</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-emerald-400">{e.pct.toFixed(1)}%</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                    e.status === 'TARGET'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : e.status === 'RISK'
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {e.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
