import React from 'react';
import { Lightbulb, RotateCcw, Filter, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface InsightsHeaderProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedSeverity: string;
  onSeverityChange: (sev: string) => void;
  selectedPair: string;
  onPairChange: (pair: string) => void;
  onRecompute: () => void;
  isLoading: boolean;
}

export const InsightsHeader: React.FC<InsightsHeaderProps> = ({
  selectedCategory,
  onCategoryChange,
  selectedSeverity,
  onSeverityChange,
  selectedPair,
  onPairChange,
  onRecompute,
  isLoading,
}) => {
  const categories = [
    { label: 'All Insights', val: 'ALL' },
    { label: 'Volatility', val: 'VOLATILITY' },
    { label: 'Alpha Decay', val: 'ALPHA_DECAY' },
    { label: 'Correlation', val: 'CORRELATION' },
    { label: 'Regime Shifts', val: 'REGIME_SHIFT' },
    { label: 'Execution', val: 'EXECUTION' },
  ];

  const severities = [
    { label: 'All Severities', val: 'ALL' },
    { label: 'Critical', val: 'CRITICAL' },
    { label: 'Warnings', val: 'WARNING' },
    { label: 'Opportunities', val: 'OPPORTUNITY' },
    { label: 'Verified', val: 'VERIFIED' },
  ];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-amber-400" />
          <span>Category</span>
        </span>
        {categories.map((c) => {
          const isActive = selectedCategory === c.val;
          return (
            <button
              key={c.val}
              onClick={() => onCategoryChange(c.val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Severity Filter, Asset & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Severity Selector */}
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Severity</span>
          <select
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer text-[11px]"
          >
            {severities.map((s) => (
              <option key={s.val} value={s.val}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pair Selector */}
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1a2232] rounded-lg px-2 py-1 text-xs">
          <span className="text-slate-500 text-[10px]">Asset</span>
          <select
            value={selectedPair}
            onChange={(e) => onPairChange(e.target.value)}
            className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer text-[11px]"
          >
            <option value="ALL">ALL ASSETS</option>
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Scanning...' : 'Scan Intelligence'}</span>
        </button>
      </div>
    </div>
  );
};
