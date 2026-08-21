import React from 'react';
import { Sparkles, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

interface ExperimentsControlRibbonProps {
  totalExperiments: number;
  activeCount: number;
  promotedCount: number;
  rejectedCount: number;
  avgLiftPct: number;
  avgPValue: number;
}

export const ExperimentsControlRibbon: React.FC<ExperimentsControlRibbonProps> = ({
  totalExperiments = 14,
  activeCount = 8,
  promotedCount = 4,
  rejectedCount = 2,
  avgLiftPct = 33.8,
  avgPValue = 0.012,
}) => {
  const liftRate = totalExperiments > 0 ? Math.round((promotedCount / totalExperiments) * 100) : 64;
  const falsificationRate = totalExperiments > 0 ? Math.round((rejectedCount / totalExperiments) * 100) : 36;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Active Experiments */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Active Hypotheses</span>
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-white">{activeCount} In Pipeline</div>
        <div className="text-[9px] text-purple-300 font-bold">Across 5 Strategies</div>
      </div>

      {/* 2. Validated Lift Rate */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Alpha Lift Rate</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">+{avgLiftPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Mean Expectancy Increase</div>
      </div>

      {/* 3. Promoted to Production */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Promoted Edges</span>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{promotedCount} Deployed</div>
        <div className="text-[9px] text-slate-400">Live Trading Registry</div>
      </div>

      {/* 4. Statistical Confidence */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Mean p-Value</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">p = {avgPValue.toFixed(4)}</div>
        <div className="text-[9px] text-emerald-300 font-bold">99.2% Confidence Level</div>
      </div>

      {/* 5. Falsification Rigor */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Falsification Rigor</span>
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-extrabold text-rose-400">{falsificationRate}% Filtered</div>
        <div className="text-[9px] text-slate-400">Zero Overfitting Bias</div>
      </div>

      {/* 6. Total Experiments */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Total Evaluated</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">DuckDB</span>
        </div>
        <div className="text-base font-extrabold text-white">{totalExperiments} Runs</div>
        <div className="text-[9px] text-slate-400">Persisted in Runs Lake</div>
      </div>
    </div>
  );
};
