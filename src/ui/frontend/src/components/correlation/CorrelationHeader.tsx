import React from 'react';
import { GitCompare, RotateCcw, Download, Sliders } from 'lucide-react';

interface CorrelationHeaderProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  selectedGranularity: string;
  onGranularityChange: (g: string) => void;
  onRecompute: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
}

export const CorrelationHeader: React.FC<CorrelationHeaderProps> = ({
  selectedPair,
  onPairChange,
  selectedMetric,
  onMetricChange,
  selectedGranularity,
  onGranularityChange,
  onRecompute,
  onExportCSV,
  isLoading,
}) => {
  const metrics = [
    { id: 'pearson', label: 'Pearson (Linear)' },
    { id: 'spearman', label: 'Spearman (Rank)' },
  ];

  const granularities = [
    { id: 'trade', label: 'Trade-by-Trade' },
    { id: '15m', label: '15m Returns' },
    { id: 'daily', label: 'Daily Returns' },
  ];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Metric Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Sliders className="w-3 h-3 text-purple-400" />
          <span>Metric</span>
        </span>
        {metrics.map((m) => {
          const isActive = selectedMetric === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onMetricChange(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Asset / Granularity & Action Buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-0.5">
          {granularities.map((g) => (
            <button
              key={g.id}
              onClick={() => onGranularityChange(g.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedGranularity === g.id
                  ? 'bg-[#1e1730] text-purple-300 font-extrabold border border-purple-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

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
          <span>{isLoading ? 'Computing...' : 'Recalculate Covariance'}</span>
        </button>
      </div>
    </div>
  );
};
