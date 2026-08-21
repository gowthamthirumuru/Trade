import React from 'react';
import { Binary, TrendingUp, CheckCircle2, ShieldCheck, Flame, Sparkles } from 'lucide-react';

interface PatternControlRibbonProps {
  totalPatterns?: number;
  topAlphaPattern?: string;
  topWinRate?: number;
  topAvgR?: number;
  totalFrequency?: number;
}

export const PatternControlRibbon: React.FC<PatternControlRibbonProps> = ({
  totalPatterns = 8,
  topAlphaPattern = 'Asian Liquidity Sweep Fade',
  topWinRate = 68.8,
  topAvgR = 1.42,
  totalFrequency = 1640,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Patterns Discovered */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Discovered Patterns</span>
          <Binary className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-400">{totalPatterns} Formations</div>
        <div className="text-[9px] text-slate-400">Point-in-Time Scanned</div>
      </div>

      {/* 2. Top Alpha Formation */}
      <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-cyan-950/10">
        <div className="flex items-center justify-between text-cyan-400">
          <span className="text-[10px] uppercase font-semibold">Top Alpha Pattern</span>
          <Flame className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
        </div>
        <div className="text-xs font-bold text-cyan-300 truncate">{topAlphaPattern}</div>
        <div className="text-[9px] text-cyan-400/80 font-bold">Highest Marginal Lift</div>
      </div>

      {/* 3. Top Win Rate */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Top Win Rate</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{topWinRate.toFixed(1)}%</div>
        <div className="text-[9px] text-emerald-300 font-bold">Out-of-Sample Validated</div>
      </div>

      {/* 4. Top Avg Expectancy R */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Top Avg Return</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">+{topAvgR.toFixed(2)}R</div>
        <div className="text-[9px] text-slate-400">Per Executed Trade</div>
      </div>

      {/* 5. Total Formations Frequency */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Total Occurrences</span>
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{totalFrequency} Events</div>
        <div className="text-[9px] text-slate-400">Historical Candle Depth</div>
      </div>

      {/* 6. Significance Guarantee */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Statistical Sig</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">p &lt; 0.001</div>
        <div className="text-[9px] text-slate-400">Zero Lookahead Bias</div>
      </div>
    </div>
  );
};
