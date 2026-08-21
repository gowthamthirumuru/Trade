import React, { useState } from 'react';
import { Star, Trophy, ArrowRight, ArrowUpDown } from 'lucide-react';

export interface TopCombinationItem {
  rank: number;
  sharpe: number;
  expectancy_r: number;
  max_dd_pct: number;
  profit_factor: number;
  parameters: string;
  is_starred?: boolean;
}

interface TopCombinationsTableProps {
  combinations?: TopCombinationItem[];
  totalResultsCount?: number;
  onSelectRank?: (item: TopCombinationItem) => void;
  onViewAll?: () => void;
}

export const TopCombinationsTable: React.FC<TopCombinationsTableProps> = ({
  combinations = [
    { rank: 1, sharpe: 2.18, expectancy_r: 0.91, max_dd_pct: 8.4, profit_factor: 2.18, parameters: 'BB(20, 2.00) RSI(14, 35) EMA(50) ATR(1.80)', is_starred: true },
    { rank: 2, sharpe: 2.07, expectancy_r: 0.84, max_dd_pct: 8.7, profit_factor: 2.05, parameters: 'BB(18, 1.90) RSI(14, 35) EMA(50) ATR(1.80)', is_starred: false },
    { rank: 3, sharpe: 2.01, expectancy_r: 0.82, max_dd_pct: 8.9, profit_factor: 2.02, parameters: 'BB(22, 2.10) RSI(14, 35) EMA(50) ATR(1.70)', is_starred: false },
    { rank: 4, sharpe: 1.95, expectancy_r: 0.79, max_dd_pct: 9.2, profit_factor: 1.98, parameters: 'BB(20, 1.90) RSI(16, 30) EMA(50) ATR(1.80)', is_starred: false },
    { rank: 5, sharpe: 1.92, expectancy_r: 0.76, max_dd_pct: 9.5, profit_factor: 1.94, parameters: 'BB(16, 2.10) RSI(14, 35) EMA(50) ATR(1.70)', is_starred: false },
  ],
  totalResultsCount = 150,
  onSelectRank,
  onViewAll,
}) => {
  const [sortField, setSortField] = useState<'sharpe' | 'expectancy_r' | 'max_dd_pct' | 'profit_factor'>('sharpe');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: 'sharpe' | 'expectancy_r' | 'max_dd_pct' | 'profit_factor') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'max_dd_pct'); // default asc for DD
    }
  };

  const sortedList = [...combinations].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
        <h3 className="font-bold text-white text-xs">Top Parameter Combinations</h3>
        <span className="text-[10px] text-slate-500">Sorted by {sortField.replace('_', ' ')}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px]">
              <th className="py-1.5 px-2">Rank</th>
              <th
                onClick={() => handleSort('sharpe')}
                className="py-1.5 px-2 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Sharpe</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('expectancy_r')}
                className="py-1.5 px-2 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Expectancy (R)</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('max_dd_pct')}
                className="py-1.5 px-2 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Max DD (%)</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('profit_factor')}
                className="py-1.5 px-2 text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>PF</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-1.5 px-2">Parameters</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26]">
            {sortedList.slice(0, 5).map((c, idx) => (
              <tr
                key={idx}
                onClick={() => onSelectRank && onSelectRank(c)}
                className="hover:bg-[#121824] transition cursor-pointer group text-[11px]"
              >
                <td className="py-2 px-2">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold ${
                      idx === 0
                        ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/40'
                        : 'bg-[#141a26] text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-extrabold text-white">{c.sharpe.toFixed(2)}</td>
                <td className="py-2 px-2 text-right font-extrabold text-emerald-400">+{c.expectancy_r.toFixed(2)}</td>
                <td className="py-2 px-2 text-right text-rose-400">{c.max_dd_pct.toFixed(1)}</td>
                <td className="py-2 px-2 text-right text-slate-300">{c.profit_factor.toFixed(2)}</td>
                <td className="py-2 px-2 text-slate-400 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[190px]">{c.parameters}</span>
                    {idx === 0 && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <button
        onClick={onViewAll}
        className="w-full text-center text-[10px] text-cyan-400 hover:text-cyan-300 pt-2 border-t border-[#141a26] font-bold flex items-center justify-center gap-1 hover:underline"
      >
        <span>View All Results ({totalResultsCount})</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};
