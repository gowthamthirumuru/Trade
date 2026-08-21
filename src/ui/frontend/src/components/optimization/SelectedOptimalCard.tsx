import React, { useState } from 'react';
import { Star, Check, ArrowUpRight } from 'lucide-react';

interface ParameterItem {
  name: string;
  value: string | number;
}

interface SelectedOptimalCardProps {
  sharpeRatio?: number;
  maxDdPct?: number;
  expectancyR?: number;
  profitFactor?: number;
  parameters?: ParameterItem[];
  baselineSharpe?: number;
  baselineMaxDd?: number;
  baselineExpectancy?: number;
  baselinePf?: number;
  onApplyToStrategy?: () => void;
}

export const SelectedOptimalCard: React.FC<SelectedOptimalCardProps> = ({
  sharpeRatio = 2.18,
  maxDdPct = 8.4,
  expectancyR = 0.91,
  profitFactor = 2.18,
  parameters = [
    { name: 'BB Length (X)', value: 20 },
    { name: 'BB StdDev (Y)', value: '2.00' },
    { name: 'RSI Length', value: 14 },
    { name: 'RSI Oversold', value: 35 },
    { name: 'EMA Fast', value: 50 },
    { name: 'ATR Multiplier', value: '1.80' },
  ],
  baselineSharpe = 1.58,
  baselineMaxDd = 11.8,
  baselineExpectancy = 0.64,
  baselinePf = 1.72,
  onApplyToStrategy,
}) => {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (onApplyToStrategy) onApplyToStrategy();
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
        <h3 className="font-bold text-white text-xs">Selected Optimal Settings</h3>
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
      </div>

      {/* 4 KPI Matrix */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-[#07090e] border border-[#1a2232] rounded-lg p-2">
          <span className="text-[10px] text-slate-400 block">Sharpe</span>
          <span className="text-base font-extrabold text-emerald-400">{sharpeRatio.toFixed(2)}</span>
        </div>
        <div className="bg-[#07090e] border border-[#1a2232] rounded-lg p-2">
          <span className="text-[10px] text-slate-400 block">Max DD</span>
          <span className="text-base font-extrabold text-rose-400">{maxDdPct.toFixed(1)}%</span>
        </div>
        <div className="bg-[#07090e] border border-[#1a2232] rounded-lg p-2">
          <span className="text-[10px] text-slate-400 block">Expectancy</span>
          <span className="text-base font-extrabold text-emerald-400">+{expectancyR.toFixed(2)}R</span>
        </div>
        <div className="bg-[#07090e] border border-[#1a2232] rounded-lg p-2">
          <span className="text-[10px] text-slate-400 block">PF</span>
          <span className="text-base font-extrabold text-white">{profitFactor.toFixed(2)}</span>
        </div>
      </div>

      {/* Parameter List Table */}
      <div className="space-y-1 bg-[#07090e] border border-[#141a26] rounded-lg p-2 text-[11px]">
        {parameters.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between py-0.5 border-b border-[#141a26] last:border-none">
            <span className="text-slate-400">{p.name}</span>
            <span className="text-white font-bold">{p.value}</span>
          </div>
        ))}
      </div>

      {/* Apply CTA Button */}
      <button
        onClick={handleApply}
        className="w-full py-2 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 hover:from-blue-800 hover:to-purple-800 border border-indigo-700/60 rounded-lg text-white font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40"
      >
        {applied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-bold">Applied to Strategy!</span>
          </>
        ) : (
          <>
            <span>Apply to Strategy</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {/* Baseline Comparison Card */}
      <div className="bg-[#07090e] border border-[#141a26] rounded-lg p-2.5 space-y-1 text-[10px]">
        <div className="text-slate-400 font-bold">Baseline (Current Strategy)</div>
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#141a26]">
          <div>
            <span className="text-slate-500 block">Sharpe</span>
            <span className="text-slate-300 font-bold">{baselineSharpe.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Max DD</span>
            <span className="text-rose-400 font-bold">{baselineMaxDd.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">Expectancy</span>
            <span className="text-slate-300 font-bold">+{baselineExpectancy.toFixed(2)}R</span>
          </div>
          <div>
            <span className="text-slate-500 block">PF</span>
            <span className="text-slate-300 font-bold">{baselinePf.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
