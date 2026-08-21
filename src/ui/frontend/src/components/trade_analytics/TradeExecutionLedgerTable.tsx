import React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface LedgerTradeItem {
  trade_id: number;
  strategy: string;
  pair: string;
  timeframe: string;
  direction: string;
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  pnl_quote: number;
  pnl_r: number;
  mae_pct: number;
  mfe_pct: number;
  bars_held: number;
  exit_reason: string;
  status: string;
}

interface TradeExecutionLedgerTableProps {
  trades?: LedgerTradeItem[];
}

export const TradeExecutionLedgerTable: React.FC<TradeExecutionLedgerTableProps> = ({
  trades = [],
}) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Recent Executed Trade Audit Ledger (DuckDB Live Feeds)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Point-in-Time Trade Audit</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3">Entry &rarr; Exit</th>
              <th className="py-2.5 px-3 text-right">Realized R</th>
              <th className="py-2.5 px-3 text-right">PnL ($)</th>
              <th className="py-2.5 px-3 text-right">MAE / MFE</th>
              <th className="py-2.5 px-3 text-center">Bars</th>
              <th className="py-2.5 px-3 text-center">Exit Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {trades.map((t) => {
              const isWin = t.status === 'WIN';
              const isLong = t.direction.toUpperCase() === 'LONG';

              return (
                <tr key={t.trade_id} className="hover:bg-[#121824] transition">
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{t.trade_id}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{t.pair}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isLong
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {t.entry_price.toFixed(2)} &rarr; {t.exit_price.toFixed(2)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      isWin ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.pnl_r >= 0 ? `+${t.pnl_r.toFixed(2)}` : t.pnl_r.toFixed(2)}R
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      isWin ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.pnl_quote >= 0 ? `+$${t.pnl_quote.toFixed(2)}` : `-$${Math.abs(t.pnl_quote).toFixed(2)}`}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-[10px]">
                    <span className="text-rose-400">-{t.mae_pct.toFixed(2)}%</span> / <span className="text-emerald-400">+{t.mfe_pct.toFixed(2)}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{t.bars_held}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-[10px] text-slate-400 font-sans">{t.exit_reason}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
