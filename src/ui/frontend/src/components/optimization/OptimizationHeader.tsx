import React, { useState } from 'react';
import { Play, Save, Check, RefreshCw } from 'lucide-react';

export type OptimizationTab =
  | 'Overview'
  | 'Parameter Grid'
  | 'Results Explorer'
  | 'Robustness'
  | 'Sensitivity'
  | 'Parameter Importance'
  | 'Optimization History';

interface OptimizationHeaderProps {
  activeTab: OptimizationTab;
  onTabChange: (tab: OptimizationTab) => void;
  isRunning: boolean;
  onRunOptimization: () => void;
  onSaveOptimization: () => void;
}

export const OptimizationHeader: React.FC<OptimizationHeaderProps> = ({
  activeTab,
  onTabChange,
  isRunning,
  onRunOptimization,
  onSaveOptimization,
}) => {
  const [saved, setSaved] = useState(false);

  const tabs: OptimizationTab[] = [
    'Overview',
    'Parameter Grid',
    'Results Explorer',
    'Robustness',
    'Sensitivity',
    'Parameter Importance',
    'Optimization History',
  ];

  const handleSave = () => {
    onSaveOptimization();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#121824]'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-xs text-slate-300 hover:text-white transition"
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Optimization</span>
            </>
          )}
        </button>

        <button
          onClick={onRunOptimization}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-orange-500/25 transition active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sweeping Surface...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Run Optimization</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
