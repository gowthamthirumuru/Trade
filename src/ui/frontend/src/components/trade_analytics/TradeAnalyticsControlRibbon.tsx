import React from 'react';
import { PieChart, TrendingUp, Activity, ShieldCheck, Zap, Percent } from 'lucide-react';

interface TradeAnalyticsControlRibbonProps {
  totalTrades?: number;
  expectancyR?: number;
  winRatePct?: number;
  skewness?: number;
  kurtosis?: number;
  dragPct?: number;
}

export const TradeAnalyticsControlRibbon: React.FC<TradeAnalyticsControlRibbonProps> = ({
  totalTrades = 1840,
  expectancyR = 0.88,
  winRatePct = 64.2,
  skewness = 1.24,
  kurtosis = 4.82,
  dragPct = 8.78,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Expectancy (R) */}
      <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-cyan-950/10">
        <div className="flex items-center justify-between text-cyan-400">
          <span className="text-[10px] uppercase font-semibold">Expectancy (E[R])</span>
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">
          {expectancyR >= 0 ? `+${expectancyR.toFixed(2)}` : expectancyR.toFixed(2)}R
        </div>
        <div className="text-[9px] text-cyan-400/80 font-bold">Edge Expectation Per Trade</div>
      </div>

      {/* 2. Win Rate */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Win Rate</span>
          <PieChart className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{winRatePct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Target: &gt; 55.0%</div>
      </div>

      {/* 3. Sample Size */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Sample Trades</span>
          <Activity className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{totalTrades.toLocaleString()}</div>
        <div className="text-[9px] text-slate-400">Audited Executions</div>
      </div>

      {/* 4. Skewness */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">R-Skewness</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">
          {skewness >= 0 ? `+${skewness.toFixed(2)}` : skewness.toFixed(2)}
        </div>
        <div className="text-[9px] text-slate-400">Positive Right Tail</div>
      </div>

      {/* 5. Kurtosis */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">R-Kurtosis</span>
          <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="text-base font-extrabold text-white">{kurtosis.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Fat-Tailed Distribution</div>
      </div>

      {/* 6. Total Friction Drag % */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Friction Drag %</span>
          <Percent className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{dragPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">&lt; 15.0% Limit Target</div>
      </div>
    </div>
  );
};
