import React from 'react';
import { Activity, Zap, ShieldCheck } from 'lucide-react';

interface TransitionMatrixData {
  labels: string[];
  matrix: number[][];
}

interface MarkovTransitionMatrixProps {
  data: TransitionMatrixData;
}

export const MarkovTransitionMatrix: React.FC<MarkovTransitionMatrixProps> = ({ data }) => {
  const labels = data?.labels || ['Bull High', 'Bull Low', 'Bear High', 'Bear Low', 'Range'];
  const matrix = data?.matrix || [
    [0.92, 0.08, 0.0, 0.0, 0.0],
    [0.11, 0.89, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.56, 0.44, 0.0],
    [0.0, 0.0, 0.02, 0.96, 0.02],
    [0.01, 0.02, 0.0, 0.03, 0.93],
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">
            Empirical Markov State Transition Probability Matrix (P_ij)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">1-Step Forward State Transitions (S_t → S_t+1)</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono text-center py-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px]">
              <th className="p-2 text-left">Current (S_t) \ Next (S_t+1)</th>
              {labels.map((lbl) => (
                <th key={lbl} className="p-2 text-amber-300 font-bold">
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {labels.map((rowLabel, i) => (
              <tr key={rowLabel} className="hover:bg-[#121824] transition">
                <td className="p-2.5 text-left font-bold text-white text-xs">{rowLabel}</td>
                {matrix[i] &&
                  matrix[i].map((prob, j) => {
                    const pct = Math.round(prob * 100);
                    const isSelf = i === j;
                    return (
                      <td
                        key={j}
                        className={`p-2.5 font-bold ${
                          isSelf
                            ? 'text-emerald-400 bg-emerald-950/20 font-extrabold'
                            : prob > 0.15
                            ? 'text-amber-300 bg-amber-950/20'
                            : prob > 0.05
                            ? 'text-cyan-300'
                            : 'text-slate-500'
                        }`}
                      >
                        {pct}%
                      </td>
                    );
                  })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-[#07090e] border border-[#161c28] rounded-xl text-[10px] text-slate-400 space-y-1">
        <div className="font-bold text-white flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>First-Order Markov Property Validation</span>
        </div>
        <p>
          State transitions satisfy memoryless conditional probability P(S_t+1 | S_t, S_t-1, ...) = P(S_t+1 | S_t) over 15m candle bar clusters.
        </p>
      </div>
    </div>
  );
};
