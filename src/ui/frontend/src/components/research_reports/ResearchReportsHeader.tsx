import React from 'react';
import { FileText, RotateCcw, Filter, Plus } from 'lucide-react';

interface ResearchReportsHeaderProps {
  selectedType: string;
  onTypeChange: (t: string) => void;
  selectedStrategy: string;
  onStrategyChange: (strat: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  onRecompute: () => void;
  isLoading: boolean;
}

export const ResearchReportsHeader: React.FC<ResearchReportsHeaderProps> = ({
  selectedType,
  onTypeChange,
  selectedStrategy,
  onStrategyChange,
  selectedPair,
  onPairChange,
  selectedTimeframe,
  onTimeframeChange,
  onRecompute,
  isLoading,
}) => {
  const types = [
    { label: 'All Reports', val: 'ALL' },
    { label: 'Weekly Audits', val: 'Weekly Audit' },
    { label: 'Gate 1–6 Certificates', val: 'Validation Certificate' },
    { label: 'Friction Stress', val: 'Friction Stress' },
    { label: 'Statistical Lab', val: 'Statistical Lab' },
    { label: 'Macro Stress', val: 'Macro Stress' },
  ];

  const timeframes = ['15m', '1h', '4h', '1d'];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Report Type Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-cyan-400" />
          <span>Filter</span>
        </span>
        {types.map((t) => {
          const isActive = selectedType === t.val;
          return (
            <button
              key={t.val}
              onClick={() => onTypeChange(t.val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-extrabold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Model / Asset / Timeframe & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Timeframe */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedTimeframe === tf
                  ? 'bg-[#12232a] text-cyan-300 font-extrabold border border-cyan-800/50'
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
          onClick={onRecompute}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Compiling...' : 'Generate Certificate'}</span>
        </button>
      </div>
    </div>
  );
};
