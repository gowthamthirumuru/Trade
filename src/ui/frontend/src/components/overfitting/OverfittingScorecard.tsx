import React from 'react';
import { ShieldCheck, CheckCircle2, Binary, Zap, Percent } from 'lucide-react';

interface OverfittingScorecardProps {
  observedSharpe?: number;
  deflatedSharpe?: number;
  dsrPValue?: number;
  pboPct?: number;
  skewness?: number;
  kurtosis?: number;
  trialsN?: number;
  haircutSharpe?: number;
}

export const OverfittingScorecard: React.FC<OverfittingScorecardProps> = ({
  observedSharpe = 2.18,
  deflatedSharpe = 0.9956,
  dsrPValue = 0.0042,
  pboPct = 12.0,
  skewness = 1.24,
  kurtosis = 4.82,
  trialsN = 184,
  haircutSharpe = 1.76,
}) => {
  const gates = [
    {
      gate: 'Gate 6: DSR',
      dimension: 'Deflated Sharpe p-value',
      calc: `p = ${dsrPValue.toFixed(4)}`,
      limit: 'p < 0.05 Target',
      status: dsrPValue < 0.05 ? 'PASSED' : 'FLAGGED',
    },
    {
      gate: 'Gate 5: PBO',
      dimension: 'CSCV Overfitting Risk',
      calc: `${pboPct.toFixed(1)}%`,
      limit: '< 20.0% Target',
      status: pboPct < 20.0 ? 'PASSED' : 'FLAGGED',
    },
    {
      gate: 'Non-Normality',
      dimension: 'Return Distribution Skew',
      calc: skewness >= 0 ? `+${skewness.toFixed(2)}` : skewness.toFixed(2),
      limit: 'Right-skewed positive tail',
      status: 'PRIME',
    },
    {
      gate: 'Non-Normality',
      dimension: 'Return Distribution Kurtosis',
      calc: kurtosis.toFixed(2),
      limit: 'Fat-tail adjusted variance',
      status: 'ADJUSTED',
    },
    {
      gate: 'Selection Bias',
      dimension: 'Haircut Sharpe (Penalized)',
      calc: `SR = ${haircutSharpe.toFixed(2)}`,
      limit: '> 1.20 Hurdle Rate',
      status: haircutSharpe > 1.20 ? 'CERTIFIED' : 'LOW',
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Gate 5 &amp; Gate 6 Statistical Verification Scorecard
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Institutional Quant Standard §15.3 &amp; §22</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Validation Gate</th>
              <th className="py-2.5 px-3">Statistical Dimension</th>
              <th className="py-2.5 px-3 text-right">Calculated Value</th>
              <th className="py-2.5 px-3 text-right">Institutional Limit</th>
              <th className="py-2.5 px-3 text-center">Audit Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {gates.map((g, idx) => (
              <tr key={idx} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{g.gate}</td>
                <td className="py-2.5 px-3 text-slate-300">{g.dimension}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold text-right">{g.calc}</td>
                <td className="py-2.5 px-3 text-slate-400 text-right">{g.limit}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                      g.status === 'PASSED' || g.status === 'CERTIFIED' || g.status === 'PRIME'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : g.status === 'ADJUSTED'
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
