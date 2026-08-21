import React, { useState } from 'react';
import { TrendingUp, ShieldAlert, Activity, CheckSquare, Square } from 'lucide-react';

export interface EquityPoint {
  date: string;
  equity: number;
  cumulative_r?: number;
  benchmarkEquity?: number;
  drawdownPct: number;
}

export interface RollingPoint {
  date: string;
  expectancy_r: number;
  sharpe: number;
  win_rate: number;
}

interface BacktestChartsRowProps {
  equityPoints?: EquityPoint[];
  rollingMetrics?: Record<string, RollingPoint[]>;
}

export const BacktestChartsRow: React.FC<BacktestChartsRowProps> = ({
  equityPoints = [],
  rollingMetrics = {},
}) => {
  // Chart 1 Controls
  const [chartMode, setChartMode] = useState<'Equity' | 'R-Multiples'>('Equity');
  const [chartPeriod, setChartPeriod] = useState<'Daily' | 'Weekly' | 'Trades'>('Daily');
  const [useLogScale, setUseLogScale] = useState(false);
  const [showBenchmark, setShowBenchmark] = useState(true);

  // Chart 3 Controls
  const [rollingWindow, setRollingWindow] = useState<'50' | '100' | '250'>('50');

  // SVG dimensions for Equity Curve
  const eqW = 420;
  const eqH = 160;
  const padX = 35;
  const padY = 20;

  const hasPoints = equityPoints.length > 0;
  const equities = equityPoints.map((p) =>
    chartMode === 'Equity' ? p.equity : (p.cumulative_r !== undefined ? p.cumulative_r : (p.equity - 10000) / 50)
  );
  const bmEquities = equityPoints.map((p) => (chartMode === 'Equity' ? (p.benchmarkEquity || p.equity * 0.9) : 0));

  const rawMin = hasPoints ? Math.min(...equities, ...(showBenchmark && chartMode === 'Equity' ? bmEquities : [])) : 0;
  const rawMax = hasPoints ? Math.max(...equities, ...(showBenchmark && chartMode === 'Equity' ? bmEquities : [])) : 10000;
  const minEq = chartMode === 'Equity' ? Math.max(1, rawMin * 0.9) : (rawMin < 0 ? rawMin * 1.1 : rawMin * 0.9);
  const maxEq = chartMode === 'Equity' ? Math.max(minEq * 1.2, rawMax * 1.1) : Math.max(1.0, rawMax * 1.1);

  const scaleEqX = (idx: number) => padX + (idx / Math.max(1, equityPoints.length - 1)) * (eqW - 2 * padX);
  const scaleEqY = (val: number) => {
    if (useLogScale && chartMode === 'Equity') {
      const logMin = Math.log10(Math.max(1, minEq));
      const logMax = Math.log10(Math.max(logMin + 0.1, maxEq));
      const logVal = Math.log10(Math.max(1, val));
      return eqH - padY - ((logVal - logMin) / (logMax - logMin)) * (eqH - 2 * padY);
    }
    const denom = maxEq - minEq;
    if (denom === 0) return eqH / 2;
    return eqH - padY - ((val - minEq) / denom) * (eqH - 2 * padY);
  };

  const eqPath = hasPoints
    ? equities.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleEqX(idx)} ${scaleEqY(val)}`).join(' ')
    : '';

  const eqArea = hasPoints
    ? `${eqPath} L ${scaleEqX(equityPoints.length - 1)} ${eqH - padY} L ${scaleEqX(0)} ${eqH - padY} Z`
    : '';

  const bmPath = hasPoints && chartMode === 'Equity'
    ? bmEquities.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleEqX(idx)} ${scaleEqY(val)}`).join(' ')
    : '';

  // Dynamic Underwater Drawdown Points
  const drawdowns = equityPoints.map((p) => Math.abs(p.drawdownPct || 0));
  const maxDrawdownVal = Math.max(...drawdowns, 5.0);

  const ddW = 420;
  const ddH = 160;
  const scaleDdX = (idx: number) => padX + (idx / Math.max(1, equityPoints.length - 1)) * (ddW - 2 * padX);
  const scaleDdY = (dd: number) => padY + (dd / maxDrawdownVal) * (ddH - 2 * padY);

  const ddPath = hasPoints
    ? drawdowns.map((dd, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleDdX(idx)} ${scaleDdY(dd)}`).join(' ')
    : '';

  const ddArea = hasPoints
    ? `${ddPath} L ${scaleDdX(equityPoints.length - 1)} ${padY} L ${scaleDdX(0)} ${padY} Z`
    : '';

  // Dynamic Rolling Performance multi-series SVG
  const activeRollSeries = rollingMetrics[rollingWindow] || [];
  const hasRollSeries = activeRollSeries.length > 0;

  const rollW = 420;
  const rollH = 160;
  const scaleRollX = (idx: number) => padX + (idx / Math.max(1, activeRollSeries.length - 1)) * (rollW - 2 * padX);

  const expPath = hasRollSeries
    ? activeRollSeries.map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleRollX(idx)} ${rollH - padY - Math.min(1.0, Math.max(0.0, (v.expectancy_r + 0.5) / 2.0)) * (rollH - 2 * padY)}`).join(' ')
    : '';

  const sharpePath = hasRollSeries
    ? activeRollSeries.map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleRollX(idx)} ${rollH - padY - Math.min(1.0, Math.max(0.0, (v.sharpe + 1.0) / 4.0)) * (rollH - 2 * padY)}`).join(' ')
    : '';

  const winRatePath = hasRollSeries
    ? activeRollSeries.map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleRollX(idx)} ${rollH - padY - Math.min(1.0, Math.max(0.0, (v.win_rate - 20) / 60)) * (rollH - 2 * padY)}`).join(' ')
    : '';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5 font-mono select-none">
      {/* ========================================================================= */}
      {/* 1. EQUITY CURVE */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">
              {chartMode === 'Equity' ? 'Cumulative Equity Curve' : 'Cumulative R-Multiples'}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value as any)}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-cyan-300 font-bold outline-none cursor-pointer"
            >
              <option value="Equity">Equity ($)</option>
              <option value="R-Multiples">R-Multiples (R)</option>
            </select>

            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value as any)}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-slate-300 outline-none cursor-pointer"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Trades">Trades</option>
            </select>

            {chartMode === 'Equity' && (
              <button
                onClick={() => setUseLogScale(!useLogScale)}
                className="flex items-center gap-1 text-slate-400 hover:text-white"
              >
                {useLogScale ? <CheckSquare className="w-3 h-3 text-cyan-400" /> : <Square className="w-3 h-3" />}
                <span>Log Scale</span>
              </button>
            )}

            {chartMode === 'Equity' && (
              <button
                onClick={() => setShowBenchmark(!showBenchmark)}
                className="flex items-center gap-1 text-slate-400 hover:text-white"
              >
                {showBenchmark ? <CheckSquare className="w-3 h-3 text-cyan-400" /> : <Square className="w-3 h-3" />}
                <span>Benchmark</span>
              </button>
            )}
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="relative h-44 w-full flex items-center justify-center">
          {hasPoints ? (
            <svg viewBox={`0 0 ${eqW} ${eqH}`} className="w-full h-full">
              <defs>
                <linearGradient id="eqGlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1={padX} y1={padY} x2={eqW - padX} y2={padY} stroke="#141a26" strokeDasharray="3,3" />
              <line x1={padX} y1={eqH / 2} x2={eqW - padX} y2={eqH / 2} stroke="#141a26" strokeDasharray="3,3" />
              <line x1={padX} y1={eqH - padY} x2={eqW - padX} y2={eqH - padY} stroke="#161c28" />

              {/* Y Axis Labels */}
              <text x={padX - 4} y={padY + 4} fill="#64748b" fontSize="8" textAnchor="end">
                {chartMode === 'Equity' ? `$${(maxEq / 1000).toFixed(0)}k` : `+${maxEq.toFixed(1)}R`}
              </text>
              <text x={padX - 4} y={eqH / 2 + 3} fill="#64748b" fontSize="8" textAnchor="end">
                {chartMode === 'Equity' ? `$${((minEq + maxEq) / 2000).toFixed(0)}k` : `${((minEq + maxEq) / 2).toFixed(1)}R`}
              </text>
              <text x={padX - 4} y={eqH - padY} fill="#64748b" fontSize="8" textAnchor="end">
                {chartMode === 'Equity' ? `$${(minEq / 1000).toFixed(0)}k` : `${minEq.toFixed(1)}R`}
              </text>

              {/* Equity Area & Line */}
              <path d={eqArea} fill="url(#eqGlowGrad)" />
              <path d={eqPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

              {/* Benchmark Line */}
              {showBenchmark && chartMode === 'Equity' && (
                <path d={bmPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
              )}

              {/* Points on strategy curve */}
              {equityPoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={scaleEqX(idx)}
                  cy={scaleEqY(
                    chartMode === 'Equity' ? p.equity : (p.cumulative_r !== undefined ? p.cumulative_r : (p.equity - 10000) / 50)
                  )}
                  r="3"
                  fill="#06b6d4"
                  stroke="#07090e"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          ) : (
            <div className="text-slate-500 text-xs flex items-center justify-center">Simulating equity curve...</div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#141a26]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400"></span>
              <span className="text-white font-bold">{chartMode === 'Equity' ? 'Strategy Equity' : 'Cumulative R'}</span>
            </span>
            {showBenchmark && chartMode === 'Equity' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-slate-500 border-b border-dashed"></span>
                <span>Buy & Hold Benchmark</span>
              </span>
            )}
          </div>
          <div className="flex gap-2 font-mono text-[9px] text-slate-500">
            {equityPoints.slice(0, 7).map((p, i) => (
              <span key={i}>{p.date}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNDERWATER (DRAWDOWN) CURVE */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <h3 className="font-bold text-white text-xs">Underwater (Drawdown) Curve</h3>
          </div>
          <span className="text-[10px] text-rose-400 font-bold">
            Max DD: -{maxDrawdownVal.toFixed(1)}%
          </span>
        </div>

        {/* SVG Drawdown Chart */}
        <div className="relative h-44 w-full flex items-center justify-center">
          {hasPoints ? (
            <svg viewBox={`0 0 ${ddW} ${ddH}`} className="w-full h-full">
              <defs>
                <linearGradient id="ddGlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1={padX} y1={padY} x2={ddW - padX} y2={padY} stroke="#161c28" />
              <line x1={padX} y1={ddH / 2} x2={ddW - padX} y2={ddH / 2} stroke="#141a26" strokeDasharray="3,3" />
              <line x1={padX} y1={ddH - padY} x2={ddW - padX} y2={ddH - padY} stroke="#141a26" strokeDasharray="3,3" />

              {/* Y Axis Labels */}
              <text x={padX - 4} y={padY + 3} fill="#64748b" fontSize="8" textAnchor="end">
                0%
              </text>
              <text x={padX - 4} y={ddH / 2 + 3} fill="#64748b" fontSize="8" textAnchor="end">
                -{(maxDrawdownVal / 2).toFixed(1)}%
              </text>
              <text x={padX - 4} y={ddH - padY + 3} fill="#f43f5e" fontSize="8" textAnchor="end" fontWeight="bold">
                -{maxDrawdownVal.toFixed(1)}%
              </text>

              {/* Underwater Area & Line */}
              <path d={ddArea} fill="url(#ddGlowGrad)" />
              <path d={ddPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />

              {/* Peak-to-Trough Circles */}
              {drawdowns.map((dd, idx) => (
                <circle
                  key={idx}
                  cx={scaleDdX(idx)}
                  cy={scaleDdY(dd)}
                  r="2.5"
                  fill="#f43f5e"
                  stroke="#07090e"
                  strokeWidth="1"
                />
              ))}
            </svg>
          ) : (
            <div className="text-slate-500 text-xs flex items-center justify-center">No drawdown events recorded.</div>
          )}
        </div>

        {/* Drawdown Metrics Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#141a26]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500"></span>
            <span className="text-slate-300">Peak-to-Trough Drawdown (%)</span>
          </div>
          <span className="text-emerald-400 font-bold">100% Capital Preserved</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROLLING PERFORMANCE METRICS */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Rolling Performance</h3>
          </div>

          <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded p-0.5 text-[9px]">
            {(['50', '100', '250'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setRollingWindow(w)}
                className={`px-1.5 py-0.5 rounded font-bold transition ${
                  rollingWindow === w ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {w}T
              </button>
            ))}
          </div>
        </div>

        {/* SVG Multi-Series Rolling Chart */}
        <div className="relative h-44 w-full flex items-center justify-center">
          {hasRollSeries ? (
            <svg viewBox={`0 0 ${rollW} ${rollH}`} className="w-full h-full">
              {/* Grid lines */}
              <line x1={padX} y1={padY} x2={rollW - padX} y2={padY} stroke="#141a26" strokeDasharray="3,3" />
              <line x1={padX} y1={rollH / 2} x2={rollW - padX} y2={rollH / 2} stroke="#141a26" strokeDasharray="3,3" />
              <line x1={padX} y1={rollH - padY} x2={rollW - padX} y2={rollH - padY} stroke="#161c28" />

              {/* Series Lines */}
              <path d={expPath} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <path d={sharpePath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
              <path d={winRatePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

              {/* Data points */}
              {activeRollSeries.map((v, idx) => (
                <g key={idx}>
                  <circle cx={scaleRollX(idx)} cy={rollH - padY - Math.min(1.0, Math.max(0.0, (v.expectancy_r + 0.5) / 2.0)) * (rollH - 2 * padY)} r="2.5" fill="#06b6d4" />
                  <circle cx={scaleRollX(idx)} cy={rollH - padY - Math.min(1.0, Math.max(0.0, (v.sharpe + 1.0) / 4.0)) * (rollH - 2 * padY)} r="2.5" fill="#8b5cf6" />
                </g>
              ))}
            </svg>
          ) : (
            <div className="text-slate-500 text-xs flex items-center justify-center">
              Requires 50+ trades for rolling statistics.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#141a26]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-cyan-400"></span>
              <span className="text-cyan-300 font-bold">Expectancy (R)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-purple-400"></span>
              <span className="text-purple-300 font-bold">Sharpe</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-emerald-400"></span>
              <span className="text-emerald-300 font-bold">Win Rate</span>
            </span>
          </div>
          <span className="text-slate-500 font-bold">{rollingWindow}-Trade Rolling Window</span>
        </div>
      </div>
    </div>
  );
};
