import React from 'react';
import { Activity, RotateCcw, Download, Sparkles, Sliders } from 'lucide-react';

interface MonteCarloHeaderProps {
  selectedStrategy: string;
  onStrategyChange: (strat: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  selectedIterations: number;
  onIterationsChange: (n: number) => void;
  selectedMethod: string;
  onMethodChange: (m: string) => void;
  onRecompute: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export const MonteCarloHeader: React.FC<MonteCarloHeaderProps> = ({
  selectedStrategy,
  onStrategyChange,
  selectedPair,
  onPairChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedIterations,
  onIterationsChange,
  selectedMethod,
  onMethodChange,
  onRecompute,
  onExportCSV,
  isLoading,
}) => {
  const methods = [
    { id: 'stationary', label: 'Stationary Bootstrap (IID)' },
    { id: 'block', label: 'Block Bootstrap (Autocorrelated)' },
  ];

  const iterationOptions = [1000, 5000, 10000];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Resample Method Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Method</span>
        </span>
        {methods.map((m) => {
          const isActive = selectedMethod === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onMethodChange(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-extrabold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Model / Pair / Iterations & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Iterations count */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-0.5">
          {iterationOptions.map((n) => (
            <button
              key={n}
              onClick={() => onIterationsChange(n)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedIterations === n
                  ? 'bg-[#132332] text-cyan-300 font-extrabold border border-cyan-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {n >= 1000 ? `${n / 1000}k` : n} Paths
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
            className="bg-transparent text-cyan-400 font-bold outline-none cursor-pointer text-[11px]"
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Simulating...' : 'Re-Run Paths'}</span>
        </button>
      </div>
    </div>
  );
};
