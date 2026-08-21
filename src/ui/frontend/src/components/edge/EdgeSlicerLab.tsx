import React from 'react';
import { Filter, Play, Download, Activity, CheckCircle2 } from 'lucide-react';

interface TradeSampleItem {
  trade_id: string;
  entry_time: string;
  direction: string;
  pnl_r: number;
  pnl_quote: number;
  exit_reason: string;
}

interface CumulativeRPoint {
  trade_num: number;
  cumulative_r: number;
  label: string;
}

interface EdgeSlicerLabProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
  selectedSession: string;
  onSessionChange: (session: string) => void;
  selectedVol: string;
  onVolChange: (vol: string) => void;
  selectedTrend: string;
  onTrendChange: (trend: string) => void;
  selectedDay: string;
  onDayChange: (day: string) => void;
  onComputeSlice: () => void;
  isLoading: boolean;
  cumulativeRCurve?: CumulativeRPoint[];
  tradesSample?: TradeSampleItem[];
  pValue?: number;
}

export const EdgeSlicerLab: React.FC<EdgeSlicerLabProps> = ({
  selectedPair,
  onPairChange,
  selectedSession,
  onSessionChange,
  selectedVol,
  onVolChange,
  selectedTrend,
  onTrendChange,
  selectedDay,
  onDayChange,
  onComputeSlice,
  isLoading,
  cumulativeRCurve = [
    { trade_num: 1, cumulative_r: 2.4, label: 'T1' },
    { trade_num: 2, cumulative_r: 1.4, label: 'T2' },
    { trade_num: 3, cumulative_r: 4.5, label: 'T3' },
    { trade_num: 4, cumulative_r: 6.3, label: 'T4' },
    { trade_num: 5, cumulative_r: 5.3, label: 'T5' },
    { trade_num: 6, cumulative_r: 7.7, label: 'T6' },
    { trade_num: 7, cumulative_r: 9.8, label: 'T7' },
    { trade_num: 8, cumulative_r: 12.2, label: 'T8' },
  ],
  tradesSample = [],
  pValue = 0.0014,
}) => {
  // SVG Dimensions
  const svgW = 600;
  const svgH = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const rValues = cumulativeRCurve.map((p) => p.cumulative_r);
  const minR = Math.min(...rValues, 0);
  const maxR = Math.max(...rValues, 10);

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, cumulativeRCurve.length - 1)) * plotW;
  const scaleY = (val: number) => padTop + plotH - ((val - minR) / Math.max(1, maxR - minR)) * plotH;

  const pathData = cumulativeRCurve
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(p.cumulative_r)}`)
    .join(' ');

  const areaData = `${pathData} L ${scaleX(cumulativeRCurve.length - 1)} ${padTop + plotH} L ${padLeft} ${padTop + plotH} Z`;

  const handleExportCSV = () => {
    const headers = 'TradeID,EntryTime,Direction,PnLR,PnLQuote,ExitReason\n';
    const rows = tradesSample
      .map((t) => `${t.trade_id},${t.entry_time},${t.direction},${t.pnl_r},${t.pnl_quote},${t.exit_reason}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slice_trades_${selectedPair}_${selectedSession}.csv`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs select-none">
      {/* Left Column: Slicing Parameters Controls */}
      <div className="lg:col-span-4 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-white border-b border-[#141a26] pb-2.5">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Multi-Dimensional Slicing Filters</span>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[10px] uppercase font-semibold">Asset Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => onPairChange(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-white font-bold outline-none text-xs"
            >
              <option value="XAUUSD">XAUUSD (Gold / US Dollar)</option>
              <option value="EURUSD">EURUSD (Euro / US Dollar)</option>
              <option value="GBPUSD">GBPUSD (British Pound / US Dollar)</option>
              <option value="USDJPY">USDJPY (US Dollar / Japanese Yen)</option>
              <option value="BTCUSDT">BTCUSDT (Bitcoin / Tether)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[10px] uppercase font-semibold">Trading Session</label>
            <select
              value={selectedSession}
              onChange={(e) => onSessionChange(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-white font-bold outline-none text-xs"
            >
              <option value="london">London Session (07:00 – 15:00 UTC)</option>
              <option value="new_york">New York Session (13:00 – 21:00 UTC)</option>
              <option value="asia">Asian Session (00:00 – 08:00 UTC)</option>
              <option value="all">All Sessions Combined</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[10px] uppercase font-semibold">Volatility Regime</label>
            <select
              value={selectedVol}
              onChange={(e) => onVolChange(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-white font-bold outline-none text-xs"
            >
              <option value="high">High Volatility (ATR &gt; 18.0)</option>
              <option value="mid">Mid Volatility (ATR 10.0 – 18.0)</option>
              <option value="low">Low Volatility (ATR &lt; 10.0)</option>
              <option value="all">All Volatility Regimes</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[10px] uppercase font-semibold">HTF 4h Trend Alignment</label>
            <select
              value={selectedTrend}
              onChange={(e) => onTrendChange(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-white font-bold outline-none text-xs"
            >
              <option value="bullish">Bullish 4h Alignment (EMA 50 &gt; 200)</option>
              <option value="bearish">Bearish 4h Alignment (EMA 50 &lt; 200)</option>
              <option value="ranging">Ranging / Neutral</option>
              <option value="all">Any Trend Regime</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[10px] uppercase font-semibold">Day of Week</label>
            <select
              value={selectedDay}
              onChange={(e) => onDayChange(e.target.value)}
              className="w-full bg-[#07090e] border border-[#1a2232] rounded-lg p-2 text-white font-bold outline-none text-xs"
            >
              <option value="Tuesday">Tuesday (Peak Volatility Day)</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Monday">Monday (Asia Open Focus)</option>
              <option value="Friday">Friday (Pre-Weekend Cutoff)</option>
              <option value="all">All Days Combined</option>
            </select>
          </div>
        </div>

        <button
          onClick={onComputeSlice}
          disabled={isLoading}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:bg-slate-700 text-black font-extrabold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 transition mt-3"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isLoading ? 'Scanning DuckDB Slice...' : 'Compute Slice Statistics'}</span>
        </button>
      </div>

      {/* Right Column: Sliced R-Curve & Trades Ledger */}
      <div className="lg:col-span-8 space-y-4">
        {/* Cumulative R-Curve SVG */}
        <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-xs">Cumulative R-Multiple Curve (Target Slice)</h3>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono">
              p-value = {pValue.toFixed(4)} (SIGNIFICANT)
            </span>
          </div>

          <div className="relative h-48 w-full flex items-center justify-center">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
              <defs>
                <linearGradient id="sliceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Grid lines */}
              {[0, 0.33, 0.66, 1.0].map((frac, idx) => {
                const val = Math.round(minR + frac * (maxR - minR));
                return (
                  <g key={`sly-${idx}`}>
                    <line
                      x1={padLeft}
                      y1={scaleY(val)}
                      x2={padLeft + plotW}
                      y2={scaleY(val)}
                      stroke="#141a26"
                      strokeDasharray="2,3"
                    />
                    <text x={padLeft - 6} y={scaleY(val) + 3} fill="#64748b" fontSize="8" textAnchor="end">
                      +{val}R
                    </text>
                  </g>
                );
              })}

              {/* X Labels */}
              {cumulativeRCurve.map((p, idx) => (
                <text
                  key={`slx-${idx}`}
                  x={scaleX(idx)}
                  y={padTop + plotH + 14}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              ))}

              {/* Area & Path */}
              <path d={areaData} fill="url(#sliceAreaGrad)" />
              <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" />

              {/* Dots */}
              {cumulativeRCurve.map((p, idx) => (
                <circle
                  key={`sldot-${idx}`}
                  cx={scaleX(idx)}
                  cy={scaleY(p.cumulative_r)}
                  r="2.5"
                  fill="#10b981"
                  stroke="#07090e"
                  strokeWidth="1"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Filtered Trades Ledger Table */}
        <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
            <h3 className="text-xs font-bold text-white">Sample Filtered Trades in Target Slice</h3>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded text-slate-300 hover:text-white transition font-bold text-[10px]"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-[260px] overflow-y-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="sticky top-0 bg-[#07090e] z-10 text-[10px] text-slate-400 border-b border-[#141a26]">
                <tr>
                  <th className="py-2 px-2.5">Trade ID</th>
                  <th className="py-2 px-2.5">Entry Time</th>
                  <th className="py-2 px-2.5">Side</th>
                  <th className="py-2 px-2.5 text-right">PnL (R)</th>
                  <th className="py-2 px-2.5 text-right">PnL ($)</th>
                  <th className="py-2 px-2.5 text-center">Exit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141a26] text-[11px]">
                {tradesSample.map((t) => (
                  <tr key={t.trade_id} className="hover:bg-[#121824] transition">
                    <td className="py-2 px-2.5 text-purple-400 font-bold">#{t.trade_id}</td>
                    <td className="py-2 px-2.5 text-slate-300">{t.entry_time}</td>
                    <td className={`py-2 px-2.5 font-bold ${t.direction === 'LONG' ? 'text-emerald-400' : 'text-purple-400'}`}>
                      {t.direction}
                    </td>
                    <td className={`py-2 px-2.5 text-right font-bold ${t.pnl_r >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.pnl_r >= 0 ? `+${t.pnl_r.toFixed(2)}` : t.pnl_r.toFixed(2)}R
                    </td>
                    <td className={`py-2 px-2.5 text-right font-bold ${t.pnl_quote >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.pnl_quote >= 0 ? `+$${t.pnl_quote.toFixed(2)}` : `-$${Math.abs(t.pnl_quote).toFixed(2)}`}
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          t.exit_reason === 'TP_HIT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                        }`}
                      >
                        {t.exit_reason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
