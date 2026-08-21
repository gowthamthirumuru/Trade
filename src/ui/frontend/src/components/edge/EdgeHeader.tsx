import React from 'react';
import { BookmarkPlus, Compass, Filter } from 'lucide-react';

export type EdgeTab =
  | 'Multi-Dimensional Slicer'
  | 'Condition Attribution'
  | 'Regime Matrix & Markov'
  | 'Pattern Mining & SMC'
  | 'Correlation & Diversification';

interface EdgeHeaderProps {
  activeTab: EdgeTab;
  onTabChange: (tab: EdgeTab) => void;
  selectedStrategy: string;
  onStrategyChange: (strat: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  onSaveEdgeCard: () => void;
  saveCardStatus?: string | null;
}

export const EdgeHeader: React.FC<EdgeHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedStrategy,
  onStrategyChange,
  selectedPair,
  onPairChange,
  onSaveEdgeCard,
  saveCardStatus,
}) => {
  const tabs: EdgeTab[] = [
    'Multi-Dimensional Slicer',
    'Condition Attribution',
    'Regime Matrix & Markov',
    'Pattern Mining & SMC',
    'Correlation & Diversification',
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
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-black font-extrabold shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#121824]'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Strategy / Pair Selector & Save Button */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Model</span>
          <select
            value={selectedStrategy}
            onChange={(e) => onStrategyChange(e.target.value)}
            className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value="BB Reversion v4">BB Reversion v4</option>
            <option value="Order Block v4">Order Block v4</option>
            <option value="London Breakout v2">London Breakout v2</option>
            <option value="Liquidity Sweep v3">Liquidity Sweep v3</option>
            <option value="strategy_T04_F02">strategy_T04_F02</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Asset</span>
          <select
            value={selectedPair}
            onChange={(e) => onPairChange(e.target.value)}
            className="bg-transparent text-cyan-300 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value="XAUUSD">XAUUSD</option>
            <option value="EURUSD">EURUSD</option>
            <option value="GBPUSD">GBPUSD</option>
            <option value="USDJPY">USDJPY</option>
            <option value="BTCUSDT">BTCUSDT</option>
          </select>
        </div>

        {saveCardStatus && (
          <span className="text-[10px] font-bold text-emerald-400 animate-pulse px-1">
            {saveCardStatus}
          </span>
        )}

        <button
          onClick={onSaveEdgeCard}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95 whitespace-nowrap"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
          <span>Save as Validated Edge Card</span>
        </button>
      </div>
    </div>
  );
};
