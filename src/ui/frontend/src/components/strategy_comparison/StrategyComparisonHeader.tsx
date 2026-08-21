import React from 'react';
import { GitCompare, RotateCcw, Download } from 'lucide-react';

interface StrategyComparisonHeaderProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  selectedBenchmark: string;
  onBenchmarkChange: (bm: string) => void;
  onRecompute: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export const StrategyComparisonHeader: React.FC<StrategyComparisonHeaderProps> = ({
  selectedPair,
  onPairChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedBenchmark,
  onBenchmarkChange,
  onRecompute,
  onExportCSV,
  isLoading,
}) => {
  const timeframes = ['15m', '1h', '4h', '1d'];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Title Tag */}
      <div className="flex items-center gap-2 text-indigo-400">
        <GitCompare className="w-4 h-4" />
        <span className="font-bold text-white text-xs uppercase tracking-wide">
          Multi-Model Quantitative Comparison
        </span>
      </div>

      {/* Asset / Timeframe / Benchmark & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Timeframe */}
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedTimeframe === tf
                  ? 'bg-[#1e1938] text-indigo-300 font-extrabold border border-indigo-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Pair Selector */}
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Asset</span>
          <select
            value={selectedPair}
            onChange={(e) => onPairChange(e.target.value)}
            className="bg-transparent text-indigo-400 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value="XAUUSD">XAUUSD</option>
            <option value="EURUSD">EURUSD</option>
            <option value="GBPUSD">GBPUSD</option>
            <option value="USDJPY">USDJPY</option>
            <option value="BTCUSDT">BTCUSDT</option>
            <option value="ALL PORTFOLIO">ALL PORTFOLIO</option>
          </select>
        </div>

        {/* Benchmark Selector */}
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Benchmark</span>
          <select
            value={selectedBenchmark}
            onChange={(e) => onBenchmarkChange(e.target.value)}
            className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value="Zero / Risk-Free">Zero / Risk-Free</option>
            <option value="Buy & Hold Asset">Buy &amp; Hold Asset</option>
            <option value="Equal-Weight Composite">Equal-Weight Composite</option>
          </select>
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-slate-300 hover:text-white transition font-bold text-xs"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onRecompute}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-extrabold rounded-lg text-xs shadow-lg shadow-indigo-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Comparing...' : 'Run Comparison'}</span>
        </button>
      </div>
    </div>
  );
};
