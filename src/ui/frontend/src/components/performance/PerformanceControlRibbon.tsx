import React from 'react';
import { TrendingUp, ShieldCheck, PieChart, Activity, Zap, Percent } from 'lucide-react';

interface PerformanceControlRibbonProps {
  cagrPct?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  calmarRatio?: number;
  maxDrawdownPct?: number;
  recoveryFactor?: number;
}

export const PerformanceControlRibbon: React.FC<PerformanceControlRibbonProps> = ({
  cagrPct = 38.4,
  sharpeRatio = 2.18,
  sortinoRatio = 3.42,
  calmarRatio = 4.57,
  maxDrawdownPct = 8.4,
  recoveryFactor = 6.84,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. CAGR */}
      <div className="bg-[#0b0e14] border border-emerald-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-emerald-950/10">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-[10px] uppercase font-semibold">CAGR</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-300">+{cagrPct.toFixed(1)}%</div>
        <div className="text-[9px] text-emerald-400/80 font-bold">Annualized Growth Rate</div>
      </div>

      {/* 2. Sharpe Ratio */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Sharpe Ratio</span>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{sharpeRatio.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">&gt; 2.00 Institutional Tier</div>
      </div>

      {/* 3. Sortino Ratio */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Sortino Ratio</span>
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{sortinoRatio.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Downside Deviation Filter</div>
      </div>

      {/* 4. Calmar Ratio */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Calmar Ratio</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{calmarRatio.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">CAGR / Max Drawdown</div>
      </div>

      {/* 5. Max Drawdown */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Max Drawdown</span>
          <Percent className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-extrabold text-rose-400">-{maxDrawdownPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Peak-to-Trough Horizon</div>
      </div>

      {/* 6. Recovery Factor */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Recovery Factor</span>
          <PieChart className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{recoveryFactor.toFixed(2)}x</div>
        <div className="text-[9px] text-slate-400">Net Profit / Max DD</div>
      </div>
    </div>
  );
};
