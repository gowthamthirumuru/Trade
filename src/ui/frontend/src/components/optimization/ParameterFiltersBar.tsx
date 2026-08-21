import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface FilterItem {
  name: string;
  min: number;
  max: number;
  default_min: number;
  default_max: number;
  step: number;
}

interface ParameterFiltersBarProps {
  filters?: FilterItem[];
  onChange?: (updated: Record<string, { min: number; max: number }>) => void;
}

export const ParameterFiltersBar: React.FC<ParameterFiltersBarProps> = ({
  filters = [
    { name: 'BB Length', min: 10, max: 40, default_min: 10, default_max: 40, step: 1 },
    { name: 'BB StdDev', min: 1.00, max: 3.00, default_min: 1.00, default_max: 3.00, step: 0.05 },
    { name: 'RSI Length', min: 7, max: 21, default_min: 7, default_max: 21, step: 1 },
    { name: 'RSI Oversold', min: 20, max: 50, default_min: 20, default_max: 50, step: 1 },
    { name: 'EMA Fast', min: 10, max: 200, default_min: 10, default_max: 200, step: 5 },
    { name: 'ATR Multiplier', min: 0.50, max: 3.00, default_min: 0.50, default_max: 3.00, step: 0.1 },
  ],
  onChange,
}) => {
  const [values, setValues] = useState<Record<string, { min: number; max: number }>>(() => {
    const initial: Record<string, { min: number; max: number }> = {};
    filters.forEach((f) => {
      initial[f.name] = { min: f.default_min, max: f.default_max };
    });
    return initial;
  });

  const handleReset = () => {
    const resetVals: Record<string, { min: number; max: number }> = {};
    filters.forEach((f) => {
      resetVals[f.name] = { min: f.default_min, max: f.default_max };
    });
    setValues(resetVals);
    if (onChange) onChange(resetVals);
  };

  const handleMinChange = (name: string, val: number) => {
    setValues((prev) => {
      const next = { ...prev, [name]: { ...prev[name], min: val } };
      if (onChange) onChange(next);
      return next;
    });
  };

  const handleMaxChange = (name: string, val: number) => {
    setValues((prev) => {
      const next = { ...prev, [name]: { ...prev[name], max: val } };
      if (onChange) onChange(next);
      return next;
    });
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 font-mono text-xs select-none shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">Parameter Filters & Constraints</h3>
        </div>

        <button
          onClick={handleReset}
          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* 6 Dual-Slider Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {filters.map((f) => {
          const current = values[f.name] || { min: f.default_min, max: f.default_max };
          return (
            <div key={f.name} className="space-y-1 bg-[#07090e] border border-[#141a26] rounded-lg p-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-bold truncate">{f.name}</span>
              </div>

              {/* Number Inputs */}
              <div className="flex items-center justify-between gap-1">
                <input
                  type="number"
                  value={current.min}
                  step={f.step}
                  onChange={(e) => handleMinChange(f.name, parseFloat(e.target.value) || f.min)}
                  className="w-11 bg-[#0b0e14] border border-[#1a2232] rounded px-1 py-0.5 text-center text-white font-mono text-[10px] outline-none"
                />
                <span className="text-slate-600 text-[10px]">—</span>
                <input
                  type="number"
                  value={current.max}
                  step={f.step}
                  onChange={(e) => handleMaxChange(f.name, parseFloat(e.target.value) || f.max)}
                  className="w-11 bg-[#0b0e14] border border-[#1a2232] rounded px-1 py-0.5 text-center text-white font-mono text-[10px] outline-none"
                />
              </div>

              {/* Slider Track */}
              <div className="relative pt-1">
                <div className="h-1 bg-[#141a26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((current.max - current.min) / (f.max - f.min)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
