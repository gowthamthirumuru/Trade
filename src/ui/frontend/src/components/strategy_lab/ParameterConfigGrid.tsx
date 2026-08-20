import React, { useState } from 'react';
import {
  Sliders,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  Zap,
  Check,
  TrendingUp,
  Activity,
  BarChart3,
} from 'lucide-react';

export interface StrategyParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  optimize: boolean;
  locked: boolean;
}

interface ParameterConfigGridProps {
  strategyName: string;
  parameters: StrategyParameter[];
  onUpdateParameters: (params: StrategyParameter[]) => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
}

export type OptimizationPreset = 'Conservative' | 'Balanced' | 'Aggressive' | 'Custom';

export const ParameterConfigGrid: React.FC<ParameterConfigGridProps> = ({
  strategyName,
  parameters,
  onUpdateParameters,
  onRunOptimization,
  isOptimizing,
}) => {
  const [activePreset, setActivePreset] = useState<OptimizationPreset>('Balanced');
  const [activeParamTab, setActiveParamTab] = useState<'Table' | 'Sliders' | 'Sensitivity'>('Table');

  const handleUpdateParam = (id: string, updated: Partial<StrategyParameter>) => {
    onUpdateParameters(
      parameters.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleToggleLock = (id: string) => {
    onUpdateParameters(
      parameters.map((p) => (p.id === id ? { ...p, locked: !p.locked } : p))
    );
  };

  const handleToggleOptimize = (id: string) => {
    onUpdateParameters(
      parameters.map((p) => (p.id === id ? { ...p, optimize: !p.optimize } : p))
    );
  };

  const handleApplyPreset = (preset: OptimizationPreset) => {
    setActivePreset(preset);
    if (preset === 'Conservative') {
      onUpdateParameters(
        parameters.map((p) => {
          if (p.id === 'bb_std') return { ...p, value: 2.2 };
          if (p.id === 'rsi_oversold') return { ...p, value: 30 };
          if (p.id === 'atr_min' || p.id === 'atr_threshold') return { ...p, value: 22.0 };
          return p;
        })
      );
    } else if (preset === 'Balanced') {
      onUpdateParameters(
        parameters.map((p) => {
          if (p.id === 'bb_std') return { ...p, value: 2.0 };
          if (p.id === 'rsi_oversold') return { ...p, value: 35 };
          if (p.id === 'atr_min' || p.id === 'atr_threshold') return { ...p, value: 18.0 };
          return p;
        })
      );
    } else if (preset === 'Aggressive') {
      onUpdateParameters(
        parameters.map((p) => {
          if (p.id === 'bb_std') return { ...p, value: 1.8 };
          if (p.id === 'rsi_oversold') return { ...p, value: 40 };
          if (p.id === 'atr_min' || p.id === 'atr_threshold') return { ...p, value: 14.0 };
          return p;
        })
      );
    }
  };

  const handleResetToDefaults = () => {
    handleApplyPreset('Balanced');
  };

  // Sensitivity matrix mock data
  const sensitivityGrid = [
    { bb_std: 1.6, rsi_30: 0.42, rsi_35: 0.61, rsi_40: 0.85, rsi_45: 0.48 },
    { bb_std: 1.8, rsi_30: 0.58, rsi_35: 0.88, rsi_40: 1.15, rsi_45: 0.72 },
    { bb_std: 2.0, rsi_30: 0.74, rsi_35: 1.25, rsi_40: 0.95, rsi_45: 0.65 },
    { bb_std: 2.2, rsi_30: 0.82, rsi_35: 1.05, rsi_40: 0.78, rsi_45: 0.52 },
    { bb_std: 2.5, rsi_30: 0.65, rsi_35: 0.75, rsi_40: 0.55, rsi_45: 0.38 },
  ];

  return (
    <div className="quant-card p-5 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-4 rounded-xl shadow-sm">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#151a24] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Parameter Configuration & Optimization Matrix</h3>
        </div>
        
        {/* Sub-view Switcher */}
        <div className="flex items-center bg-[#07090e] border border-[#1a2232] rounded p-0.5 text-[10px]">
          {(['Table', 'Sliders', 'Sensitivity'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveParamTab(mode)}
              className={`px-2.5 py-1 rounded font-bold transition ${
                activeParamTab === mode ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Buttons & Quick Sweep Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#07090e] border border-[#161c28] p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
          {(['Conservative', 'Balanced', 'Aggressive'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => handleApplyPreset(preset)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition border ${
                activePreset === preset
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                  : 'bg-[#0e121a] border-[#1c2436] text-slate-400 hover:text-white'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded text-[10px] text-slate-400 hover:text-white transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={onRunOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold rounded text-[10px] shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isOptimizing ? 'Sweeping Grid...' : 'Run Vectorized Sweep'}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Table View */}
      {activeParamTab === 'Table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#151a24] text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-[#07090e]/60">
                <th className="py-2 px-3">Parameter</th>
                <th className="py-2 px-3 text-center">Value</th>
                <th className="py-2 px-3 text-center">Min</th>
                <th className="py-2 px-3 text-center">Max</th>
                <th className="py-2 px-3 text-center">Step</th>
                <th className="py-2 px-3 text-center">Optimize</th>
                <th className="py-2 px-3 text-center">Lock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151a24]">
              {parameters.map((param) => (
                <tr key={param.id} className="hover:bg-[#0e121a] transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">{param.name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="number"
                      value={param.value}
                      step={param.step}
                      min={param.min}
                      max={param.max}
                      disabled={param.locked}
                      onChange={(e) =>
                        handleUpdateParam(param.id, { value: parseFloat(e.target.value) || 0 })
                      }
                      className={`w-20 bg-[#0e121a] border border-[#1c2436] rounded px-2 py-1 text-center font-bold text-xs outline-none focus:border-cyan-500 transition ${
                        param.locked ? 'text-slate-500 cursor-not-allowed' : 'text-cyan-300'
                      }`}
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-400">{param.min}</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">{param.max}</td>
                  <td className="py-2.5 px-3 text-center text-slate-400">{param.step}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleToggleOptimize(param.id)}
                      className={`w-4 h-4 rounded border mx-auto flex items-center justify-center transition ${
                        param.optimize
                          ? 'bg-cyan-500 border-cyan-400 text-black'
                          : 'border-[#334155] hover:border-cyan-500'
                      }`}
                    >
                      {param.optimize && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleToggleLock(param.id)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {param.locked ? (
                        <Lock className="w-3.5 h-3.5 text-rose-400 mx-auto" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-slate-500 mx-auto" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mode 2: Interactive Sliders View */}
      {activeParamTab === 'Sliders' && (
        <div className="space-y-4 pt-1">
          {parameters.map((param) => (
            <div key={param.id} className="bg-[#07090e] border border-[#161c28] p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{param.name}</span>
                  {param.locked && <Lock className="w-3 h-3 text-rose-400" />}
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-400 text-[10px]">Current:</span>
                  <span className="text-cyan-300 font-extrabold bg-[#121824] px-2 py-0.5 rounded border border-[#1e2a40]">
                    {param.value}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 w-8 text-right">{param.min}</span>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={param.value}
                  disabled={param.locked}
                  onChange={(e) => handleUpdateParam(param.id, { value: parseFloat(e.target.value) || 0 })}
                  className="flex-1 accent-cyan-400 cursor-pointer disabled:opacity-40"
                />
                <span className="text-[10px] text-slate-500 w-8">{param.max}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode 3: 2D Sensitivity Heatmap View */}
      {activeParamTab === 'Sensitivity' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sharpe Ratio Contour (BB Std Dev × RSI Oversold)</span>
            </span>
            <span className="text-cyan-400 font-bold">Optimal Peak: 1.25 SR</span>
          </div>

          <div className="overflow-x-auto bg-[#07090e] border border-[#161c28] rounded-lg p-3">
            <table className="w-full text-center text-[10px]">
              <thead>
                <tr className="text-slate-500 border-b border-[#141a26]">
                  <th className="py-1 text-left font-bold text-slate-400">BB Std \ RSI</th>
                  <th className="py-1 px-1">RSI &lt; 30</th>
                  <th className="py-1 px-1">RSI &lt; 35</th>
                  <th className="py-1 px-1">RSI &lt; 40</th>
                  <th className="py-1 px-1">RSI &lt; 45</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141a26]">
                {sensitivityGrid.map((row) => (
                  <tr key={row.bb_std}>
                    <td className="py-1 text-left font-bold text-cyan-300">{row.bb_std.toFixed(1)}σ</td>
                    {[row.rsi_30, row.rsi_35, row.rsi_40, row.rsi_45].map((val, idx) => {
                      const isPeak = val >= 1.2;
                      const isGood = val >= 0.8;
                      return (
                        <td key={idx} className="py-1 px-1">
                          <span
                            className={`inline-block w-full py-1 rounded font-bold ${
                              isPeak
                                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-extrabold ring-1 ring-cyan-300'
                                : isGood
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {val.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
