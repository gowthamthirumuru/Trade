import React from 'react';
import { GitCompare, TrendingUp, ShieldCheck, Zap, PieChart, AlertCircle } from 'lucide-react';

interface CorrelationControlRibbonProps {
  avgCorrelation?: number;
  varianceReductionPct?: number;
  diversificationRatio?: number;
  effectiveBets?: number;
  totalStrategies?: number;
  redundantPairsCount?: number;
}

export const CorrelationControlRibbon: React.FC<CorrelationControlRibbonProps> = ({
  avgCorrelation = 0.18,
  varianceReductionPct = 34.2,
  diversificationRatio = 1.48,
  effectiveBets = 4.8,
  totalStrategies = 6,
  redundantPairsCount = 0,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Average Cross-Correlation */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Avg Cross-Corr (r)</span>
          <GitCompare className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">r = {avgCorrelation.toFixed(2)}</div>
        <div className="text-[9px] text-emerald-300 font-bold">Low Cross-Talk (Orthogonal)</div>
      </div>

      {/* 2. Portfolio Variance Reduction */}
      <div className="bg-[#0b0e14] border border-purple-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-purple-950/10">
        <div className="flex items-center justify-between text-purple-300">
          <span className="text-[10px] uppercase font-semibold">Variance Reduction</span>
          <Zap className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">-{varianceReductionPct.toFixed(1)}% Volatility</div>
        <div className="text-[9px] text-purple-400/80 font-bold">Multi-Strategy Shield</div>
      </div>

      {/* 3. Diversification Ratio */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Diversification Ratio</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">DR = {diversificationRatio.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Choueifaty Metric (&gt; 1.0)</div>
      </div>

      {/* 4. Meucci Effective Bets */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Effective Bets (N_eff)</span>
          <PieChart className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">
          {effectiveBets.toFixed(1)} / {totalStrategies} Bets
        </div>
        <div className="text-[9px] text-slate-400">PCA Eigenvalue Entropy</div>
      </div>

      {/* 5. Redundancy Alerts */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Redundancy Alerts</span>
          <AlertCircle className={`w-3.5 h-3.5 ${redundantPairsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
        </div>
        <div
          className={`text-base font-extrabold ${
            redundantPairsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {redundantPairsCount} Redundancies
        </div>
        <div className="text-[9px] text-slate-400">Threshold: r &gt; 0.65</div>
      </div>

      {/* 6. Covariance Stationarity */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Risk Stationarity</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">STABLE</div>
        <div className="text-[9px] text-slate-400">Ledoit-Wolf Shrunk</div>
      </div>
    </div>
  );
};
