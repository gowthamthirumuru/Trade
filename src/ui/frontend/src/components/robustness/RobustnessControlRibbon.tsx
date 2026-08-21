import React from 'react';
import { SlidersHorizontal, ShieldCheck, TrendingUp, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

interface RobustnessControlRibbonProps {
  smoothnessScore?: number;
  elasticityIndex?: number;
  breakEvenSlippageBps?: number;
  baselineSharpe?: number;
  verdict?: string;
}

export const RobustnessControlRibbon: React.FC<RobustnessControlRibbonProps> = ({
  smoothnessScore = 88.5,
  elasticityIndex = 0.32,
  breakEvenSlippageBps = 12.5,
  baselineSharpe = 2.24,
  verdict = 'ROBUST (Plateau Score > 80)',
}) => {
  const isRobust = smoothnessScore >= 80.0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Plateau Smoothness Score */}
      <div className="bg-[#0b0e14] border border-amber-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-amber-950/10">
        <div className="flex items-center justify-between text-amber-400">
          <span className="text-[10px] uppercase font-semibold">Plateau Smoothness</span>
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{smoothnessScore.toFixed(1)} / 100</div>
        <div className="text-[9px] text-amber-400/80 font-bold">&gt; 80.0 Institutional Target</div>
      </div>

      {/* 2. Parameter Elasticity Index */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Elasticity (ε)</span>
          <Zap className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">ε = {elasticityIndex.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Low Sensitivity (&lt; 0.50)</div>
      </div>

      {/* 3. Break-Even Slippage */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Break-Even Slip</span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-extrabold text-rose-400">{breakEvenSlippageBps.toFixed(1)} bps</div>
        <div className="text-[9px] text-slate-400">Max Tolerable Drag</div>
      </div>

      {/* 4. Baseline Sharpe */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Baseline Sharpe</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">SR = {baselineSharpe.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Unperturbed Anchor</div>
      </div>

      {/* 5. Neighborhood Stability */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Neighborhood</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">100.0%</div>
        <div className="text-[9px] text-slate-400">Broad Convex Plateau</div>
      </div>

      {/* 6. Gauntlet Verdict */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Robustness Status</span>
          <ShieldCheck className={`w-3.5 h-3.5 ${isRobust ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
        <div
          className={`text-base font-extrabold ${
            isRobust ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isRobust ? 'ROBUST' : 'FRAGILE'}
        </div>
        <div className="text-[9px] text-slate-400 truncate">{verdict}</div>
      </div>
    </div>
  );
};
