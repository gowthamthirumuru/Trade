import React from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';

export interface DrawdownBin {
  range: string;
  count: number;
  pct: number;
}

interface MonteCarloDrawdownDistributionProps {
  distribution?: DrawdownBin[];
}

export const MonteCarloDrawdownDistribution: React.FC<MonteCarloDrawdownDistributionProps> = ({
  distribution = [],
}) => {
  const safeDist = distribution.length > 0 ? distribution : [
    { range: '0% – 5%', count: 925, pct: 18.5 },
    { range: '5% – 10%', count: 2310, pct: 46.2 },
    { range: '10% – 15%', count: 1205, pct: 24.1 },
    { range: '15% – 20%', count: 490, pct: 9.8 },
    { range: '> 20%', count: 70, pct: 1.4 },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Empirical Max Drawdown Distribution
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Monte Carlo Bootstrap Bins</span>
      </div>

      <div className="space-y-2.5">
        {safeDist.map((bin, idx) => {
          const isHighRisk = idx >= 3;
          const isExtreme = idx === 4;

          return (
            <div key={bin.range} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-bold">{bin.range} Drawdown</span>
                <span className="text-slate-400">
                  <span className={isExtreme ? 'text-rose-400 font-bold' : isHighRisk ? 'text-amber-400' : 'text-cyan-300 font-bold'}>
                    {bin.pct.toFixed(1)}%
                  </span>{' '}
                  ({bin.count.toLocaleString()} paths)
                </span>
              </div>

              <div className="h-2 w-full bg-[#07090e] border border-[#161c28] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isExtreme
                      ? 'bg-rose-500'
                      : isHighRisk
                      ? 'bg-amber-500'
                      : idx === 1
                      ? 'bg-cyan-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, bin.pct * 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
