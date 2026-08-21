import React from 'react';
import { Layers, CheckSquare, Square, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export interface ConditionFeature {
  id: string;
  name: string;
  category: string;
  lift_pct: string;
  win_rate_before: number;
  win_rate_after: number;
  expectancy_before: number;
  expectancy_after: number;
  importance_score: number;
  p_value: number;
  trades_count: number;
  rule: string;
}

interface ConditionLiftRankingProps {
  conditions: ConditionFeature[];
  activeConditionIds: string[];
  onToggleCondition: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectTop3: () => void;
}

export const ConditionLiftRanking: React.FC<ConditionLiftRankingProps> = ({
  conditions,
  activeConditionIds,
  onToggleCondition,
  onSelectAll,
  onDeselectAll,
  onSelectTop3,
}) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">Individual Condition Attribution & Lift Ranking</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSelectTop3}
            className="px-2 py-1 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded text-cyan-300 font-bold text-[10px] transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Top 3 Alpha Stack</span>
          </button>

          <button
            onClick={onSelectAll}
            className="px-2 py-1 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded text-slate-300 hover:text-white font-bold text-[10px] transition"
          >
            Select All
          </button>

          <button
            onClick={onDeselectAll}
            className="px-2 py-1 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded text-slate-400 hover:text-white font-bold text-[10px] transition"
          >
            Clear Stack
          </button>
        </div>
      </div>

      {/* Conditions List */}
      <div className="space-y-2.5">
        {conditions.map((item) => {
          const isSelected = activeConditionIds.includes(item.id);
          const winDelta = (item.win_rate_after - item.win_rate_before).toFixed(1);
          const expDelta = (item.expectancy_after - item.expectancy_before).toFixed(2);

          return (
            <div
              key={item.id}
              onClick={() => onToggleCondition(item.id)}
              className={`p-3 rounded-xl border transition cursor-pointer space-y-2 ${
                isSelected
                  ? 'bg-cyan-950/15 border-cyan-500/50 shadow-sm shadow-cyan-950/20'
                  : 'bg-[#07090e] border-[#161c28] hover:border-[#222b3d]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    className={`w-4 h-4 rounded flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-cyan-500 text-black'
                        : 'border border-slate-600 bg-[#07090e] text-transparent'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 fill-current" /> : <Square className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#121824] text-slate-400 border border-[#1a2232]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">{item.rule}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded font-extrabold text-emerald-400 bg-emerald-950 border border-emerald-800 text-xs">
                    {item.lift_pct}
                  </span>
                </div>
              </div>

              {/* Metric Attribution Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] pt-2 border-t border-[#141a26] text-slate-400">
                <div>
                  Win Rate: <span className="text-white font-bold">{item.win_rate_after}%</span>{' '}
                  <span className="text-emerald-400 font-bold">(+{winDelta}%)</span>
                </div>
                <div>
                  Expectancy: <span className="text-emerald-400 font-bold">+{item.expectancy_after}R</span>{' '}
                  <span className="text-emerald-300 font-bold">(+{expDelta}R)</span>
                </div>
                <div>
                  Sample Size: <span className="text-slate-200 font-bold">{item.trades_count} Trades</span>
                </div>
                <div>
                  Significance:{' '}
                  <span className="text-cyan-300 font-bold">
                    p = {item.p_value.toFixed(4)} {item.p_value < 0.05 ? '✓' : ''}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
