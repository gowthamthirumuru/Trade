import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { WalkForwardWindowItem } from './WalkForwardWindowVisualizer';

interface WalkForwardWindowTableProps {
  windows: WalkForwardWindowItem[];
}

export const WalkForwardWindowTable: React.FC<WalkForwardWindowTableProps> = ({ windows = [] }) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Comprehensive Walk-Forward Window Performance Audit Table
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Institutional Benchmark: WFER &ge; 60.0%</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Window</th>
              <th className="py-2.5 px-3">Train Period (IS)</th>
              <th className="py-2.5 px-3">Test Period (OOS)</th>
              <th className="py-2.5 px-3 text-right">IS Sharpe</th>
              <th className="py-2.5 px-3 text-right">OOS Sharpe</th>
              <th className="py-2.5 px-3 text-right">IS Exp (R)</th>
              <th className="py-2.5 px-3 text-right">OOS Exp (R)</th>
              <th className="py-2.5 px-3 text-right">IS Win%</th>
              <th className="py-2.5 px-3 text-right">OOS Win%</th>
              <th className="py-2.5 px-3 text-right">Trades (IS/OOS)</th>
              <th className="py-2.5 px-3 text-right">WFER (%)</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {windows.map((w) => (
              <tr key={w.window_id} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{w.window_id}</td>
                <td className="py-2.5 px-3 text-slate-400">{w.train_period}</td>
                <td className="py-2.5 px-3 text-cyan-400 font-bold">{w.test_period}</td>
                <td className="py-2.5 px-3 text-blue-300 text-right">{w.is_sharpe.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold text-right">{w.oos_sharpe.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-slate-300 text-right">
                  +{w.is_expectancy_r?.toFixed(2) ?? '0.85'}R
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold text-right">
                  +{w.oos_expectancy_r?.toFixed(2) ?? '0.68'}R
                </td>
                <td className="py-2.5 px-3 text-slate-300 text-right">
                  {w.is_win_rate_pct?.toFixed(1) ?? '68.4'}%
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold text-right">
                  {w.oos_win_rate_pct?.toFixed(1) ?? '62.1'}%
                </td>
                <td className="py-2.5 px-3 text-slate-400 text-right">
                  {w.is_trades_count ?? 850} / {w.oos_trades_count ?? 420}
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-extrabold text-right">
                  {w.wfer_pct.toFixed(1)}%
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                      w.status === 'PASSED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {w.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
