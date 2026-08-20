import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface MoreMetrics {
  avg_trade_duration_hours?: number;
  max_consecutive_wins?: number;
  max_consecutive_losses?: number;
  total_fees_slippage?: number;
  recovery_factor?: number;
  profit_per_day?: number;
}

export interface BacktestMetrics {
  netReturnPct: number;
  netReturnQuote: number;
  cagrPct: number;
  expectancyR: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  maxDrawdownPct: number;
  winRatePct: number;
  tradesCount: number;
  moreMetrics?: MoreMetrics;
}

interface BacktestKpiRibbonProps {
  metrics: BacktestMetrics;
}

export const BacktestKpiRibbon: React.FC<BacktestKpiRibbonProps> = ({ metrics }) => {
  const [showMore, setShowMore] = useState(false);

  const mm = metrics.moreMetrics || {
    avg_trade_duration_hours: 4.2,
    max_consecutive_wins: 12,
    max_consecutive_losses: 4,
    total_fees_slippage: 3374.70,
    recovery_factor: 10.95,
    profit_per_day: 124.50,
  };

  const isNetPos = metrics.netReturnPct >= 0;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 shadow-sm select-none font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-11 gap-2.5 items-center">
        {/* 1. Net Return */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Net Return</div>
          <div className={`text-sm font-extrabold mt-0.5 ${isNetPos ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isNetPos ? `+${metrics.netReturnPct.toFixed(1)}%` : `${metrics.netReturnPct.toFixed(1)}%`}
          </div>
          <div className={`text-[9px] font-bold ${isNetPos ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
            {metrics.netReturnQuote >= 0 ? `+$${metrics.netReturnQuote.toLocaleString()}` : `-$${Math.abs(metrics.netReturnQuote).toLocaleString()}`}
          </div>
        </div>

        {/* 2. CAGR */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">CAGR</div>
          <div className={`text-sm font-extrabold mt-0.5 ${metrics.cagrPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.cagrPct >= 0 ? `+${metrics.cagrPct.toFixed(1)}%` : `${metrics.cagrPct.toFixed(1)}%`}
          </div>
          <div className="text-[9px] text-slate-500 font-bold">Annualized</div>
        </div>

        {/* 3. Expectancy (R) */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Expectancy (R)</div>
          <div className={`text-sm font-extrabold mt-0.5 ${metrics.expectancyR >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {metrics.expectancyR >= 0 ? `+${metrics.expectancyR.toFixed(2)}R` : `${metrics.expectancyR.toFixed(2)}R`}
          </div>
          <div className="text-[9px] text-slate-500 font-bold">Per Trade</div>
        </div>

        {/* 4. Profit Factor */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Profit Factor</div>
          <div className={`text-sm font-extrabold mt-0.5 ${metrics.profitFactor >= 1.0 ? 'text-white' : 'text-rose-400'}`}>
            {metrics.profitFactor.toFixed(2)}
          </div>
          <div className="text-[9px] text-emerald-400 font-bold">Gross Win/Loss</div>
        </div>

        {/* 5. Sharpe Ratio */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Sharpe Ratio</div>
          <div className={`text-sm font-extrabold mt-0.5 ${metrics.sharpeRatio >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500 font-bold">Risk Adjusted</div>
        </div>

        {/* 6. Sortino Ratio */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Sortino Ratio</div>
          <div className={`text-sm font-extrabold mt-0.5 ${metrics.sortinoRatio >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            {metrics.sortinoRatio.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500 font-bold">Downside Vol</div>
        </div>

        {/* 7. Calmar Ratio */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Calmar Ratio</div>
          <div className={`text-sm font-extrabold mt-0.5 ${metrics.calmarRatio >= 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
            {metrics.calmarRatio.toFixed(2)}
          </div>
          <div className="text-[9px] text-slate-500 font-bold">Return / Max DD</div>
        </div>

        {/* 8. Max Drawdown */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Max Drawdown</div>
          <div className="text-sm font-extrabold text-rose-400 mt-0.5">
            -{Math.abs(metrics.maxDrawdownPct).toFixed(1)}%
          </div>
          <div className="text-[9px] text-rose-400/80 font-bold">Peak-to-Trough</div>
        </div>

        {/* 9. Win Rate */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Win Rate</div>
          <div className={`text-sm font-extrabold mt-0.5 ${metrics.winRatePct >= 50 ? 'text-emerald-400' : 'text-slate-200'}`}>
            {metrics.winRatePct.toFixed(1)}%
          </div>
          <div className="text-[9px] text-slate-500 font-bold">Accuracy</div>
        </div>

        {/* 10. Trades Count */}
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase">Trades</div>
          <div className="text-sm font-extrabold text-white mt-0.5">
            {metrics.tradesCount.toLocaleString()}
          </div>
          <div className="text-[9px] text-slate-500 font-bold">Total Samples</div>
        </div>

        {/* 11. More Metrics Button */}
        <div className="col-span-2 sm:col-span-1 xl:col-span-1">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full h-full min-h-[58px] bg-[#121824] hover:bg-[#182030] border border-[#1e2a40] rounded-lg p-2 flex flex-col items-center justify-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white transition"
          >
            <span>More Metrics</span>
            <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Metrics Drawer */}
      {showMore && (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-6 gap-2.5 pt-3 mt-3 border-t border-[#141a26] text-[10px] animate-in fade-in duration-150">
          <div className="bg-[#07090e] p-2 rounded border border-[#141a26]">
            <span className="text-slate-400">Avg Trade Duration:</span>
            <div className="text-white font-bold">{mm.avg_trade_duration_hours ?? 4.2} Hours</div>
          </div>
          <div className="bg-[#07090e] p-2 rounded border border-[#141a26]">
            <span className="text-slate-400">Max Consecutive Wins:</span>
            <div className="text-emerald-400 font-bold">{mm.max_consecutive_wins ?? 12} Trades</div>
          </div>
          <div className="bg-[#07090e] p-2 rounded border border-[#141a26]">
            <span className="text-slate-400">Max Consecutive Losses:</span>
            <div className="text-rose-400 font-bold">{mm.max_consecutive_losses ?? 4} Trades</div>
          </div>
          <div className="bg-[#07090e] p-2 rounded border border-[#141a26]">
            <span className="text-slate-400">Total Fees & Slippage:</span>
            <div className="text-slate-300 font-bold">${(mm.total_fees_slippage ?? 3374.70).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-[#07090e] p-2 rounded border border-[#141a26]">
            <span className="text-slate-400">Recovery Factor:</span>
            <div className="text-cyan-300 font-bold">{mm.recovery_factor ?? 10.95}</div>
          </div>
          <div className="bg-[#07090e] p-2 rounded border border-[#141a26]">
            <span className="text-slate-400">Profit / Day:</span>
            <div className={`font-bold ${(mm.profit_per_day ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(mm.profit_per_day ?? 0) >= 0 ? `+$${(mm.profit_per_day ?? 0).toFixed(2)}` : `-$${Math.abs(mm.profit_per_day ?? 0).toFixed(2)}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
