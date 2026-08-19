import React, { useState } from 'react';
import {
  Sliders,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  Zap,
  Check,
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
          if (p.id === 'atr_min') return { ...p, value: 22.0 };
          return p;
        })
      );
    } else if (preset === 'Balanced') {
      onUpdateParameters(
        parameters.map((p) => {
          if (p.id === 'bb_std') return { ...p, value: 2.0 };
          if (p.id === 'rsi_oversold') return { ...p, value: 35 };
          if (p.id === 'atr_min') return { ...p, value: 18.0 };
          return p;
        })
      );
    } else if (preset === 'Aggressive') {
      onUpdateParameters(
        parameters.map((p) => {
          if (p.id === 'bb_std') return { ...p, value: 1.8 };
          if (p.id === 'rsi_oversold') return { ...p, value: 40 };
          if (p.id === 'atr_min') return { ...p, value: 14.0 };
          return p;
        })
      );
    }
  };

  const handleResetToDefaults = () => {
    handleApplyPreset('Balanced');
  };

  return (
    <div className="quant-card p-5 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#151a24] pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Parameter Configuration Matrix</h3>
        </div>
        <span className="text-[10px] text-cyan-400/80 font-bold">Vectorized Sweeps</span>
      </div>

      {/* Parameter Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#151a24] text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                    className={`p-1 rounded transition ${
                      param.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={param.locked ? 'Locked (Excluded from sweeps)' : 'Unlocked'}
                  >
                    {param.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Bar: Presets + Action Buttons */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#151a24] gap-3">
        {/* Optimization Presets */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Optimization Presets:</span>
          <div className="flex bg-[#0e121a] p-0.5 rounded-lg border border-[#1c2436]">
            {(['Conservative', 'Balanced', 'Aggressive', 'Custom'] as OptimizationPreset[]).map((preset) => (
              <button
                key={preset}
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  activePreset === preset
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#0e121a] hover:bg-[#161c28] border border-[#1e283c] text-slate-300 hover:text-white rounded-lg text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            onClick={onRunOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            {isOptimizing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Optimize</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
