import React from 'react';
import { Activity, ShieldCheck, Zap, Percent } from 'lucide-react';

interface StatsLabHigherMomentsCardProps {
  expectancyR?: number;
  medianR?: number;
  stdDevR?: number;
  varianceR?: number;
  skewness?: number;
  kurtosis?: number;
  semiVariance?: number;
  var99?: number;
  cvar99?: number;
}

export const StatsLabHigherMomentsCard: React.FC<StatsLabHigherMomentsCardProps> = ({
  expectancyR = 0.91,
  medianR = 0.82,
  stdDevR = 1.45,
  varianceR = 2.1,
  skewness = 1.24,
  kurtosis = 4.82,
  semiVariance = 0.65,
  var99 = -1.85,
  cvar99 = -2.42,
}) => {
  const metrics = [
    { name: 'Mean Expectancy E[R]', val: expectancyR >= 0 ? `+${expectancyR.toFixed(2)}R` : `${expectancyR.toFixed(2)}R`, highlight: 'text-purple-300 font-bold' },
    { name: 'Median Realized R', val: medianR >= 0 ? `+${medianR.toFixed(2)}R` : `${medianR.toFixed(2)}R`, highlight: 'text-slate-200' },
    { name: 'Standard Deviation (σ)', val: stdDevR.toFixed(2), highlight: 'text-slate-200' },
    { name: 'Variance (σ²)', val: varianceR.toFixed(2), highlight: 'text-slate-200' },
    { name: 'Distribution Skewness (γ₁)', val: skewness >= 0 ? `+${skewness.toFixed(2)}` : skewness.toFixed(2), highlight: 'text-cyan-400 font-bold' },
    { name: 'Distribution Kurtosis (γ₂)', val: kurtosis.toFixed(2), highlight: 'text-purple-400 font-bold' },
    { name: 'Downside Semi-Variance', val: semiVariance.toFixed(2), highlight: 'text-amber-300' },
    { name: 'Value at Risk (VaR 99%)', val: `${var99.toFixed(2)}R`, highlight: 'text-rose-400 font-bold' },
    { name: 'Conditional VaR (CVaR 99%)', val: `${cvar99.toFixed(2)}R`, highlight: 'text-rose-400 font-bold' },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">
            Higher Return Moments &amp; Tail Risk Diagnostics
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Non-Gaussian Risk Profile</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {metrics.map((m) => (
          <div
            key={m.name}
            className="p-2.5 bg-[#07090e] border border-[#161c28] rounded-lg flex flex-col justify-between space-y-1"
          >
            <span className="text-slate-400 text-[10px] font-sans truncate">{m.name}</span>
            <span className={`text-sm font-mono ${m.highlight}`}>{m.val}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Positive Skewness + Fat Tails</span>
        <span className="text-emerald-400 font-bold">Institutional Alpha Certified</span>
      </div>
    </div>
  );
};
