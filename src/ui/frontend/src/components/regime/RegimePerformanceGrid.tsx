import React from 'react';
import { Activity, ShieldCheck, Flame, AlertTriangle, TrendingUp } from 'lucide-react';

export interface RegimeMetricItem {
  id: number;
  short_label: string;
  name: string;
  expectancy_r: number;
  win_rate_pct: number;
  profit_factor: number;
  max_drawdown_pct: number;
  trades_count: number;
  edge_status: string;
  recommendation: string;
  self_persistence_pct: number;
  half_life_bars: number;
  stationary_prob_pct: number;
}

interface RegimePerformanceGridProps {
  regimes: RegimeMetricItem[];
}

export const RegimePerformanceGrid: React.FC<RegimePerformanceGridProps> = ({ regimes }) => {
  return (
    <div className="space-y-3 font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">5-Regime Market Architecture & Execution Directives</h3>
        </div>
        <span className="text-[10px] text-slate-400">Point-in-Time Technical Clustering</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {regimes.map((r) => {
          const isPrime = r.edge_status.includes('PRIME');
          const isStrong = r.edge_status.includes('STRONG');
          const isKill = r.edge_status.includes('KILL');

          return (
            <div
              key={r.id}
              className={`bg-[#0b0e14] border rounded-xl p-4 space-y-3 transition shadow-sm ${
                isPrime
                  ? 'border-emerald-500/60 shadow-emerald-950/20 bg-emerald-950/5'
                  : isStrong
                  ? 'border-cyan-500/50 bg-cyan-950/5'
                  : isKill
                  ? 'border-rose-500/50 bg-rose-950/10'
                  : 'border-[#161c28]'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">{r.name}</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${
                    isPrime
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : isStrong
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : isKill
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-[#121824] text-slate-300 border border-[#1a2232]'
                  }`}
                >
                  {r.edge_status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 font-mono text-center pt-1 border-t border-[#141a26]">
                <div className="p-2 bg-[#07090e] rounded-lg">
                  <span className="text-[8px] text-slate-400 block uppercase">Exp E[R]</span>
                  <span
                    className={`font-extrabold text-xs ${
                      r.expectancy_r >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {r.expectancy_r >= 0 ? `+${r.expectancy_r.toFixed(2)}` : r.expectancy_r.toFixed(2)}R
                  </span>
                </div>
                <div className="p-2 bg-[#07090e] rounded-lg">
                  <span className="text-[8px] text-slate-400 block uppercase">Win Rate</span>
                  <span className="text-white font-bold text-xs">{r.win_rate_pct.toFixed(1)}%</span>
                </div>
                <div className="p-2 bg-[#07090e] rounded-lg">
                  <span className="text-[8px] text-slate-400 block uppercase">Profit Fact</span>
                  <span className="text-cyan-300 font-bold text-xs">{r.profit_factor.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-[#07090e] rounded-lg">
                  <span className="text-[8px] text-slate-400 block uppercase">Bar Count</span>
                  <span className="text-slate-300 font-bold text-xs">{r.trades_count}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                <div>
                  Persistence: <span className="text-amber-300 font-bold">{r.self_persistence_pct}%</span>
                </div>
                <div>
                  Half-Life: <span className="text-purple-300 font-bold">{r.half_life_bars} bars</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 p-2.5 bg-[#07090e] rounded-lg border border-[#141a26]">
                <span className="text-slate-500 font-bold block text-[9px] uppercase">
                  Execution Directive:
                </span>
                {r.recommendation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
