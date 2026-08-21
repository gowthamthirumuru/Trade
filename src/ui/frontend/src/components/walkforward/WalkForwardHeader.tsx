import React from 'react';
import { ShieldCheck, RotateCcw, Download, SlidersHorizontal, Layers } from 'lucide-react';

interface WalkForwardHeaderProps {
  selectedStrategy: string;
  onStrategyChange: (strat: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  selectedMode: string;
  onModeChange: (mode: string) => void;
  selectedWindows: number;
  onWindowsChange: (n: number) => void;
  onRecompute: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export const WalkForwardHeader: React.FC<WalkForwardHeaderProps> = ({
  selectedStrategy,
  onStrategyChange,
  selectedPair,
  onPairChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedMode,
  onModeChange,
  selectedWindows,
  onWindowsChange,
  onRecompute,
  onExportCSV,
  isLoading,
}) => {
  const modes = [
    { id: 'rolling', label: 'Rolling Windows' },
    { id: 'anchored', label: 'Anchored Windows' },
  ];

  const windowOptions = [3, 5, 8, 10];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Mode Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>Mode</span>
        </span>
        {modes.map((m) => {
          const isActive = selectedMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Model / Pair / Windows & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Window count */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-0.5">
          {windowOptions.map((n) => (
            <button
              key={n}
              onClick={() => onWindowsChange(n)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedWindows === n
                  ? 'bg-[#12231c] text-emerald-300 font-extrabold border border-emerald-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {n}W
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
            className="bg-transparent text-emerald-400 font-bold outline-none cursor-pointer text-[11px]"
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
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onRecompute}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-emerald-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Simulating...' : 'Execute Walk-Forward'}</span>
        </button>
      </div>
    </div>
  );
};
