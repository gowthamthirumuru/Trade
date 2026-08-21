import React from 'react';
import { GitCompare, Trophy, TrendingUp, ShieldCheck, Zap, Activity } from 'lucide-react';

interface StrategyItem {
  name: string;
  sharpe: number;
  profit_factor: number;
  win_rate: number;
  max_dd: number;
  wfer: number;
}

interface StrategyComparisonControlRibbonProps {
  strategies?: StrategyItem[];
  topPerformer?: string;
}

export const StrategyComparisonControlRibbon: React.FC<StrategyComparisonControlRibbonProps> = ({
  strategies = [],
  topPerformer = 'BB Reversion v4',
}) => {
  const safeStrats = strategies.length > 0 ? strategies : [
    { name: 'BB Reversion v4', sharpe: 2.18, profit_factor: 2.18, win_rate: 62.4, max_dd: 8.4, wfer: 81.4 },
    { name: 'Order Block v4', sharpe: 1.92, profit_factor: 1.92, win_rate: 64.4, max_dd: 9.1, wfer: 78.2 },
    { name: 'Liquidity Sweep v3', sharpe: 1.81, profit_factor: 1.81, win_rate: 58.7, max_dd: 10.2, wfer: 75.6 },
    { name: 'London Breakout v2', sharpe: 1.72, profit_factor: 1.72, win_rate: 54.1, max_dd: 7.6, wfer: 83.1 },
  ];

  const maxSharpe = Math.max(...safeStrats.map((s) => s.sharpe));
  const maxPF = Math.max(...safeStrats.map((s) => s.profit_factor));
  const maxWin = Math.max(...safeStrats.map((s) => s.win_rate));
  const minDD = Math.min(...safeStrats.map((s) => s.max_dd));
  const maxWfer = Math.max(...safeStrats.map((s) => s.wfer));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Top Performer */}
      <div className="bg-[#0b0e14] border border-indigo-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-indigo-950/10">
        <div className="flex items-center justify-between text-indigo-400">
          <span className="text-[10px] uppercase font-semibold">Top Model</span>
          <Trophy className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="text-sm font-extrabold text-indigo-300 truncate">{topPerformer}</div>
        <div className="text-[9px] text-indigo-400/80 font-bold">Highest Risk-Adjusted Edge</div>
      </div>

      {/* 2. Top Sharpe */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Peak Sharpe</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{maxSharpe.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Annualized Risk-Adjusted</div>
      </div>

      {/* 3. Top Profit Factor */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Peak PF</span>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{maxPF.toFixed(2)}</div>
        <div className="text-[9px] text-slate-400">Gross Win / Gross Loss</div>
      </div>

      {/* 4. Top Win Rate */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Peak Win %</span>
          <Zap className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{maxWin.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Trade Direction Accuracy</div>
      </div>

      {/* 5. Lowest Drawdown */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Lowest MaxDD</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{minDD.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">Peak-to-Trough Capital Defense</div>
      </div>

      {/* 6. Top WFER */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Peak WFER</span>
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{maxWfer.toFixed(1)}%</div>
        <div className="text-[9px] text-slate-400">OOS / In-Sample Stability</div>
      </div>
    </div>
  );
};
