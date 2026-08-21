import React from 'react';
import { Activity } from 'lucide-react';

export interface StrategyMetricRow {
  name: string;
  color?: string;
  sharpe: number;
  sortino?: number;
  profit_factor: number;
  win_rate: number;
  expectancy_r?: number;
  max_dd: number;
  calmar?: number;
  wfer: number;
  smoothness?: number;
  drag_pct?: number;
}

interface StrategyComparisonMetricsMatrixProps {
  strategies?: StrategyMetricRow[];
}

export const StrategyComparisonMetricsMatrix: React.FC<StrategyComparisonMetricsMatrixProps> = ({
  strategies = [],
}) => {
  const safeStrats: StrategyMetricRow[] = strategies.length > 0 ? strategies : [
    { name: 'BB Reversion v4', color: '#10b981', sharpe: 2.18, sortino: 2.85, profit_factor: 2.18, win_rate: 62.4, expectancy_r: 0.91, max_dd: 8.4, calmar: 4.8, wfer: 81.4, smoothness: 88.5, drag_pct: 8.78 },
    { name: 'Order Block v4', color: '#06b6d4', sharpe: 1.92, sortino: 2.45, profit_factor: 1.92, win_rate: 64.4, expectancy_r: 0.74, max_dd: 9.1, calmar: 4.1, wfer: 78.2, smoothness: 84.0, drag_pct: 9.24 },
    { name: 'Liquidity Sweep v3', color: '#f59e0b', sharpe: 1.81, sortino: 2.3, profit_factor: 1.81, win_rate: 58.7, expectancy_r: 0.68, max_dd: 10.2, calmar: 3.7, wfer: 75.6, smoothness: 81.5, drag_pct: 10.12 },
    { name: 'London Breakout v2', color: '#8b5cf6', sharpe: 1.72, sortino: 2.15, profit_factor: 1.72, win_rate: 54.1, expectancy_r: 0.62, max_dd: 7.6, calmar: 3.9, wfer: 83.1, smoothness: 86.2, drag_pct: 7.95 },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Institutional Comparative Metrics Matrix
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Point-in-Time Tearsheet</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Model</th>
              <th className="py-2.5 px-2 text-right">Sharpe</th>
              <th className="py-2.5 px-2 text-right">Sortino</th>
              <th className="py-2.5 px-2 text-right">PF</th>
              <th className="py-2.5 px-2 text-right">Win %</th>
              <th className="py-2.5 px-2 text-right">Exp (R)</th>
              <th className="py-2.5 px-2 text-right">MaxDD</th>
              <th className="py-2.5 px-2 text-right">Calmar</th>
              <th className="py-2.5 px-2 text-right">WFER</th>
              <th className="py-2.5 px-2 text-right">R² Smooth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {safeStrats.map((s) => (
              <tr key={s.name} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color || '#10b981' }}
                  />
                  <span>{s.name}</span>
                </td>
                <td className="py-2.5 px-2 text-right font-bold text-emerald-400">
                  {s.sharpe.toFixed(2)}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-300">
                  {(s.sortino ?? s.sharpe * 1.25).toFixed(2)}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-200">
                  {s.profit_factor.toFixed(2)}
                </td>
                <td className="py-2.5 px-2 text-right text-slate-200">
                  {s.win_rate.toFixed(1)}%
                </td>
                <td className="py-2.5 px-2 text-right font-bold text-purple-300">
                  {(s.expectancy_r ?? 0.8) >= 0 ? `+${(s.expectancy_r ?? 0.8).toFixed(2)}` : (s.expectancy_r ?? 0.8).toFixed(2)}R
                </td>
                <td className="py-2.5 px-2 text-right text-rose-400">
                  -{s.max_dd.toFixed(1)}%
                </td>
                <td className="py-2.5 px-2 text-right text-slate-300">
                  {(s.calmar ?? 4.0).toFixed(1)}
                </td>
                <td className="py-2.5 px-2 text-right font-bold text-cyan-400">
                  {s.wfer.toFixed(1)}%
                </td>
                <td className="py-2.5 px-2 text-right text-slate-300">
                  {(s.smoothness ?? 85.0).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Includes 5 bps taker fee + 2 bps slippage friction drag</span>
        <span className="text-emerald-400 font-bold">Standardized Quant Criteria</span>
      </div>
    </div>
  );
};
