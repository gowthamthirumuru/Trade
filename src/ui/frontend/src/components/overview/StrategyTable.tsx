import React from 'react';
import { Info } from 'lucide-react';
import { StrategyItem } from '../../types';

interface StrategyTableProps {
  strategies: StrategyItem[];
  onViewAll?: () => void;
  onSelectStrategy?: (strategy: StrategyItem) => void;
}

export const StrategyTable: React.FC<StrategyTableProps> = ({
  strategies,
  onViewAll,
  onSelectStrategy,
}) => {
  const getRobustnessBadge = (score: number) => {
    let colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (score < 50) {
      colorClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    } else if (score <= 80) {
      colorClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }

    return (
      <span
        className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[11px] font-bold ${colorClass}`}
      >
        {score}
      </span>
    );
  };

  const renderMiniSparkline = (points: number[], trend: string) => {
    if (!points || points.length === 0) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 36;
    const height = 14;

    const coords = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const stroke = trend === 'up' ? '#10B981' : '#F43F5E';

    return (
      <svg width={width} height={height} className="overflow-visible inline-block mr-2 shrink-0">
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="quant-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#161F38] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Strategy Performance (Top 10)
          </h2>
          <button
            title="Strategies ranked by composite Sharpe, Expectancy R and out-of-sample stability"
            className="text-slate-500 hover:text-slate-300"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          View all
        </button>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#161F38]/80 text-[11px] text-slate-400 font-medium bg-[#0B0E17]/40">
              <th className="py-2.5 px-3.5 font-medium">Strategy</th>
              <th className="py-2.5 px-3 text-right font-medium">Expectancy (R)</th>
              <th className="py-2.5 px-3 text-right font-medium">OOS Expectancy (R)</th>
              <th className="py-2.5 px-3 text-right font-medium">Profit Factor</th>
              <th className="py-2.5 px-3 text-right font-medium">Max DD</th>
              <th className="py-2.5 px-3 text-center font-medium">Robustness Score</th>
              <th className="py-2.5 px-3.5 text-right font-medium">Trades</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161F38]/40">
            {strategies.map((strat) => {
              const isPositiveExp = strat.expectancy_r >= 0;
              const isPositiveOos = strat.oos_expectancy_r >= 0;

              return (
                <tr
                  key={strat.name}
                  onClick={() => onSelectStrategy && onSelectStrategy(strat)}
                  className="hover:bg-[#151B32]/70 cursor-pointer transition"
                >
                  <td className="py-2.5 px-3.5 flex items-center font-medium text-slate-200">
                    {renderMiniSparkline(strat.sparkline, strat.trend)}
                    <span className="truncate">{strat.name}</span>
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      isPositiveExp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositiveExp ? `+${strat.expectancy_r.toFixed(2)}` : strat.expectancy_r.toFixed(2)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      isPositiveOos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositiveOos ? `+${strat.oos_expectancy_r.toFixed(2)}` : strat.oos_expectancy_r.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {strat.profit_factor.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {strat.max_dd_pct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-center flex justify-center">
                    {getRobustnessBadge(strat.robustness_score)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-slate-400">
                    {strat.trades_count.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
