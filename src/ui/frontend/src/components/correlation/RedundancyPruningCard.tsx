import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface RedundancyWarningItem {
  pair: string;
  correlation: number;
  status: string;
  note: string;
}

interface RedundancyPruningCardProps {
  warnings?: RedundancyWarningItem[];
}

export const RedundancyPruningCard: React.FC<RedundancyPruningCardProps> = ({ warnings = [] }) => {
  const safeWarnings = warnings.length > 0 ? warnings : [
    {
      pair: 'Order Block v4 ↔ Liquidity Sweep v3',
      correlation: 0.42,
      status: 'ACCEPTABLE (< 0.65)',
      note: 'Both trade SMC principles but trigger on distinct market conditions.',
    },
    {
      pair: 'London Breakout v2 ↔ BB Reversion v4',
      correlation: 0.08,
      status: 'ORTHOGONAL (HIGH DIVERSIFICATION)',
      note: 'Breakout and Mean-Reversion models exhibit near-zero return co-dependence.',
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">Redundancy Pruning & Strategy Independence Audit</h3>
        </div>
        <span className="text-[10px] text-slate-400">Eigenvalue Spectrum Decomposition</span>
      </div>

      <div className="space-y-2.5">
        {safeWarnings.map((w, idx) => {
          const isCritical = w.status.includes('CRITICAL');
          const isOrthogonal = w.status.includes('ORTHOGONAL');

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border space-y-1.5 ${
                isCritical
                  ? 'bg-rose-950/10 border-rose-500/50'
                  : isOrthogonal
                  ? 'bg-emerald-950/10 border-emerald-500/40'
                  : 'bg-[#07090e] border-[#161c28]'
              }`}
            >
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-bold text-white text-xs">{w.pair}</span>
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-extrabold font-mono">r = {w.correlation.toFixed(2)}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300 border border-rose-700'
                        : isOrthogonal
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-[#121824] text-slate-300 border border-[#1a2232]'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-sans">{w.note}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
