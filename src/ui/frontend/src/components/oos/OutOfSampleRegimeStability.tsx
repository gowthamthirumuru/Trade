import React from 'react';
import { Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface OOSRegimeItem {
  regime: string;
  is_exp: number;
  oos_exp: number;
  retention_pct: number;
  status: string;
}

interface OutOfSampleRegimeStabilityProps {
  regimes?: OOSRegimeItem[];
}

export const OutOfSampleRegimeStability: React.FC<OutOfSampleRegimeStabilityProps> = ({
  regimes = [],
}) => {
  const safeRegimes = regimes.length > 0 ? regimes : [
    { regime: 'High Volatility Bull Trend', is_exp: 1.45, oos_exp: 1.28, retention_pct: 88.3, status: 'STABLE' },
    { regime: 'Low Volatility Bull Trend', is_exp: 0.62, oos_exp: 0.54, retention_pct: 87.1, status: 'STABLE' },
    { regime: 'High Volatility Bear Trend', is_exp: 0.98, oos_exp: 0.82, retention_pct: 83.7, status: 'STABLE' },
    { regime: 'Low Volatility Bear Trend', is_exp: 0.12, oos_exp: 0.08, retention_pct: 66.7, status: 'MODERATE' },
    { regime: 'Choppy / Sideways Regime', is_exp: -0.15, oos_exp: -0.18, retention_pct: 100.0, status: 'CIRCUIT PAUSED' },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">
            Out-of-Sample Regime Stability & Alpha Drift Audit
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Partitioned by Historical Macro Regimes</span>
      </div>

      <div className="space-y-2">
        {safeRegimes.map((r, idx) => {
          const isPaused = r.status.includes('PAUSED');
          const isModerate = r.status.includes('MODERATE');

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                isPaused
                  ? 'bg-slate-900/40 border-[#1a2232]'
                  : isModerate
                  ? 'bg-amber-950/10 border-amber-500/40'
                  : 'bg-[#07090e] border-[#161c28]'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs">{r.regime}</span>
                <div className="text-[10px] text-slate-400 flex items-center gap-3">
                  <span>IS Exp: <span className="text-blue-300 font-bold">{r.is_exp.toFixed(2)}R</span></span>
                  <span>→</span>
                  <span>OOS Exp: <span className="text-emerald-400 font-bold">{r.oos_exp.toFixed(2)}R</span></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase">Retention</span>
                  <span className="text-purple-300 font-bold text-xs">{r.retention_pct.toFixed(1)}%</span>
                </div>
                <span
                  className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase ${
                    isPaused
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : isModerate
                      ? 'bg-amber-950 text-amber-300 border border-amber-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
