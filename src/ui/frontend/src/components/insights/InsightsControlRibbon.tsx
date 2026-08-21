import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, ShieldCheck, Zap, Percent } from 'lucide-react';

interface InsightsControlRibbonProps {
  totalCount?: number;
  criticalWarningsCount?: number;
  atrExpansionPct?: number;
  portfolioSharpeComposite?: number;
  frictionDragPct?: number;
  opportunitiesCount?: number;
}

export const InsightsControlRibbon: React.FC<InsightsControlRibbonProps> = ({
  totalCount = 5,
  criticalWarningsCount = 1,
  atrExpansionPct = 29.8,
  portfolioSharpeComposite = 2.84,
  frictionDragPct = 8.78,
  opportunitiesCount = 1,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Active Intelligence */}
      <div className="bg-[#0b0e14] border border-amber-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-amber-950/10">
        <div className="flex items-center justify-between text-amber-400">
          <span className="text-[10px] uppercase font-semibold">Active Insights</span>
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{totalCount} Directives</div>
        <div className="text-[9px] text-amber-400/80 font-bold">100% Real Verification</div>
      </div>

      {/* 2. Alpha Warnings */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Alpha Decay Flags</span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-extrabold text-rose-400">{criticalWarningsCount} Active</div>
        <div className="text-[9px] text-slate-400">Curve-Fit Throttle</div>
      </div>

      {/* 3. ATR Volatility Expansion */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">XAUUSD ATR Shock</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">+{atrExpansionPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">vs 200-Bar Baseline</div>
      </div>

      {/* 4. Composite Portfolio Sharpe */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Composite Sharpe</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{portfolioSharpeComposite.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Dual Session Alpha</div>
      </div>

      {/* 5. Alpha Opportunities */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Regime Opportunities</span>
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{opportunitiesCount} Detected</div>
        <div className="text-[9px] text-slate-400">Parameter Scaling</div>
      </div>

      {/* 6. Execution Drag */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Execution Health</span>
          <Percent className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="text-base font-extrabold text-white">{frictionDragPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">&lt; 15.0% Institutional Cap</div>
      </div>
    </div>
  );
};
