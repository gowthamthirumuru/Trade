import React from 'react';
import { Binary, RotateCcw, Download, Sparkles, Filter } from 'lucide-react';

interface PatternHeaderProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (tf: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onRescan: () => void;
  onExportCSV: () => void;
  isScanning: boolean;
}

export const PatternHeader: React.FC<PatternHeaderProps> = ({
  selectedPair,
  onPairChange,
  selectedTimeframe,
  onTimeframeChange,
  selectedCategory,
  onCategoryChange,
  onRescan,
  onExportCSV,
  isScanning,
}) => {
  const categories = [
    { id: 'all', label: 'All Patterns' },
    { id: 'SMC Structural', label: 'SMC Structural' },
    { id: 'SMC Liquidity', label: 'SMC Liquidity' },
    { id: 'Imbalance & FVGs', label: 'Imbalance & FVGs' },
    { id: 'Trend Continuation', label: 'Trend Continuation' },
    { id: 'Wyckoff Volatility', label: 'Wyckoff' },
  ];

  const timeframes = ['15m', '1h', '4h', '1d'];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-cyan-400" />
          <span>Category</span>
        </span>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-extrabold shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Asset / Timeframe & Action Buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded-lg p-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                selectedTimeframe === tf ? 'bg-[#161f30] text-cyan-300 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

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
          onClick={onRescan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan Candle Lake'}</span>
        </button>
      </div>
    </div>
  );
};
