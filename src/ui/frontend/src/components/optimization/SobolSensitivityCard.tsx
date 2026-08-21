import React from 'react';
import { Info, ArrowRight } from 'lucide-react';

interface SobolItem {
  parameter: string;
  importance_pct: number;
  color?: string;
}

interface SobolSensitivityCardProps {
  sensitivity?: SobolItem[];
  onViewFullAnalysis?: () => void;
}

export const SobolSensitivityCard: React.FC<SobolSensitivityCardProps> = ({
  sensitivity = [
    { parameter: 'BB Length', importance_pct: 42.1 },
    { parameter: 'BB StdDev', importance_pct: 28.7 },
    { parameter: 'RSI Oversold', importance_pct: 11.3 },
    { parameter: 'EMA Fast', importance_pct: 7.8 },
    { parameter: 'ATR Multiplier', importance_pct: 6.2 },
    { parameter: 'RSI Length', importance_pct: 3.9 },
  ],
  onViewFullAnalysis,
}) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-white text-xs">Parameter Impact (Sobol Sensitivity)</h3>
          <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-2 py-1">
        {sensitivity.map((s) => (
          <div key={s.parameter} className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-bold">{s.parameter}</span>
              <span className="text-purple-300 font-bold">{s.importance_pct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3.5 bg-[#07090e] rounded overflow-hidden flex items-center border border-[#141a26]">
              <div
                className="h-full bg-gradient-to-r from-purple-700 to-indigo-500 rounded transition-all duration-300 shadow-sm"
                style={{ width: `${Math.min(100, (s.importance_pct / 50) * 100)}%` }}
              />
            </div>
          </div>
        ))}

        {/* X-Axis Percentage Ticks */}
        <div className="flex justify-between text-[8px] text-slate-500 pt-1">
          <span>0%</span>
          <span>10%</span>
          <span>20%</span>
          <span>30%</span>
          <span>40%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Footer Link */}
      <button
        onClick={onViewFullAnalysis}
        className="w-full text-center text-[10px] text-cyan-400 hover:text-cyan-300 pt-2 border-t border-[#141a26] font-bold flex items-center justify-center gap-1 hover:underline"
      >
        <span>View Full Analysis</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
