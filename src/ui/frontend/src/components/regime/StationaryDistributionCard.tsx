import React from 'react';
import { Activity, ShieldCheck, PieChart } from 'lucide-react';

interface StationaryData {
  labels: string[];
  probabilities: number[];
}

interface StationaryDistributionCardProps {
  data: StationaryData;
}

export const StationaryDistributionCard: React.FC<StationaryDistributionCardProps> = ({ data }) => {
  const labels = data?.labels || ['Bull High', 'Bull Low', 'Bear High', 'Bear Low', 'Range'];
  const probs = data?.probabilities || [49.0, 37.5, 0.5, 8.6, 4.4];

  const getBarColor = (idx: number) => {
    switch (idx) {
      case 0:
        return 'from-emerald-500 to-teal-400';
      case 1:
        return 'from-cyan-500 to-teal-500';
      case 2:
        return 'from-purple-500 to-indigo-400';
      case 3:
        return 'from-rose-500 to-pink-400';
      default:
        return 'from-slate-500 to-slate-400';
    }
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">Stationary Ergodic Distribution (π)</h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">Steady-State Limit %</span>
      </div>

      <div className="space-y-3 py-1">
        {labels.map((lbl, idx) => {
          const prob = probs[idx] ?? 20.0;
          return (
            <div key={lbl} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-bold">{lbl}</span>
                <span className="text-cyan-300 font-extrabold font-mono">{prob.toFixed(1)}% Steady-State</span>
              </div>
              <div className="w-full h-2 bg-[#07090e] border border-[#161c28] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getBarColor(idx)} rounded-full transition-all`}
                  style={{ width: `${Math.max(5, prob)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-[#07090e] border border-[#161c28] rounded-xl text-[10px] text-slate-400 space-y-1 mt-2">
        <div className="font-bold text-white flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Perron-Frobenius Ergodic Guarantee</span>
        </div>
        <p>
          The stationary vector π satisfies π · P = π, representing the asymptotic probability of finding the market in each regime state.
        </p>
      </div>
    </div>
  );
};
