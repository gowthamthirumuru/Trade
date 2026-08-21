import React from 'react';
import { ChevronDown } from 'lucide-react';

interface OptimizationControlRibbonProps {
  strategyName: string;
  onStrategyChange: (val: string) => void;
  pair: string;
  onPairChange: (val: string) => void;
  timeframe: string;
  onTimeframeChange: (val: string) => void;
  optimizationMethod: string;
  onMethodChange: (val: string) => void;
  objectiveMetric: string;
  onMetricChange: (val: string) => void;
  direction: string;
  onDirectionChange: (val: string) => void;
  totalIterations: number;
  completedIterations: number;
  status: string;
  completedTime: string;
  bestScore: number;
  improvementPct: number;
}

export const OptimizationControlRibbon: React.FC<OptimizationControlRibbonProps> = ({
  strategyName,
  onStrategyChange,
  pair,
  onPairChange,
  timeframe,
  onTimeframeChange,
  optimizationMethod,
  onMethodChange,
  objectiveMetric,
  onMetricChange,
  direction,
  onDirectionChange,
  totalIterations = 150,
  completedIterations = 150,
  status = 'Completed',
  completedTime = 'Aug 21, 2026 10:42',
  bestScore = 2.18,
  improvementPct = 37.6,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 font-mono text-xs select-none">
      {/* 1. Strategy & Asset */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-1 shadow-sm">
        <label className="text-[10px] text-slate-400 block font-semibold uppercase">Strategy & Asset</label>
        <div className="flex gap-1">
          <div className="relative flex-1">
            <select
              value={strategyName}
              onChange={(e) => onStrategyChange(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-1 text-white font-bold outline-none focus:border-purple-500 cursor-pointer appearance-none text-[10px]"
            >
              <option value="BB Reversion v4">BB Reversion v4</option>
              <option value="London Breakout v2">London Breakout v2</option>
              <option value="Order Block v4">Order Block v4</option>
              <option value="strategy_T04_F02">strategy_T04_F02</option>
            </select>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>

          <div className="relative w-20">
            <select
              value={pair}
              onChange={(e) => onPairChange(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-1 text-cyan-300 font-bold outline-none focus:border-purple-500 cursor-pointer appearance-none text-[10px]"
            >
              <option value="XAUUSD">XAUUSD</option>
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="USDJPY">USDJPY</option>
              <option value="BTCUSDT">BTCUSDT</option>
            </select>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Optimization Method */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-1 shadow-sm">
        <label className="text-[10px] text-slate-400 block font-semibold uppercase">Optimization Method</label>
        <div className="relative">
          <select
            value={optimizationMethod}
            onChange={(e) => onMethodChange(e.target.value)}
            className="w-full bg-[#07090e] border border-[#1a2232] rounded px-2 py-1 text-white font-bold outline-none focus:border-purple-500 cursor-pointer appearance-none text-[10px]"
          >
            <option value="Bayesian Search (TPE)">Bayesian Search (TPE)</option>
            <option value="Grid Search (Brute-Force)">Grid Search</option>
            <option value="Random Search">Random Search</option>
            <option value="Genetic Algorithm (NSGA-II)">Genetic Algorithm</option>
          </select>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* 3. Objective Metric */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-1 shadow-sm">
        <label className="text-[10px] text-slate-400 block font-semibold uppercase">Objective Metric</label>
        <div className="relative">
          <select
            value={objectiveMetric}
            onChange={(e) => onMetricChange(e.target.value)}
            className="w-full bg-[#07090e] border border-[#1a2232] rounded px-2 py-1 text-white font-bold outline-none focus:border-purple-500 cursor-pointer appearance-none text-[10px]"
          >
            <option value="Sharpe Ratio">Sharpe Ratio</option>
            <option value="Expectancy (R)">Expectancy (R)</option>
            <option value="Sortino Ratio">Sortino Ratio</option>
            <option value="Calmar Ratio">Calmar Ratio</option>
            <option value="Profit Factor">Profit Factor</option>
            <option value="Net Return %">Net Return %</option>
          </select>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* 4. Direction */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-1 shadow-sm">
        <label className="text-[10px] text-slate-400 block font-semibold uppercase">Direction</label>
        <div className="relative">
          <select
            value={direction}
            onChange={(e) => onDirectionChange(e.target.value)}
            className="w-full bg-[#07090e] border border-[#1a2232] rounded px-2 py-1 text-emerald-400 font-bold outline-none focus:border-purple-500 cursor-pointer appearance-none text-[10px]"
          >
            <option value="Maximize">Maximize</option>
            <option value="Minimize">Minimize</option>
          </select>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* 5. Total Iterations */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Iterations</div>
        <div className="text-xs font-extrabold text-white">
          {completedIterations} / {totalIterations}
        </div>
        <div className="w-full h-1 bg-[#07090e] rounded-full overflow-hidden border border-[#1a2232]">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (completedIterations / Math.max(1, totalIterations)) * 100)}%` }}
          />
        </div>
      </div>

      {/* 6. Status & Timestamp */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-0.5 shadow-sm flex flex-col justify-between">
        <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{status}</span>
        </div>
        <div className="text-[9px] text-slate-400 truncate">{completedTime}</div>
      </div>

      {/* 7. Best Score */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-0.5 shadow-sm flex flex-col justify-between">
        <div className="text-[10px] text-slate-400 uppercase font-semibold">Best Score</div>
        <div className="text-sm font-extrabold text-white">{bestScore.toFixed(2)}</div>
        <div className="text-[9px] text-cyan-300 font-bold truncate">{objectiveMetric}</div>
      </div>

      {/* 8. Improve Over Baseline */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-2.5 space-y-0.5 shadow-sm flex flex-col justify-between">
        <div className="text-[10px] text-slate-400 uppercase font-semibold">Improve Over Baseline</div>
        <div className="text-sm font-extrabold text-emerald-400">+{improvementPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Over Initial Defaults</div>
      </div>
    </div>
  );
};
