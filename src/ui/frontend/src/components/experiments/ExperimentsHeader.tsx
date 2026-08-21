import React from 'react';
import { Plus, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';

export type ExperimentTab =
  | 'Kanban Pipeline'
  | 'A/B Variant Matrix'
  | 'Statistical Significance'
  | 'Hypothesis Registry'
  | 'Production Promotion Log';

interface ExperimentsHeaderProps {
  activeTab: ExperimentTab;
  onTabChange: (tab: ExperimentTab) => void;
  selectedStrategy: string;
  onStrategyChange: (strat: string) => void;
  onOpenNewModal: () => void;
}

export const ExperimentsHeader: React.FC<ExperimentsHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedStrategy,
  onStrategyChange,
  onOpenNewModal,
}) => {
  const tabs: ExperimentTab[] = [
    'Kanban Pipeline',
    'A/B Variant Matrix',
    'Statistical Significance',
    'Hypothesis Registry',
    'Production Promotion Log',
  ];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#121824]'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Action Buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <Filter className="w-3 h-3 text-slate-400" />
          <select
            value={selectedStrategy}
            onChange={(e) => onStrategyChange(e.target.value)}
            className="bg-transparent text-slate-300 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value="ALL">All Strategies</option>
            <option value="BB Reversion v4">BB Reversion v4</option>
            <option value="Order Block v4">Order Block v4</option>
            <option value="London Breakout v2">London Breakout v2</option>
            <option value="Liquidity Sweep v3">Liquidity Sweep v3</option>
            <option value="strategy_T04_F02">strategy_T04_F02</option>
          </select>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold rounded-lg text-xs shadow-lg shadow-purple-600/25 transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Hypothesis Experiment</span>
        </button>
      </div>
    </div>
  );
};
