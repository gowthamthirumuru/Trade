import React from 'react';
import { Activity, TrendingUp, CheckCircle2, ShieldCheck, Flame, Zap } from 'lucide-react';

interface RegimeControlRibbonProps {
  currentRegime?: string;
  primeExpectancy?: number;
  primeWinRate?: number;
  transitionEntropy?: number;
  stationaryBullPct?: number;
}

export const RegimeControlRibbon: React.FC<RegimeControlRibbonProps> = ({
  currentRegime = 'Bullish Trend + High Volatility',
  primeExpectancy = 1.45,
  primeWinRate = 72.4,
  transitionEntropy = 1.18,
  stationaryBullPct = 49.0,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Current Active Regime */}
      <div className="bg-[#0b0e14] border border-amber-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-amber-950/10">
        <div className="flex items-center justify-between text-amber-400">
          <span className="text-[10px] uppercase font-semibold">Active Regime</span>
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        </div>
        <div className="text-xs font-bold text-amber-300 truncate">{currentRegime}</div>
        <div className="text-[9px] text-amber-400/80 font-bold">Latest Bar Classification</div>
      </div>

      {/* 2. Prime Expectancy */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Prime Expectancy</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">+{primeExpectancy.toFixed(2)}R</div>
        <div className="text-[9px] text-slate-400">Bull Trend + High Vol</div>
      </div>

      {/* 3. Prime Win Rate */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Prime Win Rate</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-white">{primeWinRate.toFixed(1)}%</div>
        <div className="text-[9px] text-emerald-300 font-bold">Optimal Regime Peak</div>
      </div>

      {/* 4. Transition Entropy */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Markov Entropy (H)</span>
          <Zap className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{transitionEntropy.toFixed(2)} bits</div>
        <div className="text-[9px] text-slate-400">High State Predictability</div>
      </div>

      {/* 5. Stationary Distribution */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Ergodic Steady State</span>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{stationaryBullPct.toFixed(0)}% Bull Dominated</div>
        <div className="text-[9px] text-slate-400">Long-Run Limit Theorem</div>
      </div>

      {/* 6. Circuit Breaker Governance */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Chop Risk Circuit</span>
          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-base font-extrabold text-rose-400">PAUSED IN CHOP</div>
        <div className="text-[9px] text-slate-400">0 Trades Permitted</div>
      </div>
    </div>
  );
};
