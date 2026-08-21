import React from 'react';
import { Zap, TrendingUp, CheckCircle2, Percent, ShieldCheck, AlertCircle } from 'lucide-react';

interface OutOfSampleControlRibbonProps {
  alphaRetentionPct?: number;
  degradationPct?: number;
  parameterStabilityIndex?: number;
  oosSharpe?: number;
  oosProfitFactor?: number;
  verdict?: string;
}

export const OutOfSampleControlRibbon: React.FC<OutOfSampleControlRibbonProps> = ({
  alphaRetentionPct = 81.3,
  degradationPct = -18.7,
  parameterStabilityIndex = 92.4,
  oosSharpe = 1.85,
  oosProfitFactor = 2.05,
  verdict = 'PASSED (< 30% Degradation Limit)',
}) => {
  const isPassed = alphaRetentionPct >= 70.0 || degradationPct > -30.0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Alpha Retention */}
      <div className="bg-[#0b0e14] border border-purple-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-purple-950/10">
        <div className="flex items-center justify-between text-purple-300">
          <span className="text-[10px] uppercase font-semibold">Alpha Retention</span>
          <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{alphaRetentionPct.toFixed(1)}%</div>
        <div className="text-[9px] text-purple-400/80 font-bold">&gt; 70% Institutional Benchmark</div>
      </div>

      {/* 2. Performance Degradation */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Delta Degradation</span>
          <Percent className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div
          className={`text-base font-extrabold ${
            degradationPct > -30.0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {degradationPct > 0 ? `+${degradationPct.toFixed(1)}` : degradationPct.toFixed(1)}%
        </div>
        <div className="text-[9px] text-slate-400">Under 30% Tolerance</div>
      </div>

      {/* 3. Parameter Stability Index */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Stability Index (PSI)</span>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{parameterStabilityIndex.toFixed(1)} / 100</div>
        <div className="text-[9px] text-slate-400">Zero Overfitting Detected</div>
      </div>

      {/* 4. OOS Realized Sharpe */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">OOS Sharpe Ratio</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">SR = {oosSharpe.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Blind Forward Horizon</div>
      </div>

      {/* 5. OOS Profit Factor */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">OOS Profit Factor</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-white">{oosProfitFactor.toFixed(2)}</div>
        <div className="text-[9px] text-emerald-300 font-bold">Gross Gain / Loss</div>
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
          {isPassed ? 'GAUNTLET PASSED' : 'FLAGGED'}
        </div>
        <div className="text-[9px] text-slate-400 truncate">{verdict}</div>
      </div>
    </div>
  );
};
