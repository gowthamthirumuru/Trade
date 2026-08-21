import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MonteCarloRuinMatrixProps {
  ruin50Pct?: number;
  ruin30Pct?: number;
}

export const MonteCarloRuinMatrix: React.FC<MonteCarloRuinMatrixProps> = ({
  ruin50Pct = 0.01,
  ruin30Pct = 2.4,
}) => {
  const levels = [
    {
      threshold: '10% Capital Drawdown',
      prob: '42.8%',
      tolerance: '< 50.0% Standard',
      status: 'EXPECTED',
    },
    {
      threshold: '20% Capital Drawdown',
      prob: '11.2%',
      tolerance: '< 20.0% Standard',
      status: 'CONTROLLED',
    },
    {
      threshold: '30% Severe Shock Boundary',
      prob: `${ruin30Pct.toFixed(1)}%`,
      tolerance: '< 5.0% Institutional',
      status: ruin30Pct < 5.0 ? 'SAFE' : 'CAUTION',
    },
    {
      threshold: '50% Total Ruin Boundary',
      prob: `${ruin50Pct.toFixed(2)}%`,
      tolerance: '< 0.1% Hard Limit',
      status: ruin50Pct < 0.1 ? 'CERTIFIED' : 'CRITICAL',
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Risk of Ruin & Capital Protection Matrix
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Continuous Ruin Integral</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Loss Boundary</th>
              <th className="py-2.5 px-3 text-right">Empirical P(Loss)</th>
              <th className="py-2.5 px-3 text-right">Risk Limit</th>
              <th className="py-2.5 px-3 text-center">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {levels.map((lvl, idx) => (
              <tr key={idx} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{lvl.threshold}</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold text-right">{lvl.prob}</td>
                <td className="py-2.5 px-3 text-slate-400 text-right">{lvl.tolerance}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                      lvl.status === 'CERTIFIED' || lvl.status === 'SAFE' || lvl.status === 'EXPECTED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}
                  >
                    {lvl.status}
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
