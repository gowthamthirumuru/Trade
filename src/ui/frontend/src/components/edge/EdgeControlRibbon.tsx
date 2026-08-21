import React from 'react';
import { Compass, TrendingUp, CheckCircle2, Star, ShieldCheck, Activity } from 'lucide-react';

interface EdgeControlRibbonProps {
  expectancyR?: number;
  winRatePct?: number;
  profitFactor?: number;
  pValue?: number;
  nTrades?: number;
  confidenceRating?: string;
  isSignificant?: boolean;
}

export const EdgeControlRibbon: React.FC<EdgeControlRibbonProps> = ({
  expectancyR = 1.24,
  winRatePct = 68.2,
  profitFactor = 2.84,
  pValue = 0.0014,
  nTrades = 382,
  confidenceRating = '5 / 5 STARS',
  isSignificant = true,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Expectancy E[R] */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Slice Expectancy</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">
          {expectancyR >= 0 ? `+${expectancyR.toFixed(2)}` : expectancyR.toFixed(2)}R
        </div>
        <div className="text-[9px] text-slate-400">Expected Value Per Trade</div>
      </div>

      {/* 2. Win Rate */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Slice Win Rate</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-white">{winRatePct.toFixed(1)}%</div>
        <div className="text-[9px] text-emerald-300 font-bold">Over Target Subset</div>
      </div>

      {/* 3. Profit Factor */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Profit Factor</span>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{profitFactor.toFixed(2)} PF</div>
        <div className="text-[9px] text-slate-400">Gross Wins / Gross Losses</div>
      </div>

      {/* 4. Significance p-Value */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Statistical p-Value</span>
          <Activity className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">p = {pValue.toFixed(4)}</div>
        <div className="text-[9px] text-emerald-300 font-bold">
          {isSignificant ? '✓ Statistically Proven Edge' : '✗ Insufficient Sample'}
        </div>
      </div>

      {/* 5. Sample Size n */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Sample Size n</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">DuckDB</span>
        </div>
        <div className="text-base font-extrabold text-white">{nTrades} Trades</div>
        <div className="text-[9px] text-slate-400">Filtered Candle Trades</div>
      </div>

      {/* 6. Confidence Rating */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Confidence Rating</span>
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-400">{confidenceRating}</div>
        <div className="text-[9px] text-slate-400">Institutional Edge Score</div>
      </div>
    </div>
  );
};
