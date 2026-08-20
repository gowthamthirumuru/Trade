import React, { useState } from 'react';
import {
  Play,
  Camera,
  GitCompare,
  Download,
  RefreshCw,
  Check,
} from 'lucide-react';

export type BacktestTab =
  | 'Configuration'
  | 'Results'
  | 'Trades'
  | 'Analytics'
  | 'Robustness'
  | 'Validation'
  | 'History';

interface BacktestHeaderProps {
  activeTab: BacktestTab;
  onTabChange: (tab: BacktestTab) => void;
  isRunning: boolean;
  onRunBacktest: () => void;
  onSaveSnapshot?: () => void;
  onExport?: () => void;
}

export const BacktestHeader: React.FC<BacktestHeaderProps> = ({
  activeTab,
  onTabChange,
  isRunning,
  onRunBacktest,
  onSaveSnapshot,
  onExport,
}) => {
  const [snapshotSaved, setSnapshotSaved] = useState(false);

  const tabs: BacktestTab[] = [
    'Configuration',
    'Results',
    'Trades',
    'Analytics',
    'Robustness',
    'Validation',
    'History',
  ];

  const handleSnapshot = () => {
    if (onSaveSnapshot) onSaveSnapshot();
    setSnapshotSaved(true);
    setTimeout(() => setSnapshotSaved(false), 2000);
  };

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3">
      {/* Left Sub-Navigation Tab Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-[#121824]'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Snapshot Button */}
        <button
          onClick={handleSnapshot}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-xs text-slate-300 hover:text-white transition"
        >
          {snapshotSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Saved!</span>
            </>
          ) : (
            <>
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Snapshot</span>
            </>
          )}
        </button>

        {/* Compare Button */}
        <a
          href="#strategy-lab"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-xs text-slate-300 hover:text-white transition"
        >
          <GitCompare className="w-3.5 h-3.5 text-slate-400" />
          <span>Compare</span>
        </a>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e121a] hover:bg-[#151c2a] border border-[#1c2436] rounded-lg text-xs text-slate-300 hover:text-white transition"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export</span>
        </button>

        {/* Run Backtest CTA Button */}
        <button
          onClick={onRunBacktest}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Run Backtest</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
