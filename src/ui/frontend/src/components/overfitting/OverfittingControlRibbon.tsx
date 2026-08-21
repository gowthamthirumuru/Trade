import React from 'react';
import { ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, Binary, Zap } from 'lucide-react';

interface OverfittingControlRibbonProps {
  observedSharpe?: number;
  deflatedSharpeRatio?: number;
  dsrPValue?: number;
  pboPct?: number;
  emaxSharpe?: number;
  haircutSharpe?: number;
  trialsN?: number;
  verdict?: string;
}

export const OverfittingControlRibbon: React.FC<OverfittingControlRibbonProps> = ({
  observedSharpe = 2.18,
  deflatedSharpeRatio = 0.9956,
  dsrPValue = 0.0042,
  pboPct = 12.0,
  emaxSharpe = 1.42,
  haircutSharpe = 1.76,
  trialsN = 184,
  verdict = 'LOW OVERFITTING RISK — GAUNTLET PASSED',
}) => {
  const isPassed = dsrPValue < 0.05 && pboPct < 20.0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Deflated Sharpe Ratio (DSR) */}
      <div className="bg-[#0b0e14] border border-emerald-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-emerald-950/10">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-[10px] uppercase font-semibold">Deflated Sharpe (DSR)</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-300">
          p = {dsrPValue < 0.001 ? '< 0.001' : dsrPValue.toFixed(4)}
        </div>
        <div className="text-[9px] text-emerald-400/80 font-bold">&lt; 0.05 Gate 6 Benchmark</div>
      </div>

      {/* 2. Probability of Backtest Overfitting (PBO) */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">CSCV PBO Risk</span>
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{pboPct.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">&lt; 20.0% Gate 5 Threshold</div>
      </div>

      {/* 3. Haircut Sharpe Ratio */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Haircut Sharpe</span>
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">SR = {haircutSharpe.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Snooping-Penalized Alpha</div>
      </div>

      {/* 4. Expected Max Sharpe under H0 */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">E[Max SR | H0]</span>
          <Binary className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{emaxSharpe.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Random Selection Floor</div>
      </div>

      {/* 5. Trials Accounted (N) */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Trials Tested (N)</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="text-base font-extrabold text-white">{trialsN} Variants</div>
        <div className="text-[9px] text-slate-400">Miner Search Horizon</div>
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
