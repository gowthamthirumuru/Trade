import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import { DiscoveredPattern } from './PatternMiningList';

interface PatternForwardReturnDistributionProps {
  pattern: DiscoveredPattern | null;
}

export const PatternForwardReturnDistribution: React.FC<PatternForwardReturnDistributionProps> = ({
  pattern,
}) => {
  const rDist = pattern?.r_distribution && pattern.r_distribution.length > 0
    ? pattern.r_distribution
    : [1.2, -1.0, 1.5, 0.8, -1.0, 2.1, -1.0, 1.4, 0.5, -1.0, 1.8, 1.1, -1.0, 2.5, 0.9];

  // Bin into buckets: [-1.5 to -0.5], [-0.5 to 0.5], [0.5 to 1.5], [1.5 to 2.5], [> 2.5]
  const buckets = [
    { label: '< -0.5R', count: 0, color: 'bg-rose-500' },
    { label: '-0.5 to 0.5R', count: 0, color: 'bg-slate-500' },
    { label: '0.5 to 1.5R', count: 0, color: 'bg-cyan-500' },
    { label: '1.5 to 2.5R', count: 0, color: 'bg-teal-400' },
    { label: '> 2.5R', count: 0, color: 'bg-emerald-400' },
  ];

  rDist.forEach((r) => {
    if (r < -0.5) buckets[0].count++;
    else if (r < 0.5) buckets[1].count++;
    else if (r < 1.5) buckets[2].count++;
    else if (r < 2.5) buckets[3].count++;
    else buckets[4].count++;
  });

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">Forward Return Distribution (R-Multiples)</h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold">24-Bar Holding Horizon</span>
      </div>

      {/* Histogram Bars */}
      <div className="space-y-3 py-1">
        {buckets.map((b) => {
          const pct = Math.round((b.count / rDist.length) * 100);
          return (
            <div key={b.label} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-bold">{b.label}</span>
                <span className="text-slate-200 font-mono">
                  {b.count} trades ({pct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#07090e] border border-[#161c28] rounded-full overflow-hidden">
                <div
                  className={`h-full ${b.color} rounded-full transition-all`}
                  style={{ width: `${Math.max(4, (b.count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono pt-1">
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#141a26]">
          <span className="text-slate-500 block uppercase text-[8px]">Expectancy</span>
          <span className="text-emerald-400 font-bold text-xs">+{pattern?.avg_r.toFixed(2) ?? '1.15'}R</span>
        </div>
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#141a26]">
          <span className="text-slate-500 block uppercase text-[8px]">Win Rate</span>
          <span className="text-white font-bold text-xs">{pattern?.win_rate.toFixed(1) ?? '64.2'}%</span>
        </div>
      </div>
    </div>
  );
};
