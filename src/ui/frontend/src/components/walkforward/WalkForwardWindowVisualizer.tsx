import React from 'react';
import { Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export interface WalkForwardWindowItem {
  window_id: string;
  train_period: string;
  test_period: string;
  is_sharpe: number;
  oos_sharpe: number;
  is_expectancy_r?: number;
  oos_expectancy_r?: number;
  is_win_rate_pct?: number;
  oos_win_rate_pct?: number;
  is_profit_factor?: number;
  oos_profit_factor?: number;
  is_trades_count?: number;
  oos_trades_count?: number;
  wfer_pct: number;
  status: string;
}

interface WalkForwardWindowVisualizerProps {
  windows: WalkForwardWindowItem[];
  mode: string;
}

export const WalkForwardWindowVisualizer: React.FC<WalkForwardWindowVisualizerProps> = ({
  windows = [],
  mode = 'Rolling Windows',
}) => {
  const isAnchored = mode.toLowerCase().includes('anchored');
  const n = Math.max(1, windows.length);

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Walk-Forward Window Timeline & Data Partitioning Structure
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600/80 border border-blue-400"></span>
            <span className="text-slate-300">In-Sample (Train)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600/80 border border-emerald-400"></span>
            <span className="text-slate-300">Out-of-Sample (Test)</span>
          </div>
        </div>
      </div>

      {/* Visual Window Bars */}
      <div className="space-y-2.5 py-1">
        {windows.map((w, idx) => {
          // Calculate start and widths based on rolling vs anchored
          const trainStartPct = isAnchored ? 0 : (idx / (n + 1)) * 70;
          const trainWidthPct = isAnchored ? 35 + (idx / (n - 1 || 1)) * 35 : 40;
          const testStartPct = trainStartPct + trainWidthPct;
          const testWidthPct = 20;

          return (
            <div key={w.window_id} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{w.window_id}</span>
                  <span className="text-slate-400">
                    Train: <span className="text-blue-300">{w.train_period}</span> → Test: <span className="text-emerald-300 font-bold">{w.test_period}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">WFER:</span>
                  <span className="font-extrabold text-emerald-400">{w.wfer_pct.toFixed(1)}%</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                      w.status === 'PASSED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              </div>

              {/* Progress bar timeline */}
              <div className="relative w-full h-4 bg-[#07090e] border border-[#161c28] rounded-lg overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-l transition-all"
                  style={{
                    marginLeft: `${trainStartPct}%`,
                    width: `${trainWidthPct}%`,
                  }}
                  title={`In-Sample: ${w.train_period}`}
                />
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-r transition-all"
                  style={{
                    width: `${testWidthPct}%`,
                  }}
                  title={`Out-of-Sample: ${w.test_period}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
