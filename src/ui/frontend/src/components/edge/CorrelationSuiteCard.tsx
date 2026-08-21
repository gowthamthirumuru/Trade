import React from 'react';
import { GitCompare, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CorrelationData {
  strategies: string[];
  matrix: number[][];
  diversification_benefit?: {
    portfolio_variance_reduction_pct: number;
    average_cross_correlation: number;
    uncorrelated_pairs_count: number;
    correlated_pairs_count: number;
  };
  redundancy_warnings?: Array<{
    pair: string;
    correlation: number;
    status: string;
    note: string;
  }>;
}

interface CorrelationSuiteCardProps {
  data?: CorrelationData;
}

export const CorrelationSuiteCard: React.FC<CorrelationSuiteCardProps> = ({
  data = {
    strategies: ['BB Reversion v4', 'Order Block v4', 'Sweep v3', 'London Breakout', 'EMA Trend', 'FVG Fade'],
    matrix: [
      [1.00, 0.18, 0.12, 0.08, 0.24, 0.15],
      [0.18, 1.00, 0.42, 0.15, 0.31, 0.22],
      [0.12, 0.42, 1.00, 0.22, 0.09, 0.18],
      [0.08, 0.15, 0.22, 1.00, 0.14, 0.07],
      [0.24, 0.31, 0.09, 0.14, 1.00, 0.19],
      [0.15, 0.22, 0.18, 0.07, 0.19, 1.00],
    ],
    diversification_benefit: {
      portfolio_variance_reduction_pct: 34.2,
      average_cross_correlation: 0.18,
      uncorrelated_pairs_count: 13,
      correlated_pairs_count: 2,
    },
    redundancy_warnings: [
      {
        pair: 'Order Block v4 ↔ Liquidity Sweep v3',
        correlation: 0.42,
        status: 'ACCEPTABLE (< 0.65)',
        note: 'Both trade SMC principles but trigger on distinct market conditions.',
      },
    ],
  },
}) => {
  const strats = data.strategies;
  const matrix = data.matrix;
  const div = data.diversification_benefit || {
    portfolio_variance_reduction_pct: 34.2,
    average_cross_correlation: 0.18,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs select-none">
      {/* Left: Matrix Heatmap Table */}
      <div className="lg:col-span-8 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-xs">Pairwise Return Correlation Matrix ($r_&#123;XY&#125;$)</h3>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">&lt; 0.30 (Ideal)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-slate-400">0.30 - 0.60</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="text-slate-400">&gt; 0.60 (Prune)</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto text-xs font-mono text-center">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#141a26] text-slate-400 text-[10px]">
                <th className="p-2 text-left font-sans">Model</th>
                {strats.map((s) => (
                  <th key={s} className="p-2 text-xs truncate max-w-[90px] text-cyan-300 font-bold">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141a26] text-slate-200">
              {strats.map((sName, i) => (
                <tr key={i} className="hover:bg-[#121824] transition">
                  <td className="p-2.5 text-left font-bold text-white font-sans text-xs">{sName}</td>
                  {matrix[i].map((v, j) => (
                    <td
                      key={j}
                      className={`p-2.5 font-bold ${
                        v === 1.00
                          ? 'text-purple-400 bg-purple-950/20 font-extrabold'
                          : v > 0.40
                          ? 'text-amber-400 bg-amber-950/20'
                          : 'text-emerald-400 bg-emerald-950/10'
                      }`}
                    >
                      {v.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Diversification Summary & Pruning Alert */}
      <div className="lg:col-span-4 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="font-bold text-white text-xs border-b border-[#141a26] pb-2.5">
            Portfolio Diversification Benefits
          </h3>

          <div className="p-3 bg-[#07090e] rounded-xl border border-[#161c28] space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Variance Reduction</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              +{div.portfolio_variance_reduction_pct}% Risk Reduction
            </div>
            <p className="text-[11px] text-slate-400">
              Combining 6 low-correlation models reduces maximum portfolio volatility by {div.portfolio_variance_reduction_pct}%.
            </p>
          </div>

          <div className="p-3 bg-[#07090e] rounded-xl border border-[#161c28] space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Average Cross-Correlation</span>
            <div className="text-xl font-extrabold font-mono text-cyan-400">
              {div.average_cross_correlation} (Institutional Target &lt; 0.30)
            </div>
          </div>
        </div>

        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs space-y-1 text-emerald-300">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Redundant Strategies</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            All 6 models maintain pairwise correlation &lt; 0.65. Portfolio capital allocation is optimal without cannibalization.
          </p>
        </div>
      </div>
    </div>
  );
};
