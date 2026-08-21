import React from 'react';
import { Layers, TrendingUp, CheckCircle2, Star, ShieldCheck, Sparkles } from 'lucide-react';

interface ConditionControlRibbonProps {
  baseWinRate?: number;
  baseExpectancy?: number;
  maxLiftFeature?: string;
  stackedWinRate?: number;
  stackedExpectancy?: number;
  multicollinearityVif?: number;
}

export const ConditionControlRibbon: React.FC<ConditionControlRibbonProps> = ({
  baseWinRate = 52.4,
  baseExpectancy = 0.45,
  maxLiftFeature = 'London Session (+38.1% Lift)',
  stackedWinRate = 74.8,
  stackedExpectancy = 1.38,
  multicollinearityVif = 1.42,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Base Win Rate */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Base Win Rate</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#121824] text-slate-400 font-bold border border-[#1a2232]">
            Unfiltered
          </span>
        </div>
        <div className="text-base font-extrabold text-slate-300">{baseWinRate.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-500">Raw Strategy Baseline</div>
      </div>

      {/* 2. Base Expectancy */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Base Expectancy</span>
          <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="text-base font-extrabold text-slate-300">+{baseExpectancy.toFixed(2)}R</div>
        <div className="text-[9px] text-slate-500">Prior to Condition Slicing</div>
      </div>

      {/* 3. Max Lift Feature */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Top Alpha Filter</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xs font-bold text-emerald-400 truncate">{maxLiftFeature}</div>
        <div className="text-[9px] text-emerald-300 font-bold">Highest Individual Lift</div>
      </div>

      {/* 4. Stacked Win Rate */}
      <div className="bg-[#0b0e14] border border-cyan-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-cyan-950/10">
        <div className="flex items-center justify-between text-cyan-300">
          <span className="text-[10px] uppercase font-semibold">Stacked Win Rate</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{stackedWinRate.toFixed(1)}%</div>
        <div className="text-[9px] text-emerald-300 font-bold">
          +{(stackedWinRate - baseWinRate).toFixed(1)}% Marginal Lift
        </div>
      </div>

      {/* 5. Stacked Expectancy */}
      <div className="bg-[#0b0e14] border border-emerald-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-emerald-950/10">
        <div className="flex items-center justify-between text-emerald-300">
          <span className="text-[10px] uppercase font-semibold">Stacked Expectancy</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">+{stackedExpectancy.toFixed(2)}R</div>
        <div className="text-[9px] text-emerald-300 font-bold">
          +{(stackedExpectancy - baseExpectancy).toFixed(2)}R Combined Edge
        </div>
      </div>

      {/* 6. Multicollinearity VIF */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Collinearity VIF</span>
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{multicollinearityVif.toFixed(2)} VIF</div>
        <div className="text-[9px] text-slate-400">Independent Factors (&lt; 2.5)</div>
      </div>
    </div>
  );
};
