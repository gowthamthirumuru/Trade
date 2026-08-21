import React from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Play,
  GitCompare,
  TrendingUp,
} from 'lucide-react';

export interface ExperimentItem {
  id: string;
  title: string;
  strategy: string;
  pair?: string;
  timeframe?: string;
  stage: string;
  progress_pct: number;
  hypothesis: string;
  target_metric: string;
  baseline_val: string;
  variant_val: string;
  p_value: number;
  status: string;
  created_at?: string;
}

interface ExperimentsKanbanProps {
  experiments: ExperimentItem[];
  onAdvanceStage: (id: string) => void;
  onInspectAB: (exp: ExperimentItem) => void;
}

export const ExperimentsKanban: React.FC<ExperimentsKanbanProps> = ({
  experiments,
  onAdvanceStage,
  onInspectAB,
}) => {
  const columns = [
    { id: 'DESIGN', title: '1. Formulation & Design', color: 'border-slate-700/60 bg-slate-900/10 text-slate-300' },
    { id: 'BACKTESTING', title: '2. In-Sample Backtest', color: 'border-blue-700/60 bg-blue-900/10 text-blue-300' },
    { id: 'OOS VALIDATION', title: '3. OOS Blind Gauntlet', color: 'border-amber-700/60 bg-amber-900/10 text-amber-300' },
    { id: 'MONTE CARLO', title: '4. Monte Carlo & Stress', color: 'border-purple-700/60 bg-purple-900/10 text-purple-300' },
    { id: 'PROMOTED', title: '5. Governance & Production', color: 'border-emerald-700/60 bg-emerald-900/10 text-emerald-300' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 font-mono text-xs select-none">
      {columns.map((col) => {
        const colExperiments = experiments.filter((e) => {
          if (col.id === 'PROMOTED') {
            return e.stage === 'PROMOTED' || e.stage === 'REJECTED' || e.stage === 'FALSIFIED';
          }
          return e.stage === col.id;
        });

        return (
          <div
            key={col.id}
            className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 flex flex-col justify-between space-y-3 min-h-[580px]"
          >
            {/* Column Header */}
            <div className={`p-2 rounded-lg border flex items-center justify-between ${col.color}`}>
              <span className="font-extrabold text-[11px] truncate">{col.title}</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-extrabold">
                {colExperiments.length}
              </span>
            </div>

            {/* Column Cards Stream */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5 max-h-[520px]">
              {colExperiments.map((exp) => {
                const isSig = exp.p_value < 0.05;
                const isPromoted = exp.stage === 'PROMOTED';
                const isRejected = exp.stage === 'REJECTED' || exp.stage === 'FALSIFIED';

                return (
                  <div
                    key={exp.id}
                    className="bg-[#07090e] border border-[#161c28] hover:border-purple-500/50 rounded-xl p-3 space-y-2.5 transition duration-150 shadow-sm flex flex-col justify-between group"
                  >
                    {/* Card Top Meta */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold text-purple-400 font-mono">
                          {exp.id}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#121824] text-cyan-300 border border-[#1a2232] font-bold">
                          {exp.pair || 'XAUUSD'}
                        </span>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded uppercase ${
                          isPromoted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : isRejected
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-[#121824] text-slate-300 border border-[#1a2232]'
                        }`}
                      >
                        {exp.stage}
                      </span>
                    </div>

                    {/* Card Title & Strategy */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-xs group-hover:text-purple-300 transition line-clamp-2">
                        {exp.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        Model: <span className="text-slate-200">{exp.strategy}</span>
                      </div>
                    </div>

                    {/* Hypothesis Thesis */}
                    <div className="p-2 bg-[#0b0e14] rounded-lg border border-[#141a26] text-[10px] text-slate-300 italic leading-relaxed line-clamp-3">
                      "{exp.hypothesis}"
                    </div>

                    {/* Baseline vs Variant Delta & p-Value */}
                    <div className="space-y-1.5 pt-1.5 border-t border-[#141a26]">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Target Metric:</span>
                        <span className="text-white font-bold">{exp.target_metric}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Baseline → Variant:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-[140px]">
                          {exp.variant_val}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Significance:</span>
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isSig ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isSig ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                          <span>p = {exp.p_value.toFixed(4)}</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1 bg-[#141a26] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isPromoted
                              ? 'bg-emerald-500'
                              : isRejected
                              ? 'bg-rose-500'
                              : 'bg-purple-500'
                          }`}
                          style={{ width: `${exp.progress_pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Triggers */}
                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#141a26]">
                      <button
                        onClick={() => onInspectAB(exp)}
                        className="flex-1 py-1 bg-[#121824] hover:bg-[#1a2232] text-cyan-300 hover:text-white border border-[#1a2232] rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                      >
                        <GitCompare className="w-2.5 h-2.5" />
                        <span>Inspect A/B</span>
                      </button>

                      {!isPromoted && !isRejected && (
                        <button
                          onClick={() => onAdvanceStage(exp.id)}
                          className="flex-1 py-1 bg-purple-900/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-600/40 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {colExperiments.length === 0 && (
                <div className="p-4 text-center text-slate-600 text-[11px] border border-dashed border-[#161c28] rounded-xl">
                  No experiments in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
