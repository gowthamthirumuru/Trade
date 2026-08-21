import React from 'react';
import { SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { ParameterJitterItem } from './RobustnessParameterPlateauChart';

interface RobustnessJitterTableProps {
  jitter?: ParameterJitterItem[];
}

export const RobustnessJitterTable: React.FC<RobustnessJitterTableProps> = ({ jitter = [] }) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-xs">
            Parameter Neighborhood Perturbation Audit Table (±50% Span)
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Institutional Plateau Validation</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Perturbation Shift</th>
              <th className="py-2.5 px-3 text-right">Sharpe Ratio</th>
              <th className="py-2.5 px-3 text-right">Expectancy (R)</th>
              <th className="py-2.5 px-3 text-right">Profit Factor</th>
              <th className="py-2.5 px-3 text-right">Win Rate (%)</th>
              <th className="py-2.5 px-3 text-right">Sample Trades</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {jitter.map((j, idx) => (
              <tr key={idx} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{j.shift}</td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{j.sharpe.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-200">
                  {j.expectancy_r >= 0 ? `+${j.expectancy_r.toFixed(2)}` : j.expectancy_r.toFixed(2)}R
                </td>
                <td className="py-2.5 px-3 text-right text-purple-300 font-bold">{j.profit_factor.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-cyan-300">{j.win_rate_pct.toFixed(1)}%</td>
                <td className="py-2.5 px-3 text-right text-slate-400">{j.trades_count.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-center">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                      j.status === 'BASELINE'
                        ? 'bg-purple-950 text-purple-300 border border-purple-700'
                        : j.status === 'PRIME'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : j.status === 'STABLE'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-[#121824] text-slate-400 border border-[#1a2232]'
                    }`}
                  >
                    {j.status}
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
