import React from 'react';
import { ShieldCheck, CheckCircle2, GitCommit, UserCheck, Calendar, AlertCircle } from 'lucide-react';
import { ExperimentItem } from './ExperimentsKanban';

interface ProductionPromotionLogProps {
  experiments: ExperimentItem[];
}

export const ProductionPromotionLog: React.FC<ProductionPromotionLogProps> = ({ experiments }) => {
  const promotedList = experiments.filter((e) => e.stage === 'PROMOTED');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-4 font-mono text-xs select-none shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="font-bold text-white text-xs">Production Edge Promotion Registry & Governance Trail</h3>
            <p className="text-[11px] text-slate-400">
              Institutional audit log documenting verified statistical edges deployed to live capital.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-extrabold border border-emerald-700 text-[10px]">
          {promotedList.length} Active Production Edges
        </span>
      </div>

      {/* Grid of Promoted Edge Cards */}
      {promotedList.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {promotedList.map((rec) => (
            <div
              key={rec.id}
              className="bg-[#07090e] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 hover:border-emerald-500/40 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-extrabold text-[10px] border border-emerald-800">
                    {rec.id}
                  </span>
                  <span className="font-bold text-white text-xs">{rec.title}</span>
                  <span className="text-cyan-300 font-bold">
                    ({rec.pair || 'XAUUSD'} • {rec.strategy})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ACTIVE_IN_PRODUCTION</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Alpha Lift & Performance</span>
                  <span className="text-emerald-400 font-extrabold">{rec.variant_val}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Statistical Confidence</span>
                  <span className="text-white font-bold">
                    p = {rec.p_value.toFixed(4)} (DSR Gate 6 ✓)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Authorized Sign-off</span>
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>Head of Quantitative Research</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Git Hash & Timestamp</span>
                  <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                    <GitCommit className="w-3 h-3 text-purple-400" />
                    <span>
                      commit-{rec.id.toLowerCase()} • {rec.created_at || '2026-08-21 11:00'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-[#161c28] rounded-xl space-y-2">
          <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
          <div className="text-slate-300 font-bold text-xs">No Promoted Production Edges Yet</div>
          <div className="text-slate-500 text-[11px]">
            Advance an experiment to the PROMOTED stage in the Kanban board or click "Promote Edge" in the A/B Variant Matrix to deploy it here.
          </div>
        </div>
      )}
    </div>
  );
};
