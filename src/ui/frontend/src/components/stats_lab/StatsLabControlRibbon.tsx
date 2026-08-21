import React from 'react';
import { Calculator, ShieldCheck, Activity, TrendingUp, Zap, Percent } from 'lucide-react';

interface StatsLabControlRibbonProps {
  expectancyR?: number;
  tStat?: number;
  pValue?: number;
  ciLower?: number;
  ciUpper?: number;
  sampleSize?: number;
  verdict?: string;
}

export const StatsLabControlRibbon: React.FC<StatsLabControlRibbonProps> = ({
  expectancyR = 0.91,
  tStat = 4.82,
  pValue = 0.00001,
  ciLower = 0.78,
  ciUpper = 1.04,
  sampleSize = 4821,
  verdict = 'REJECT H0 — Statistically Significant Alpha',
}) => {
  const isPassed = pValue < 0.05;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Expectancy */}
      <div className="bg-[#0b0e14] border border-purple-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-purple-950/10">
        <div className="flex items-center justify-between text-purple-400">
          <span className="text-[10px] uppercase font-semibold">Expectancy E[R]</span>
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">
          {expectancyR >= 0 ? `+${expectancyR.toFixed(2)}` : expectancyR.toFixed(2)}R
        </div>
        <div className="text-[9px] text-purple-400/80 font-bold">Empirical Point Estimate</div>
      </div>

      {/* 2. Student's t-stat */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Student t-Stat</span>
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">t = {tStat.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">p = {pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}</div>
      </div>

      {/* 3. Bootstrap CI */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">95% Bootstrap CI</span>
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">
          [{ciLower >= 0 ? `+${ciLower.toFixed(2)}` : ciLower.toFixed(2)}, {ciUpper >= 0 ? `+${ciUpper.toFixed(2)}` : ciUpper.toFixed(2)}]
        </div>
        <div className="text-[9px] text-slate-400">10k Resamples</div>
      </div>

      {/* 4. Sample Size */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Sample Size (n)</span>
          <Activity className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{sampleSize.toLocaleString()}</div>
        <div className="text-[9px] text-slate-400">High Statistical Power</div>
      </div>

      {/* 5. Hypothesis Alpha */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Significance α</span>
          <Percent className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="text-base font-extrabold text-white">α = 0.05</div>
        <div className="text-[9px] text-slate-400">95% Confidence Gate</div>
      </div>

      {/* 6. Verdict Status */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Inferential Status</span>
          <ShieldCheck className={`w-3.5 h-3.5 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
        <div
          className={`text-base font-extrabold ${
            isPassed ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isPassed ? 'CONFIRMED' : 'NOISE'}
        </div>
        <div className="text-[9px] text-slate-400 truncate">{verdict}</div>
      </div>
    </div>
  );
};
