import React from 'react';
import {
  FlaskConical,
  Sliders,
  TrendingUp,
  Shield,
  FileText,
  CheckCircle2,
  Code2,
  Play,
} from 'lucide-react';

export type StrategyLabTab =
  | 'builder'
  | 'parameters'
  | 'exits'
  | 'risk'
  | 'notes';

interface StrategyHeaderProps {
  activeTab: StrategyLabTab;
  onTabChange: (tab: StrategyLabTab) => void;
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  isCodeMode: boolean;
  onToggleCodeMode: () => void;
  onCompileStrategy: () => void;
  isCompiling: boolean;
  compileSuccess: boolean;
}

export const StrategyHeader: React.FC<StrategyHeaderProps> = ({
  activeTab,
  onTabChange,
  selectedVersion,
  onVersionChange,
  isCodeMode,
  onToggleCodeMode,
  onCompileStrategy,
  isCompiling,
  compileSuccess,
}) => {
  const tabs: Array<{ id: StrategyLabTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'builder', label: 'Rule Builder', icon: FlaskConical },
    { id: 'parameters', label: 'Parameters', icon: Sliders },
    { id: 'exits', label: 'Exit & Trailing', icon: TrendingUp },
    { id: 'risk', label: 'Risk & Sizing', icon: Shield },
    { id: 'notes', label: 'Notes & Docs', icon: FileText },
  ];

  return (
    <div className="bg-[#07090e] border-b border-[#161c28] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* 1. Left Tab Navigation */}
      <div className="flex items-center bg-[#0b0e14] p-1 rounded-xl border border-[#18202f] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121722]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Right Controls: Version + Auto-save + Code toggle + Compile CTA */}
      <div className="flex items-center gap-3">
        {/* Version Selector Dropdown */}
        <div className="flex items-center bg-[#0b0e14] border border-[#18202f] rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300">
          <select
            value={selectedVersion}
            onChange={(e) => onVersionChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-cyan-300 outline-none cursor-pointer pr-1"
          >
            <option value="Version 4" className="bg-[#0b0e14] text-white">Version 4 (Active)</option>
            <option value="Version 3" className="bg-[#0b0e14] text-white">Version 3</option>
            <option value="Version 2" className="bg-[#0b0e14] text-white">Version 2</option>
            <option value="Version 1" className="bg-[#0b0e14] text-white">Version 1</option>
          </select>
        </div>

        {/* Auto-saved Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Auto-saved</span>
        </div>

        {/* Code / Visual View Mode Toggle */}
        <button
          onClick={onToggleCodeMode}
          title={isCodeMode ? 'Switch to Visual Rule Composer' : 'Switch to Python / YAML DSL Code View'}
          className={`p-2 rounded-lg border font-mono text-xs transition flex items-center gap-1.5 ${
            isCodeMode
              ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950/40'
              : 'bg-[#0b0e14] border-[#18202f] text-slate-400 hover:text-white hover:bg-[#121722]'
          }`}
        >
          <Code2 className="w-4 h-4" />
        </button>

        {/* Compile & Register Strategy Button */}
        <button
          onClick={onCompileStrategy}
          disabled={isCompiling}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-lg transition-all active:scale-95 ${
            compileSuccess
              ? 'bg-emerald-600 text-white shadow-emerald-900/40'
              : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold shadow-cyan-500/20'
          }`}
        >
          {isCompiling ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>Verifying Zero-Lookahead...</span>
            </>
          ) : compileSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Strategy Registered!</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Compile & Register Strategy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
