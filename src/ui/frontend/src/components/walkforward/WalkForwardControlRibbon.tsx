import React from 'react';
import { ShieldCheck, TrendingUp, CheckCircle2, Percent, AlertTriangle, Flame } from 'lucide-react';

interface WalkForwardControlRibbonProps {
  wferPct?: number;
  oosSharpe?: number;
  consistencyScore?: number;
  parameterStabilityIndex?: number;
  maxDrawdownPct?: number;
  verdict?: string;
}

export const WalkForwardControlRibbon: React.FC<WalkForwardControlRibbonProps> = ({
  wferPct = 81.4,
  oosSharpe = 1.92,
  consistencyScore = 100.0,
  parameterStabilityIndex = 92.4,
  maxDrawdownPct = 6.8,
  verdict = 'ROBUST (> 60% Benchmark)',
}) => {
  const isPassed = wferPct >= 60.0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Walk-Forward Efficiency Ratio */}
      <div className="bg-[#0b0e14] border border-emerald-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-emerald-950/10">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-[10px] uppercase font-semibold">WFER Efficiency</span>
          <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-300">{wferPct.toFixed(1)}%</div>
        <div className="text-[9px] text-emerald-400/80 font-bold">&gt; 60% Institutional Standard</div>
      </div>

      {/* 2. OOS Mean Sharpe */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">OOS Mean Sharpe</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">SR = {oosSharpe.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Out-of-Sample Retention</div>
      </div>

      {/* 3. Alpha Consistency */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Alpha Consistency</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{consistencyScore.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Profitable Test Windows</div>
      </div>

      {/* 4. Parameter Stability Index */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Stability Index (PSI)</span>
          <Percent className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{parameterStabilityIndex.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Zero Overfitting Detected</div>
      </div>

      {/* 5. Walk-Forward Max Drawdown */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">OOS Max Drawdown</span>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-400">-{maxDrawdownPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Controlled Tail Risk</div>
      </div>

      {/* 6. Gauntlet Verdict */}
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
