import React from 'react';
import { PieChart, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

interface PortfolioScheme {
  name: string;
  sharpe: number;
  volatility_pct: number;
  max_drawdown_pct: number;
  diversification_ratio: number;
}

export const DiversificationAllocationCard: React.FC = () => {
  const schemes: PortfolioScheme[] = [
    {
      name: 'Equal-Weighted (1/N Baseline)',
      sharpe: 2.14,
      volatility_pct: 11.2,
      max_drawdown_pct: 7.8,
      diversification_ratio: 1.48,
    },
    {
      name: 'Inverse-Variance Risk Budget',
      sharpe: 2.45,
      volatility_pct: 9.4,
      max_drawdown_pct: 6.2,
      diversification_ratio: 1.62,
    },
    {
      name: 'Minimum-Correlation Parity (HRP)',
      sharpe: 2.82,
      volatility_pct: 8.1,
      max_drawdown_pct: 4.9,
      diversification_ratio: 1.84,
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">Portfolio Multi-Strategy Risk Allocation Frontier</h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">Choueifaty Diversification Frontier</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {schemes.map((s, idx) => {
          const isHRP = idx === 2;
          return (
            <div
              key={s.name}
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                isHRP
                  ? 'bg-emerald-950/10 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                  : 'bg-[#07090e] border-[#161c28]'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">{s.name}</span>
                {isHRP && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    OPTIMAL
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 bg-[#0b0e14] rounded-lg border border-[#141a26]">
                  <span className="text-slate-500 block uppercase text-[8px]">Sharpe Ratio</span>
                  <span className="text-emerald-400 font-extrabold text-xs">SR = {s.sharpe.toFixed(2)}</span>
                </div>
                <div className="p-2 bg-[#0b0e14] rounded-lg border border-[#141a26]">
                  <span className="text-slate-500 block uppercase text-[8px]">Max DD</span>
                  <span className="text-cyan-300 font-bold text-xs">{s.max_drawdown_pct.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-300 pt-1 border-t border-[#141a26]">
                <span>Annualized Vol: {s.volatility_pct.toFixed(1)}%</span>
                <span className="text-purple-300 font-bold">DR = {s.diversification_ratio.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
