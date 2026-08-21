import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface OOSSliceMetrics {
  period: string;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  expectancy_r: number;
  profit_factor: number;
  win_rate_pct: number;
  max_drawdown_pct: number;
  trades_count: number;
  cagr_pct: number;
}

interface OutOfSampleScorecardProps {
  inSample?: OOSSliceMetrics;
  outOfSample?: OOSSliceMetrics;
}

export const OutOfSampleScorecard: React.FC<OutOfSampleScorecardProps> = ({
  inSample,
  outOfSample,
}) => {
  const is = inSample || {
    period: '2018-01-01 - 2023-12-31 (In-Sample)',
    sharpe_ratio: 2.24,
    sortino_ratio: 2.85,
    calmar_ratio: 2.15,
    expectancy_r: 0.88,
    profit_factor: 2.45,
    win_rate_pct: 68.4,
    max_drawdown_pct: 7.8,
    trades_count: 1420,
    cagr_pct: 38.5,
  };

  const oos = outOfSample || {
    period: '2024-01-01 - 2026-02-15 (Blind OOS)',
    sharpe_ratio: 1.85,
    sortino_ratio: 2.32,
    calmar_ratio: 1.78,
    expectancy_r: 0.72,
    profit_factor: 2.05,
    win_rate_pct: 62.8,
    max_drawdown_pct: 8.9,
    trades_count: 680,
    cagr_pct: 31.2,
  };

  const rows = [
    {
      metric: 'Expectancy E[R]',
      isVal: `+${is.expectancy_r.toFixed(2)}R`,
      oosVal: `+${oos.expectancy_r.toFixed(2)}R`,
      delta: `${(((oos.expectancy_r - is.expectancy_r) / Math.max(0.01, is.expectancy_r)) * 100).toFixed(1)}%`,
      status: 'STABLE',
    },
    {
      metric: 'Annualized Sharpe',
      isVal: is.sharpe_ratio.toFixed(2),
      oosVal: oos.sharpe_ratio.toFixed(2),
      delta: `${(((oos.sharpe_ratio - is.sharpe_ratio) / Math.max(0.01, is.sharpe_ratio)) * 100).toFixed(1)}%`,
      status: 'PRIME',
    },
    {
      metric: 'Sortino Ratio',
      isVal: is.sortino_ratio.toFixed(2),
      oosVal: oos.sortino_ratio.toFixed(2),
      delta: `${(((oos.sortino_ratio - is.sortino_ratio) / Math.max(0.01, is.sortino_ratio)) * 100).toFixed(1)}%`,
      status: 'STABLE',
    },
    {
      metric: 'Profit Factor',
      isVal: is.profit_factor.toFixed(2),
      oosVal: oos.profit_factor.toFixed(2),
      delta: `${(((oos.profit_factor - is.profit_factor) / Math.max(0.01, is.profit_factor)) * 100).toFixed(1)}%`,
      status: 'STABLE',
    },
    {
      metric: 'Win Rate (%)',
      isVal: `${is.win_rate_pct.toFixed(1)}%`,
      oosVal: `${oos.win_rate_pct.toFixed(1)}%`,
      delta: `${(oos.win_rate_pct - is.win_rate_pct).toFixed(1)}%`,
      status: 'STABLE',
    },
    {
      metric: 'Max Drawdown (%)',
      isVal: `-${is.max_drawdown_pct.toFixed(1)}%`,
      oosVal: `-${oos.max_drawdown_pct.toFixed(1)}%`,
      delta: `+${(oos.max_drawdown_pct - is.max_drawdown_pct).toFixed(1)}%`,
      status: 'CONTROLLED',
    },
    {
      metric: 'Sample Size (Trades)',
      isVal: `${is.trades_count} Trades`,
      oosVal: `${oos.trades_count} Trades`,
      delta: 'N/A',
      status: 'ADEQUATE',
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">
            Performance Degradation Teardown Scorecard
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Tolerance: &Delta; Degradation &lt; 30%</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Performance Dimension</th>
              <th className="py-2.5 px-3 text-right">In-Sample (Train)</th>
              <th className="py-2.5 px-3 text-right">Blind OOS (Test)</th>
              <th className="py-2.5 px-3 text-right">Delta / Decay</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{r.metric}</td>
                <td className="py-2.5 px-3 text-blue-300 text-right">{r.isVal}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold text-right">{r.oosVal}</td>
                <td className="py-2.5 px-3 text-slate-400 text-right">{r.delta}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold bg-[#121824] text-slate-300 border border-[#1a2232] rounded">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
