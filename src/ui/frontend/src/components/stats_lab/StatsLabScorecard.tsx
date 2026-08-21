import React from 'react';
import { ShieldCheck, Calculator, CheckCircle2 } from 'lucide-react';

interface StatsLabScorecardProps {
  tStat?: number;
  pValue?: number;
  ciLower?: number;
  ciUpper?: number;
  skewness?: number;
  kurtosis?: number;
  alphaLevel?: number;
}

export const StatsLabScorecard: React.FC<StatsLabScorecardProps> = ({
  tStat = 4.82,
  pValue = 0.00001,
  ciLower = 0.78,
  ciUpper = 1.04,
  skewness = 1.24,
  kurtosis = 4.82,
  alphaLevel = 0.05,
}) => {
  const gates = [
    {
      gate: 'Null Hypothesis H0',
      description: 'Mean return = 0 (Zero Edge)',
      calc: `t = ${tStat.toFixed(2)}, p = ${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}`,
      limit: `p < ${alphaLevel} Threshold`,
      status: pValue < alphaLevel ? 'REJECT H0' : 'FAIL TO REJECT',
    },
    {
      gate: 'Bootstrap Expectancy',
      description: '95% Non-Zero Confidence Interval',
      calc: `[+${ciLower.toFixed(2)}R, +${ciUpper.toFixed(2)}R]`,
      limit: 'Lower Bound > 0.0R',
      status: ciLower > 0 ? 'PASSED' : 'FLAGGED',
    },
    {
      gate: 'Asymmetry & Skew',
      description: 'Return distribution right-skewness',
      calc: `γ₁ = +${skewness.toFixed(2)}`,
      limit: '> 0.0 Positive Tail',
      status: skewness > 0 ? 'PRIME' : 'NEGATIVE',
    },
    {
      gate: 'Tail Fatness',
      description: 'Return distribution kurtosis',
      calc: `γ₂ = ${kurtosis.toFixed(2)}`,
      limit: '> 3.0 Fat-Tailed',
      status: kurtosis > 3.0 ? 'FAT-TAILED' : 'MESOKURTIC',
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Institutional Statistical Inference &amp; Decision Scorecard
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Formal Hypothesis Certification</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Inference Gate</th>
              <th className="py-2.5 px-3">Null / Criterion Description</th>
              <th className="py-2.5 px-3 text-right">Calculated Metric</th>
              <th className="py-2.5 px-3 text-right">Significance Limit</th>
              <th className="py-2.5 px-3 text-center">Decision Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {gates.map((g, idx) => (
              <tr key={idx} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{g.gate}</td>
                <td className="py-2.5 px-3 text-slate-300">{g.description}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold text-right">{g.calc}</td>
                <td className="py-2.5 px-3 text-slate-400 text-right">{g.limit}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                      g.status === 'REJECT H0' || g.status === 'PASSED' || g.status === 'PRIME'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : g.status === 'FAT-TAILED'
                        ? 'bg-purple-950 text-purple-300 border border-purple-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
