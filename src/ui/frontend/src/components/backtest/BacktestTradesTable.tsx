import React, { useState } from 'react';
import { FileText, Download, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface BacktestTradeLog {
  id: number;
  entry_time: string;
  exit_time: string;
  duration_hours?: number;
  side: string;
  entry_price: number;
  exit_price: number;
  pnl_quote: number;
  pnl_r: number;
  result: string;
  exit_reason: string;
}

interface BacktestTradesTableProps {
  trades: BacktestTradeLog[];
  totalTradesCount?: number;
}

export const BacktestTradesTable: React.FC<BacktestTradesTableProps> = ({
  trades = [],
  totalTradesCount = 0,
}) => {
  const [filterSide, setFilterSide] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [filterResult, setFilterResult] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filtered trades
  const filteredTrades = trades.filter((t) => {
    if (filterSide !== 'ALL' && t.side !== filterSide) return false;
    if (filterResult !== 'ALL' && t.result !== filterResult) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = t.id.toString().includes(q);
      const matchEntry = t.entry_time.toLowerCase().includes(q);
      const matchExit = t.exit_time.toLowerCase().includes(q);
      const matchReason = t.exit_reason.toLowerCase().includes(q);
      if (!matchId && !matchEntry && !matchExit && !matchReason) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const paginatedTrades = filteredTrades.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!trades.length) return;
    const headers = ['Trade ID', 'Entry Time', 'Exit Time', 'Direction', 'Entry Price', 'Exit Price', 'PnL (R)', 'PnL ($)', 'Exit Trigger'];
    const rows = trades.map((t) => [
      t.id,
      t.entry_time,
      t.exit_time,
      t.side,
      t.entry_price,
      t.exit_price,
      t.pnl_r,
      t.pnl_quote,
      t.exit_reason,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_backtest_trades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 font-mono text-xs select-none shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141a26] pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">Trade Execution Log & Intrabar Fills</h3>
          <span className="text-[10px] bg-[#121824] border border-[#1c2436] px-2 py-0.5 rounded text-cyan-300 font-bold">
            {(totalTradesCount || trades.length).toLocaleString()} Total Executions
          </span>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          {/* Search Box */}
          <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded px-2 py-1">
            <Search className="w-3 h-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white outline-none placeholder:text-slate-600 text-[10px] w-24 sm:w-32"
            />
          </div>

          {/* Direction Filter */}
          <div className="flex items-center bg-[#07090e] border border-[#1a2232] rounded p-0.5">
            {(['ALL', 'LONG', 'SHORT'] as const).map((side) => (
              <button
                key={side}
                onClick={() => {
                  setFilterSide(side);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  filterSide === side ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Result Filter */}
          <div className="flex items-center bg-[#07090e] border border-[#1a2232] rounded p-0.5">
            {(['ALL', 'WIN', 'LOSS'] as const).map((res) => (
              <button
                key={res}
                onClick={() => {
                  setFilterResult(res);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  filterResult === res ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          {/* Export CSV CTA */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#121824] hover:bg-[#1a2436] border border-[#1e2a40] text-cyan-300 hover:text-white rounded font-bold transition"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#161c28] text-slate-400 font-mono text-[10px] bg-[#07090e]/60">
              <th className="py-2 px-3">Trade ID</th>
              <th className="py-2 px-3">Entry Time</th>
              <th className="py-2 px-3">Exit Time</th>
              <th className="py-2 px-3">Direction</th>
              <th className="py-2 px-3 text-right">Entry Price</th>
              <th className="py-2 px-3 text-right">Exit Price</th>
              <th className="py-2 px-3 text-right">PnL (R)</th>
              <th className="py-2 px-3 text-right">PnL ($)</th>
              <th className="py-2 px-3 text-center">Exit Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#121824] text-slate-200 font-mono text-[11px]">
            {paginatedTrades.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  No trades match the selected filter.
                </td>
              </tr>
            ) : (
              paginatedTrades.map((t) => {
                const isWin = t.pnl_r > 0;
                return (
                  <tr key={t.id} className="hover:bg-[#121722] transition">
                    <td className="py-2 px-3 text-slate-400 font-bold">#{t.id}</td>
                    <td className="py-2 px-3 text-slate-300">{t.entry_time}</td>
                    <td className="py-2 px-3 text-slate-300">{t.exit_time}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                          t.side === 'LONG'
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {t.side}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">{t.entry_price.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">{t.exit_price.toLocaleString()}</td>
                    <td
                      className={`py-2 px-3 text-right font-extrabold ${
                        isWin ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isWin ? `+${t.pnl_r.toFixed(2)}R` : `${t.pnl_r.toFixed(2)}R`}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-extrabold ${
                        isWin ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isWin ? `+$${t.pnl_quote.toFixed(2)}` : `-$${Math.abs(t.pnl_quote).toFixed(2)}`}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.exit_reason === 'TP_HIT'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                            : t.exit_reason === 'SL_HIT'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/80'
                            : 'bg-slate-900 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {t.exit_reason}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#141a26] pt-2.5 text-[10px] text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(filteredTrades.length, currentPage * pageSize)} of {filteredTrades.length} entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-[#07090e] border border-[#1a2232] text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="px-2 font-bold text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-[#07090e] border border-[#1a2232] text-slate-300 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
