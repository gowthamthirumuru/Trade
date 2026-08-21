import React from 'react';
import { BarChart3, Zap } from 'lucide-react';

export interface RankDistributionBin {
  range: string;
  count: number;
  pct: number;
  status: string;
}

interface OverfittingCSCVHistogramProps {
  distribution?: RankDistributionBin[];
  pboPct?: number;
}

export const OverfittingCSCVHistogram: React.FC<OverfittingCSCVHistogramProps> = ({
  distribution = [],
  pboPct = 12.0,
}) => {
  const safeDist = distribution.length > 0 ? distribution : [
    { range: 'Top Quintile (0.8 – 1.0)', count: 380, pct: 38.0, status: 'PRIME' },
    { range: 'Second Quintile (0.6 – 0.8)', count: 320, pct: 32.0, status: 'STABLE' },
    { range: 'Median Band (0.4 – 0.6)', count: 180, pct: 18.0, status: 'MEDIAN' },
    { range: 'Fourth Quintile (0.2 – 0.4)', count: 90, pct: 9.0, status: 'DEGRADED' },
    { range: 'Bottom Quintile (0.0 – 0.2)', count: 30, pct: 3.0, status: 'INVERTED' },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            CSCV Out-of-Sample Relative Rank Logit Distribution
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">PBO = {pboPct.toFixed(1)}%</span>
      </div>

      <div className="space-y-2.5">
        {safeDist.map((bin, idx) => {
          const isTop = idx === 0;
          const isBottom = idx === 4;

          return (
            <div key={bin.range} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-bold">{bin.range}</span>
                <span className="text-slate-400">
                  <span className={isTop ? 'text-emerald-400 font-bold' : isBottom ? 'text-rose-400' : 'text-slate-200'}>
                    {bin.pct.toFixed(1)}%
                  </span>{' '}
                  ({bin.count.toLocaleString()} splits)
                </span>
              </div>

              <div className="h-2 w-full bg-[#07090e] border border-[#161c28] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isTop
                      ? 'bg-emerald-500'
                      : idx === 1
                      ? 'bg-cyan-500'
                      : idx === 2
                      ? 'bg-purple-500'
                      : isBottom
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
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
