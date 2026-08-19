import React from 'react';
import { DataHealthSummary } from '../../types';

interface DataHealthProps {
  data: DataHealthSummary;
}

export const DataHealth: React.FC<DataHealthProps> = ({ data }) => {
  return (
    <div className="quant-card p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-white tracking-tight">Data Health</h2>
      </div>

      <div className="flex items-center gap-4 mb-3">
        {/* Circular Gauge */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#1a1a1a]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-400"
              strokeDasharray={`${data.overall_quality_pct}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-extrabold font-mono text-white leading-none">
              {data.overall_quality_pct}%
            </span>
          </div>
        </div>

        <div className="text-xs">
          <div className="font-semibold text-white">Overall Quality</div>
          <div className="text-[11px] text-slate-400">Zero lookahead audit verified</div>
        </div>
      </div>

      {/* Per-Instrument Table */}
      <div className="flex-1 overflow-x-auto text-[11px]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#1a1a1a] text-[10px] text-slate-500 font-medium">
              <th className="pb-1.5 font-medium">Instrument</th>
              <th className="pb-1.5 font-medium text-right">Data Quality</th>
              <th className="pb-1.5 font-medium text-right">Time Range</th>
              <th className="pb-1.5 font-medium text-right">Candles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171717]">
            {data.items.map((item) => (
              <tr key={item.instrument} className="hover:bg-[#121212] transition">

                <td className="py-1.5 font-bold text-white">{item.instrument}</td>
                <td className="py-1.5 text-right font-mono text-emerald-400 font-medium">
                  {item.quality_pct.toFixed(1)}%
                </td>
                <td className="py-1.5 text-right text-slate-400 font-mono text-[10px]">
                  {item.time_range}
                </td>
                <td className="py-1.5 text-right font-mono text-slate-300">
                  {item.candles_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
