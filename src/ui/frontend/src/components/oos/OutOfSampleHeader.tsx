import React from 'react';
import { Zap, RotateCcw, Download, Split, ShieldAlert } from 'lucide-react';

interface OutOfSampleHeaderProps {
  selectedStrategy: string;
  onStrategyChange: (strat: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  selectedSplitPct: number;
  onSplitPctChange: (pct: number) => void;
  selectedEmbargo: number;
  onEmbargoChange: (emb: number) => void;
  onRecompute: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export const OutOfSampleHeader: React.FC<OutOfSampleHeaderProps> = ({
  selectedStrategy,
  onStrategyChange,
  selectedPair,
  onPairChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedSplitPct,
  onSplitPctChange,
  selectedEmbargo,
  onEmbargoChange,
  onRecompute,
  onExportCSV,
  isLoading,
}) => {
  const splitOptions = [
    { label: '70% IS / 30% OOS', val: 70 },
    { label: '60% IS / 40% OOS', val: 60 },
    { label: '80% IS / 20% OOS', val: 80 },
  ];

  const timeframes = ['15m', '1h', '4h', '1d'];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Split Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Split className="w-3 h-3 text-purple-400" />
          <span>Data Split</span>
        </span>
        {splitOptions.map((s) => {
          const isActive = selectedSplitPct === s.val;
          return (
            <button
              key={s.val}
              onClick={() => onSplitPctChange(s.val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Model / Pair / Embargo & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Timeframe */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedTimeframe === tf
                  ? 'bg-[#1e1730] text-purple-300 font-extrabold border border-purple-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Strategy Selector */}
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

        {/* Pair Selector */}
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Asset</span>
          <select
            value={selectedPair}
            onChange={(e) => onPairChange(e.target.value)}
            className="bg-transparent text-purple-400 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value="XAUUSD">XAUUSD</option>
            <option value="EURUSD">EURUSD</option>
            <option value="GBPUSD">GBPUSD</option>
            <option value="USDJPY">USDJPY</option>
            <option value="BTCUSDT">BTCUSDT</option>
          </select>
        </div>

        {/* Embargo Gap */}
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Embargo</span>
          <select
            value={selectedEmbargo}
            onChange={(e) => onEmbargoChange(Number(e.target.value))}
            className="bg-transparent text-amber-300 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value={0}>0 Bars</option>
            <option value={50}>50 Bars</option>
            <option value={100}>100 Bars</option>
          </select>
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-slate-300 hover:text-white transition font-bold text-xs"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onRecompute}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold rounded-lg text-xs shadow-lg shadow-purple-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Teardown...' : 'Run Gauntlet'}</span>
        </button>
      </div>
    </div>
  );
};
