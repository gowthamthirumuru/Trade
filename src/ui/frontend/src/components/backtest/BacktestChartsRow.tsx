import React, { useState } from 'react';
import { TrendingUp, ShieldAlert, Activity, CheckSquare, Square } from 'lucide-react';

export interface EquityPoint {
  date: string;
  equity: number;
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
  equityPoints = [
    { date: '2004', equity: 10000, benchmarkEquity: 10000, drawdownPct: 0.0 },
    { date: '2008', equity: 13200, benchmarkEquity: 9200, drawdownPct: -3.8 },
    { date: '2012', equity: 16800, benchmarkEquity: 13100, drawdownPct: -4.2 },
    { date: '2016', equity: 20500, benchmarkEquity: 16800, drawdownPct: -5.4 },
    { date: '2020', equity: 24800, benchmarkEquity: 20100, drawdownPct: -2.4 },
    { date: '2024', equity: 28500, benchmarkEquity: 22100, drawdownPct: -1.8 },
    { date: '2026', equity: 29200, benchmarkEquity: 23500, drawdownPct: -0.9 },
  ],
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

  const equities = equityPoints.map((p) => (chartMode === 'Equity' ? p.equity : (p.equity - 10000) / 50));
  const bmEquities = equityPoints.map((p) => p.benchmarkEquity || p.equity * 0.9);

  const rawMin = Math.min(...equities, ...(showBenchmark ? bmEquities : []));
  const rawMax = Math.max(...equities, ...(showBenchmark ? bmEquities : []));
  const minEq = Math.max(1, rawMin * 0.9);
  const maxEq = Math.max(minEq * 1.2, rawMax * 1.1);

  const scaleEqX = (idx: number) => padX + (idx / Math.max(1, equityPoints.length - 1)) * (eqW - 2 * padX);
  const scaleEqY = (val: number) => {
    if (useLogScale) {
      const logMin = Math.log10(minEq);
      const logMax = Math.log10(maxEq);
      const logVal = Math.log10(Math.max(minEq, val));
      return eqH - padY - ((logVal - logMin) / (logMax - logMin)) * (eqH - 2 * padY);
    }
    return eqH - padY - ((val - minEq) / (maxEq - minEq)) * (eqH - 2 * padY);
  };

  const eqPath = equities
    .map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleEqX(idx)} ${scaleEqY(val)}`)
    .join(' ');

  const eqArea = `${eqPath} L ${scaleEqX(equityPoints.length - 1)} ${eqH - padY} L ${scaleEqX(0)} ${eqH - padY} Z`;

  const bmPath = bmEquities
    .map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleEqX(idx)} ${scaleEqY(val)}`)
    .join(' ');

  // Dynamic Underwater Drawdown Points
  const drawdowns = equityPoints.map((p) => Math.abs(p.drawdownPct));
  const maxDrawdownVal = Math.max(...drawdowns, 5.0);

  const ddW = 420;
  const ddH = 160;
  const scaleDdX = (idx: number) => padX + (idx / Math.max(1, equityPoints.length - 1)) * (ddW - 2 * padX);
  const scaleDdY = (dd: number) => padY + (dd / maxDrawdownVal) * (ddH - 2 * padY);

  const ddPath = drawdowns
    .map((dd, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleDdX(idx)} ${scaleDdY(dd)}`)
    .join(' ');

  const ddArea = `${ddPath} L ${scaleDdX(equityPoints.length - 1)} ${padY} L ${scaleDdX(0)} ${padY} Z`;

  // Dynamic Rolling Performance multi-series SVG
  const activeRollSeries = rollingMetrics[rollingWindow] || [
    { date: '2010', expectancy_r: 0.85, sharpe: 2.10, win_rate: 61 },
    { date: '2013', expectancy_r: 0.92, sharpe: 2.25, win_rate: 64 },
    { date: '2016', expectancy_r: 0.74, sharpe: 1.95, win_rate: 59 },
    { date: '2019', expectancy_r: 1.12, sharpe: 2.45, win_rate: 66 },
    { date: '2022', expectancy_r: 1.05, sharpe: 2.30, win_rate: 63 },
    { date: '2025', expectancy_r: 0.91, sharpe: 2.18, win_rate: 62.4 },
  ];

  const rollW = 420;
  const rollH = 160;
  const scaleRollX = (idx: number) => padX + (idx / Math.max(1, activeRollSeries.length - 1)) * (rollW - 2 * padX);

  const expPath = activeRollSeries
    .map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleRollX(idx)} ${rollH - padY - ((v.expectancy_r + 0.5) / 2.0) * (rollH - 2 * padY)}`)
    .join(' ');

  const sharpePath = activeRollSeries
    .map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleRollX(idx)} ${rollH - padY - ((v.sharpe + 1.0) / 4.0) * (rollH - 2 * padY)}`)
    .join(' ');

  const winRatePath = activeRollSeries
    .map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleRollX(idx)} ${rollH - padY - ((v.win_rate - 30) / 50) * (rollH - 2 * padY)}`)
    .join(' ');

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
            <h3 className="font-bold text-white text-xs">Equity Curve</h3>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <select
              value={chartMode}
              onChange={(e) => setChartMode(e.target.value as any)}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-cyan-300 font-bold outline-none cursor-pointer"
            >
              <option value="Equity">Equity</option>
              <option value="R-Multiples">R-Multiples</option>
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

            <button
              onClick={() => setUseLogScale(!useLogScale)}
              className="flex items-center gap-1 text-slate-400 hover:text-white"
            >
              {useLogScale ? <CheckSquare className="w-3 h-3 text-cyan-400" /> : <Square className="w-3 h-3" />}
              <span>Log Scale</span>
            </button>

            <button
              onClick={() => setShowBenchmark(!showBenchmark)}
              className="flex items-center gap-1 text-slate-400 hover:text-white"
            >
              {showBenchmark ? <CheckSquare className="w-3 h-3 text-cyan-400" /> : <Square className="w-3 h-3" />}
              <span>Benchmark</span>
            </button>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <svg viewBox={`0 0 ${eqW} ${eqH}`} className="w-full h-full">
            <defs>
              <linearGradient id="eqGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padX} y1={padY} x2={eqW - padX} y2={padY} stroke="#141a26" strokeDasharray="3,3" />
            <line x1={padX} y1={eqH / 2} x2={eqW - padX} y2={eqH / 2} stroke="#141a26" strokeDasharray="3,3" />
            <line x1={padX} y1={eqH - padY} x2={eqW - padX} y2={eqH - padY} stroke="#161c28" />

            {/* Y Axis Labels */}
            <text x={padX - 4} y={padY + 4} fill="#64748b" fontSize="8" textAnchor="end">
              ${(maxEq / 1000).toFixed(0)}k
            </text>
            <text x={padX - 4} y={eqH / 2 + 3} fill="#64748b" fontSize="8" textAnchor="end">
              ${((minEq + maxEq) / 2000).toFixed(0)}k
            </text>
            <text x={padX - 4} y={eqH - padY} fill="#64748b" fontSize="8" textAnchor="end">
              ${(minEq / 1000).toFixed(0)}k
            </text>

            {/* Equity Area & Line */}
            <path d={eqArea} fill="url(#eqGlowGrad)" />
            <path d={eqPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

            {/* Benchmark Line */}
            {showBenchmark && (
              <path d={bmPath} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
            )}

            {/* Points on strategy curve */}
            {equityPoints.map((p, idx) => (
              <circle
                key={idx}
                cx={scaleEqX(idx)}
                cy={scaleEqY(chartMode === 'Equity' ? p.equity : (p.equity - 10000) / 50)}
                r="3"
                fill="#06b6d4"
                stroke="#07090e"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#141a26]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400"></span>
              <span className="text-white font-bold">Strategy</span>
            </span>
            {showBenchmark && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-slate-500 border-b border-dashed"></span>
                <span>Buy & Hold</span>
              </span>
            )}
          </div>
          <div className="flex gap-2 font-mono text-[9px]">
            {equityPoints.map((p, i) => (
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
          <span className="text-[10px] text-rose-400 font-extrabold">
            Max DD: -{maxDrawdownVal.toFixed(1)}%
          </span>
        </div>

        {/* Drawdown SVG Chart */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <svg viewBox={`0 0 ${ddW} ${ddH}`} className="w-full h-full">
            <defs>
              <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Zero Axis */}
            <line x1={padX} y1={padY} x2={ddW - padX} y2={padY} stroke="#1e2a40" strokeWidth="1.5" />
            <line x1={padX} y1={eqH / 2} x2={ddW - padX} y2={eqH / 2} stroke="#141a26" strokeDasharray="3,3" />
            <line x1={padX} y1={eqH - padY} x2={ddW - padX} y2={eqH - padY} stroke="#141a26" strokeDasharray="3,3" />

            {/* Y Axis Labels */}
            <text x={padX - 4} y={padY + 3} fill="#64748b" fontSize="8" textAnchor="end">
              0%
            </text>
            <text x={padX - 4} y={eqH / 2 + 3} fill="#64748b" fontSize="8" textAnchor="end">
              -{(maxDrawdownVal / 2).toFixed(0)}%
            </text>
            <text x={padX - 4} y={eqH - padY} fill="#f43f5e" fontSize="8" textAnchor="end">
              -{maxDrawdownVal.toFixed(0)}%
            </text>

            {/* Underwater Area & Polyline */}
            <path d={ddArea} fill="url(#ddGrad)" />
            <path d={ddPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* X Axis */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-[#141a26]">
          {equityPoints.map((p, i) => (
            <span key={i}>{p.date}</span>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROLLING PERFORMANCE MULTI-SERIES */}
      {/* ========================================================================= */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Rolling Performance ({rollingWindow} Trades)</h3>
          </div>

          <select
            value={rollingWindow}
            onChange={(e) => setRollingWindow(e.target.value as any)}
            className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-[10px] text-slate-300 outline-none cursor-pointer"
          >
            <option value="50">50 Trades</option>
            <option value="100">100 Trades</option>
            <option value="250">250 Trades</option>
          </select>
        </div>

        {/* Rolling Multi-Series SVG */}
        <div className="relative h-44 w-full flex items-center justify-center">
          <svg viewBox={`0 0 ${rollW} ${rollH}`} className="w-full h-full">
            {/* Grid */}
            <line x1={padX} y1={padY} x2={rollW - padX} y2={padY} stroke="#141a26" strokeDasharray="3,3" />
            <line x1={padX} y1={rollH / 2} x2={rollW - padX} y2={rollH / 2} stroke="#141a26" strokeDasharray="3,3" />
            <line x1={padX} y1={rollH - padY} x2={rollW - padX} y2={rollH - padY} stroke="#161c28" />

            {/* Left Y Labels (Expectancy & Sharpe) */}
            <text x={padX - 4} y={padY + 4} fill="#64748b" fontSize="8" textAnchor="end">
              2.5
            </text>
            <text x={padX - 4} y={rollH / 2 + 3} fill="#64748b" fontSize="8" textAnchor="end">
              1.5
            </text>
            <text x={padX - 4} y={rollH - padY} fill="#64748b" fontSize="8" textAnchor="end">
              0.5
            </text>

            {/* Right Y Labels (Win Rate %) */}
            <text x={rollW - padX + 4} y={padY + 4} fill="#64748b" fontSize="8" textAnchor="start">
              75%
            </text>
            <text x={rollW - padX + 4} y={rollH / 2 + 3} fill="#64748b" fontSize="8" textAnchor="start">
              60%
            </text>
            <text x={rollW - padX + 4} y={rollH - padY} fill="#64748b" fontSize="8" textAnchor="start">
              50%
            </text>

            {/* Paths */}
            <path d={expPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <path d={sharpePath} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
            <path d={winRatePath} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#141a26]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-emerald-400"></span>
              <span className="text-emerald-400 font-bold">Expectancy (R)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-purple-400"></span>
              <span className="text-purple-400 font-bold">Sharpe Ratio</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-cyan-400"></span>
              <span className="text-cyan-400 font-bold">Win Rate</span>
            </span>
          </div>

          <div className="flex gap-2 font-mono text-[9px] text-slate-500">
            {activeRollSeries.map((p, i) => (
              <span key={i}>{p.date}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
