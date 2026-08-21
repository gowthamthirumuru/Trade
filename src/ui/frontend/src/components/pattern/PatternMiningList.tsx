import React from 'react';
import { Binary, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export interface DiscoveredPattern {
  id: string;
  pattern: string;
  category: string;
  frequency: number;
  win_rate: number;
  avg_r: number;
  lift: string;
  profit_factor: number;
  p_value: number;
  optimal_entry: string;
  stop_loss: string;
  take_profit: string;
  r_distribution?: number[];
}

interface PatternMiningListProps {
  patterns: DiscoveredPattern[];
  selectedPatternId: string;
  onSelectPattern: (pat: DiscoveredPattern) => void;
}

export const PatternMiningList: React.FC<PatternMiningListProps> = ({
  patterns,
  selectedPatternId,
  onSelectPattern,
}) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">Ranked Discovered Candlestick & Structural Patterns</h3>
        </div>
        <span className="text-[10px] text-slate-400">Sorted by Empirical Marginal Lift</span>
      </div>

      <div className="space-y-3">
        {patterns.map((item) => {
          const isSelected = selectedPatternId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectPattern(item)}
              className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2.5 ${
                isSelected
                  ? 'bg-[#121824] border-cyan-500 shadow-md shadow-cyan-950/30'
                  : 'bg-[#07090e] border-[#161c28] hover:border-cyan-500/40 hover:bg-[#0b0e14]'
              }`}
            >
              {/* Header: ID, Name, Category & Lift */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#161f30] text-cyan-300 border border-[#233148]">
                    {item.id}
                  </span>
                  <span className="font-bold text-white text-xs">{item.pattern}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-[#121824] text-slate-400 border border-[#1a2232]">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Freq: {item.frequency}</span>
                  <span className="px-2.5 py-0.5 rounded font-extrabold font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 text-xs">
                    {item.lift}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono py-1.5 bg-[#07090e] rounded-lg border border-[#141a26]">
                <div>
                  <span className="text-slate-500 block uppercase text-[8px]">Win Rate</span>
                  <span className="text-emerald-400 font-bold text-xs">{item.win_rate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px]">Avg Return</span>
                  <span className="text-emerald-400 font-bold text-xs">+{item.avg_r.toFixed(2)}R</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px]">Profit Factor</span>
                  <span className="text-cyan-300 font-bold text-xs">{item.profit_factor.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[8px]">Significance</span>
                  <span className="text-purple-300 font-bold text-xs">p = {item.p_value.toFixed(4)}</span>
                </div>
              </div>

              {/* Institutional Execution Rules */}
              <div className="space-y-1 text-[11px] text-slate-300 border-t border-[#141a26] pt-2">
                <div className="flex items-start gap-1.5">
                  <span className="text-slate-500 font-bold w-20 flex-shrink-0 text-[10px] uppercase">Optimal Entry:</span>
                  <span className="text-slate-200">{item.optimal_entry}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-slate-500 font-bold w-20 flex-shrink-0 text-[10px] uppercase">Stop Loss:</span>
                  <span className="text-rose-300">{item.stop_loss}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-slate-500 font-bold w-20 flex-shrink-0 text-[10px] uppercase">Take Profit:</span>
                  <span className="text-emerald-300">{item.take_profit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
