import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ResearchWarning } from '../../types';

interface ResearchWarningsProps {
  warnings: ResearchWarning[];
  onViewAll?: () => void;
  onSelectWarning?: (warning: ResearchWarning) => void;
}

export const ResearchWarnings: React.FC<ResearchWarningsProps> = ({
  warnings,
  onViewAll,
  onSelectWarning,
}) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'High':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
            Low
          </span>
        );
    }
  };

  const getIcon = (sev: string) => {
    switch (sev) {
      case 'High':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
      case 'Medium':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'Low':
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="quant-card p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Research Warnings</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          View all
        </button>
      </div>

      {/* Warnings List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {warnings.map((w) => (
          <div
            key={w.id}
            onClick={() => onSelectWarning && onSelectWarning(w)}
            className="p-2.5 rounded-lg bg-[#0B0E17]/60 border border-[#161F38] hover:border-slate-700 cursor-pointer transition space-y-1 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {getIcon(w.severity)}
                <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition truncate">
                  {w.title}
                </span>
              </div>
              <div className="shrink-0">{getSeverityBadge(w.severity)}</div>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed pl-5">
              {w.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
