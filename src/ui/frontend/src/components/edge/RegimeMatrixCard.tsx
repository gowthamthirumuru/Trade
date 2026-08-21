import React from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface RegimeItem {
  name: string;
  expectancy_r: number;
  win_rate_pct: number;
  profit_factor: number;
  trades_count: number;
  edge_status: string;
  recommendation: string;
}

interface TransitionMatrixData {
  labels: string[];
  matrix: number[][];
}

interface RegimeMatrixCardProps {
  regimes?: RegimeItem[];
  transitionMatrix?: TransitionMatrixData;
}

export const RegimeMatrixCard: React.FC<RegimeMatrixCardProps> = ({
  regimes = [
    { name: 'Bullish Trend + High Volatility', expectancy_r: 1.45, win_rate_pct: 72.4, profit_factor: 3.12, trades_count: 412, edge_status: 'PRIME EDGE', recommendation: 'Max size (1.5x) on Long Pullbacks' },
    { name: 'Bearish Trend + High Volatility', expectancy_r: 0.98, win_rate_pct: 64.7, profit_factor: 2.45, trades_count: 530, edge_status: 'STRONG EDGE', recommendation: 'Standard size (1.0x) on Short Pullbacks' },
    { name: 'Bullish Trend + Low Volatility', expectancy_r: 0.62, win_rate_pct: 58.1, profit_factor: 1.84, trades_count: 890, edge_status: 'MODERATE', recommendation: 'Conservative targets (1.5R max)' },
    { name: 'Bearish Trend + Low Volatility', expectancy_r: 0.12, win_rate_pct: 51.2, profit_factor: 1.15, trades_count: 640, edge_status: 'WEAK', recommendation: 'Tighten stops, reduce risk to 0.5x' },
    { name: 'Ranging / Choppy / Sideways', expectancy_r: -0.15, win_rate_pct: 44.8, profit_factor: 0.88, trades_count: 1240, edge_status: 'KILL / AVOID', recommendation: 'Circuit breaker paused: 0 trades permitted' },
  ],
  transitionMatrix = {
    labels: ['Bull High', 'Bull Low', 'Bear High', 'Bear Low', 'Range'],
    matrix: [
      [0.65, 0.15, 0.08, 0.04, 0.08],
      [0.18, 0.58, 0.05, 0.09, 0.10],
      [0.06, 0.04, 0.68, 0.14, 0.08],
      [0.05, 0.11, 0.16, 0.56, 0.12],
      [0.14, 0.18, 0.12, 0.16, 0.40],
    ],
  },
}) => {
  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* 1. Regime Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {regimes.map((r, i) => {
          const isPrime = r.edge_status.includes('PRIME');
          const isStrong = r.edge_status.includes('STRONG');
          const isKill = r.edge_status.includes('KILL');

          return (
            <div
              key={i}
              className={`bg-[#0b0e14] border rounded-xl p-4 space-y-3 transition shadow-sm ${
                isPrime
                  ? 'border-emerald-500/60 shadow-emerald-950/20'
                  : isStrong
                  ? 'border-cyan-500/50'
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

              <div className="grid grid-cols-3 gap-2 font-mono text-center pt-1 border-t border-[#141a26]">
                <div className="p-2 bg-[#07090e] rounded-lg">
                  <span className="text-[9px] text-slate-400 block">Expectancy</span>
                  <span
                    className={`font-bold text-sm ${
                      r.expectancy_r >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {r.expectancy_r >= 0 ? `+${r.expectancy_r}` : r.expectancy_r}R
                  </span>
                </div>
                <div className="p-2 bg-[#07090e] rounded-lg">
                  <span className="text-[9px] text-slate-400 block">Win Rate</span>
                  <span className="text-white font-bold text-sm">{r.win_rate_pct}%</span>
                </div>
                <div className="p-2 bg-[#07090e] rounded-lg">
                  <span className="text-[9px] text-slate-400 block">Trades</span>
                  <span className="text-slate-300 font-bold text-sm">{r.trades_count}</span>
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

      {/* 2. Markov Regime Transition Matrix */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-xs">Markov Regime Transition Probability Matrix ($P_&#123;ij&#125;$)</h3>
          </div>
          <span className="text-[10px] text-slate-400">1-Step Forward State Transition Probabilities</span>
        </div>

        <div className="overflow-x-auto text-xs font-mono text-center">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#141a26] text-slate-400 text-[10px]">
                <th className="p-2 text-left">Current State ($S_t$) \ Next ($S_&#123;t+1&#125;$)</th>
                {transitionMatrix.labels.map((lbl) => (
                  <th key={lbl} className="p-2 text-cyan-300 font-bold">
                    {lbl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
              {transitionMatrix.labels.map((rowLabel, i) => (
                <tr key={rowLabel} className="hover:bg-[#121824] transition">
                  <td className="p-2.5 text-left font-bold text-white text-xs">{rowLabel}</td>
                  {transitionMatrix.matrix[i].map((prob, j) => {
                    const pct = Math.round(prob * 100);
                    const isSelf = i === j;
                    return (
                      <td
                        key={j}
                        className={`p-2.5 font-bold ${
                          isSelf
                            ? 'text-emerald-400 bg-emerald-950/20 font-extrabold'
                            : prob > 0.15
                            ? 'text-amber-400 bg-amber-950/15'
                            : 'text-slate-400'
                        }`}
                      >
                        {pct}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
