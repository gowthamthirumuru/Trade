import React from 'react';
import { HelpCircle } from 'lucide-react';
import { ActiveExperiment } from '../../types';

interface ActiveExperimentsProps {
  experiments: ActiveExperiment[];
  onViewAll?: () => void;
  onSelectExperiment?: (exp: ActiveExperiment) => void;
}

export const ActiveExperiments: React.FC<ActiveExperimentsProps> = ({
  experiments,
  onViewAll,
  onSelectExperiment,
}) => {
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'OOS VALIDATION':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
            {stage}
          </span>
        );
      case 'TESTING':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded">
            {stage}
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
            {stage}
          </span>
        );
      case 'DESIGN':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded">
            {stage}
          </span>
        );
      case 'QUEUED':
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-slate-500/10 text-slate-400 border border-slate-500/30 rounded">
            {stage}
          </span>
        );
    }
  };

  const getProgressBarColor = (stage: string) => {
    switch (stage) {
      case 'OOS VALIDATION':
        return 'bg-cyan-500';
      case 'TESTING':
        return 'bg-purple-500';
      case 'ANALYZING':
        return 'bg-emerald-500';
      case 'DESIGN':
        return 'bg-rose-500';
      case 'QUEUED':
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="quant-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#161F38] flex items-center justify-between">
        <h2 className="text-sm font-bold text-white tracking-tight">Active Experiments</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          View all
        </button>
      </div>

      {/* Experiment List */}
      <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            onClick={() => onSelectExperiment && onSelectExperiment(exp)}
            className="space-y-1.5 cursor-pointer group"
          >
            {/* Title & Stage Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-1.5 min-w-0">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition truncate">
                  {exp.title}
                </span>
              </div>
              <div className="shrink-0">{getStageBadge(exp.stage)}</div>
            </div>

            {/* Strategy subtitle */}
            <div className="text-[11px] text-slate-400 pl-5">
              {exp.strategy}
            </div>

            {/* Progress bar and % */}
            <div className="flex items-center gap-2 pl-5">
              <div className="flex-1 h-1.5 rounded-full bg-[#161F38] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                    exp.stage
                  )}`}
                  style={{ width: `${exp.progress_pct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-medium shrink-0">
                {exp.progress_pct}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
