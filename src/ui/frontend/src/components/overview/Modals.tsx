import React from 'react';
import { X, ExternalLink, ShieldCheck, AlertTriangle, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { StrategyItem, ValidatedEdge, ActiveExperiment, ResearchWarning } from '../../types';

interface StrategyModalProps {
  strategy: StrategyItem | null;
  onClose: () => void;
  onGoToLab: () => void;
}

export const StrategyModal: React.FC<StrategyModalProps> = ({ strategy, onClose, onGoToLab }) => {
  if (!strategy) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101426] border border-[#2A365E] rounded-xl w-full max-w-lg shadow-2xl shadow-purple-950/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#161F38] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-purple-600/30 text-purple-300 text-xs font-bold flex items-center justify-center font-mono">
              #{strategy.rank}
            </span>
            <h3 className="font-bold text-white text-base">{strategy.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[11px]">Expectancy E[R]</span>
              <span className="text-base font-bold text-emerald-400">+{strategy.expectancy_r.toFixed(2)}R</span>
            </div>
            <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[11px]">OOS Expectancy</span>
              <span className="text-base font-bold text-emerald-400">+{strategy.oos_expectancy_r.toFixed(2)}R</span>
            </div>
            <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[11px]">Profit Factor</span>
              <span className="text-base font-bold text-slate-200">{strategy.profit_factor.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[11px]">Max Drawdown</span>
              <span className="text-sm font-bold text-slate-200">{strategy.max_dd_pct.toFixed(1)}%</span>
            </div>
            <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[11px]">Robustness Score</span>
              <span className="text-sm font-bold text-emerald-400">{strategy.robustness_score}/100</span>
            </div>
            <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[11px]">Total Trades</span>
              <span className="text-sm font-bold text-slate-300">{strategy.trades_count.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38] space-y-1">
            <div className="text-[11px] font-bold text-slate-300 font-sans">Execution & Slippage Model:</div>
            <div className="text-slate-400 font-mono text-[10px]">
              Taker Fee: 5.0 bps | Realistic Slippage: 2.0 bps | Intrabar: Pessimistic SL First
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0B0E17] border-t border-[#161F38] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 bg-[#161F38] hover:bg-slate-700 text-slate-300 rounded text-xs">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToLab();
            }}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-900/30"
          >
            Open in Strategy Lab <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface EdgeModalProps {
  edge: ValidatedEdge | null;
  onClose: () => void;
  onExplore: () => void;
}

export const EdgeModal: React.FC<EdgeModalProps> = ({ edge, onClose, onExplore }) => {
  if (!edge) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101426] border border-[#2A365E] rounded-xl w-full max-w-lg shadow-2xl shadow-emerald-950/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#161F38] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">{edge.pair} • {edge.strategy_name}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38] space-y-1">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Multi-Condition Slice Rule</span>
            <div className="font-mono text-emerald-300 text-xs font-semibold">{edge.filters_desc}</div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2.5 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[10px]">Expectancy</span>
              <span className="font-bold text-emerald-400 text-sm">+{edge.expectancy_r.toFixed(2)}R</span>
            </div>
            <div className="p-2.5 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[10px]">OOS</span>
              <span className="font-bold text-emerald-400 text-sm">+{edge.oos_expectancy_r.toFixed(2)}R</span>
            </div>
            <div className="p-2.5 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[10px]">Profit Factor</span>
              <span className="font-bold text-slate-200 text-sm">{edge.profit_factor.toFixed(2)}</span>
            </div>
            <div className="p-2.5 bg-[#0B0E17] rounded border border-[#161F38]">
              <span className="text-slate-400 font-sans block text-[10px]">Trades</span>
              <span className="font-bold text-slate-200 text-sm">{edge.trades_count}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded text-emerald-300 text-[11px]">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Passed CSCV Overfitting Gauntlet & Monte Carlo 10k Path Shuffles.</span>
          </div>
        </div>

        <div className="p-4 bg-[#0B0E17] border-t border-[#161F38] flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 bg-[#161F38] text-slate-300 rounded text-xs">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onExplore();
            }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1.5"
          >
            Open in Edge Explorer <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface ExperimentModalProps {
  experiment: ActiveExperiment | null;
  onClose: () => void;
  onUpdateStage: (stage: string, progress: number) => void;
}

export const ExperimentModal: React.FC<ExperimentModalProps> = ({ experiment, onClose, onUpdateStage }) => {
  if (!experiment) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#101426] border border-[#2A365E] rounded-xl w-full max-w-lg shadow-2xl shadow-purple-950/40 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-[#161F38] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">Active Experiment Pipeline</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold">Hypothesis</span>
            <div className="font-bold text-white text-sm mt-0.5">{experiment.title}</div>
            <div className="text-slate-400 text-[11px] mt-1">Target Model: {experiment.strategy}</div>
          </div>

          <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38] space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Lifecycle Stage:</span>
              <span className="font-bold text-purple-300 font-mono">{experiment.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Validation Progress:</span>
              <span className="font-bold text-emerald-400 font-mono">{experiment.progress_pct}%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px]">Advance Lifecycle Stage:</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
              {['TESTING', 'OOS VALIDATION', 'ANALYZING'].map((stg) => (
                <button
                  key={stg}
                  onClick={() => {
                    const prog = stg === 'TESTING' ? 45 : stg === 'OOS VALIDATION' ? 67 : 85;
                    onUpdateStage(stg, prog);
                    onClose();
                  }}
                  className="p-2 rounded bg-[#0B0E17] border border-[#161F38] hover:border-purple-500 text-slate-200 hover:text-white transition text-center font-bold"
                >
                  {stg}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0B0E17] border-t border-[#161F38] flex justify-end">
          <button onClick={onClose} className="px-3 py-1.5 bg-[#161F38] text-slate-300 rounded text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
