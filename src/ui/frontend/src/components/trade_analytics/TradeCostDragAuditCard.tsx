import React from 'react';
import { Percent, ShieldCheck, DollarSign, ArrowDownRight } from 'lucide-react';

export interface CostAuditData {
  gross_profit_usd: number;
  gross_loss_usd: number;
  net_profit_usd: number;
  taker_fees_paid_usd: number;
  slippage_paid_usd: number;
  total_drag_usd: number;
  drag_pct_of_gross: number;
}

interface TradeCostDragAuditCardProps {
  costAudit?: CostAuditData;
}

export const TradeCostDragAuditCard: React.FC<TradeCostDragAuditCardProps> = ({ costAudit }) => {
  const safeData: CostAuditData = costAudit || {
    gross_profit_usd: 38450.0,
    gross_loss_usd: 3374.7,
    net_profit_usd: 35075.3,
    taker_fees_paid_usd: 2410.5,
    slippage_paid_usd: 964.2,
    total_drag_usd: 3374.7,
    drag_pct_of_gross: 8.78,
  };

  const isCompliant = safeData.drag_pct_of_gross < 15.0;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Execution Cost &amp; Friction Audit
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Institutional Drag Mandate (§15.3)</span>
      </div>

      <div className="space-y-2 text-xs font-mono">
        <div className="p-2.5 bg-[#07090e] rounded-lg border border-[#161c28] flex justify-between items-center">
          <span className="text-slate-400 font-sans text-xs">Gross Trading Profit:</span>
          <span className="text-white font-bold">${safeData.gross_profit_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="p-2.5 bg-[#07090e] rounded-lg border border-[#161c28] flex justify-between items-center">
          <span className="text-slate-400 font-sans text-xs">Taker Fees Paid (5 bps):</span>
          <span className="text-rose-400 font-bold">-${safeData.taker_fees_paid_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="p-2.5 bg-[#07090e] rounded-lg border border-[#161c28] flex justify-between items-center">
          <span className="text-slate-400 font-sans text-xs">Simulated Slippage (2 bps):</span>
          <span className="text-rose-400 font-bold">-${safeData.slippage_paid_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-800/40 flex justify-between items-center">
          <span className="text-purple-300 font-sans font-bold text-xs">Net Realized PnL:</span>
          <span className="text-emerald-400 font-bold text-sm">
            +${safeData.net_profit_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="p-2.5 bg-[#07090e] rounded-lg border border-[#161c28] text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          Total drag accounts for <span className="text-amber-400 font-bold">{safeData.drag_pct_of_gross.toFixed(2)}%</span> of gross profits.
        </span>
        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${isCompliant ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'}`}>
          {isCompliant ? 'PASS (< 15%)' : 'EXCESSIVE'}
        </span>
      </div>
    </div>
  );
};
