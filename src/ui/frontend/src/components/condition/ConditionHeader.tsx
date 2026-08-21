import React from 'react';
import { Layers, RotateCcw, Download, Filter } from 'lucide-react';

interface ConditionHeaderProps {
  selectedStrategy: string;
  onStrategyChange: (strat: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onRecompute: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export const ConditionHeader: React.FC<ConditionHeaderProps> = ({
  selectedStrategy,
  onStrategyChange,
  selectedPair,
  onPairChange,
  selectedCategory,
  onCategoryChange,
  onRecompute,
  onExportCSV,
  isLoading,
}) => {
  const categories = [
    'All Categories',
    'Session Timing',
    'Volatility Filters',
    'Trend Alignment',
    'Structure & Liquidity',
    'News Blackouts',
  ];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-black font-extrabold shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#121824]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Model / Pair Controls & Action Buttons */}
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

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-slate-300 hover:text-white transition font-bold text-xs"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onRecompute}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-cyan-600/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Attributing...' : 'Recompute Lift'}</span>
        </button>
      </div>
    </div>
  );
};
