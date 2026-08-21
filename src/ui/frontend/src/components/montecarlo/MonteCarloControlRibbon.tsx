import React from 'react';
import { Activity, ShieldCheck, TrendingUp, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

interface MonteCarloControlRibbonProps {
  riskOfRuinPct?: number;
  riskOfRuin30Pct?: number;
  medianReturnPct?: number;
  medianMaxDrawdownPct?: number;
  p95MaxDrawdownPct?: number;
  verdict?: string;
}

export const MonteCarloControlRibbon: React.FC<MonteCarloControlRibbonProps> = ({
  riskOfRuinPct = 0.01,
  riskOfRuin30Pct = 2.4,
  medianReturnPct = 42.6,
  medianMaxDrawdownPct = 11.4,
  p95MaxDrawdownPct = 16.8,
  verdict = 'PASSED (Negligible Ruin Risk)',
}) => {
  const isPassed = riskOfRuinPct < 1.0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Risk of Ruin (50% Loss) */}
      <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-cyan-950/10">
        <div className="flex items-center justify-between text-cyan-400">
          <span className="text-[10px] uppercase font-semibold">Risk of Ruin (50%)</span>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{riskOfRuinPct.toFixed(2)}%</div>
        <div className="text-[9px] text-cyan-400/80 font-bold">&lt; 1.0% Institutional Target</div>
      </div>

      {/* 2. Severe Drawdown (30% DD) */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">P(Drawdown &gt; 30%)</span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{riskOfRuin30Pct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Capital Protection Boundary</div>
      </div>

      {/* 3. Median Expected Return */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Median Return</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">
          {medianReturnPct >= 0 ? `+${medianReturnPct.toFixed(1)}` : medianReturnPct.toFixed(1)}%
        </div>
        <div className="text-[9px] text-slate-400">50th Percentile Horizon</div>
      </div>

      {/* 4. Median Max Drawdown */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Median Max DD</span>
          <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">-{medianMaxDrawdownPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Expected Cycle Drawdown</div>
      </div>

      {/* 5. 95th Percentile Max Drawdown */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">95th %ile Max DD</span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-extrabold text-rose-400">-{p95MaxDrawdownPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Worst 5% Stress Horizon</div>
      </div>

      {/* 6. Gauntlet Status */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Gauntlet Status</span>
          <ShieldCheck className={`w-3.5 h-3.5 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
        <div
          className={`text-base font-extrabold ${
            isPassed ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isPassed ? 'PASSED' : 'FLAGGED'}
        </div>
        <div className="text-[9px] text-slate-400 truncate">{verdict}</div>
      </div>
    </div>
  );
};
