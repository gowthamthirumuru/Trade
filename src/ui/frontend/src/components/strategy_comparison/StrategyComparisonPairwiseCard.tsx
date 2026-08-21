import React from 'react';
import { GitCompare, ShieldCheck } from 'lucide-react';

interface StrategyComparisonPairwiseCardProps {
  pairwiseMatrix?: Array<Record<string, any>>;
}

export const StrategyComparisonPairwiseCard: React.FC<StrategyComparisonPairwiseCardProps> = ({
  pairwiseMatrix = [],
}) => {
  const safeMatrix = pairwiseMatrix.length > 0 ? pairwiseMatrix : [
    { strategy: 'BB Reversion v4', 'BB Reversion v4': 0.0, 'Order Block v4': 0.26, 'London Breakout v2': 0.46, 'Liquidity Sweep v3': 0.37 },
    { strategy: 'Order Block v4', 'BB Reversion v4': -0.26, 'Order Block v4': 0.0, 'London Breakout v2': 0.2, 'Liquidity Sweep v3': 0.11 },
    { strategy: 'London Breakout v2', 'BB Reversion v4': -0.46, 'Order Block v4': -0.2, 'London Breakout v2': 0.0, 'Liquidity Sweep v3': -0.09 },
    { strategy: 'Liquidity Sweep v3', 'BB Reversion v4': -0.37, 'Order Block v4': -0.11, 'London Breakout v2': 0.09, 'Liquidity Sweep v3': 0.0 },
  ];

  const cols = safeMatrix.map((r) => r.strategy);

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-white text-xs">
            Pairwise Head-to-Head Alpha Differential Matrix (Δ Sharpe)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Row Model vs Column Model</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Model (Row)</th>
              {cols.map((c) => (
                <th key={c} className="py-2.5 px-2 text-right">
                  {c.split(' ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {safeMatrix.map((row) => (
              <tr key={row.strategy} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{row.strategy}</td>
                {cols.map((col) => {
                  const val = row[col] ?? 0.0;
                  const isZero = Math.abs(val) < 0.001;
                  const isPos = val > 0;

                  return (
                    <td
                      key={col}
                      className={`py-2.5 px-2 text-right font-bold ${
                        isZero
                          ? 'text-slate-500'
                          : isPos
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {isZero ? '0.00' : isPos ? `+${val.toFixed(2)}` : val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Positive value indicates Row Strategy outperforms Column Strategy</span>
        <span className="text-indigo-400 font-bold">Relative Alpha Edge</span>
      </div>
    </div>
  );
};
