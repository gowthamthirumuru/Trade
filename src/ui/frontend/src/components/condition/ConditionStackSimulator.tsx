import React from 'react';
import { Activity, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface CurvePoint {
  trade_num: number;
  baseline_r: number;
  stacked_r: number;
  label: string;
}

interface StackedStats {
  n_trades: number;
  win_rate_pct: number;
  expectancy_r: number;
  profit_factor: number;
  net_lift_pct: number;
}

interface ConditionStackSimulatorProps {
  curveData?: CurvePoint[];
  stats?: StackedStats;
  activeCount: number;
  isLoading: boolean;
}

export const ConditionStackSimulator: React.FC<ConditionStackSimulatorProps> = ({
  curveData = [
    { trade_num: 1, baseline_r: 0.5, stacked_r: 1.2, label: 'T1' },
    { trade_num: 2, baseline_r: 0.8, stacked_r: 2.5, label: 'T2' },
    { trade_num: 3, baseline_r: 1.1, stacked_r: 4.1, label: 'T3' },
    { trade_num: 4, baseline_r: 1.3, stacked_r: 5.8, label: 'T4' },
    { trade_num: 5, baseline_r: 1.6, stacked_r: 7.9, label: 'T5' },
    { trade_num: 6, baseline_r: 2.1, stacked_r: 10.4, label: 'T6' },
    { trade_num: 7, baseline_r: 2.5, stacked_r: 13.2, label: 'T7' },
    { trade_num: 8, baseline_r: 3.1, stacked_r: 16.5, label: 'T8' },
  ],
  stats = {
    n_trades: 284,
    win_rate_pct: 74.8,
    expectancy_r: 1.38,
    profit_factor: 2.94,
    net_lift_pct: 206.7,
  },
  activeCount,
  isLoading,
}) => {
  // SVG Dimensions
  const svgW = 600;
  const svgH = 220;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const allValues = [
    ...curveData.map((p) => p.stacked_r),
    ...curveData.map((p) => p.baseline_r),
  ];
  const minR = Math.min(...allValues, 0);
  const maxR = Math.max(...allValues, 10);

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, curveData.length - 1)) * plotW;
  const scaleY = (val: number) => padTop + plotH - ((val - minR) / Math.max(1, maxR - minR)) * plotH;

  const stackedPath = curveData
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(p.stacked_r)}`)
    .join(' ');

  const baselinePath = curveData
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(p.baseline_r)}`)
    .join(' ');

  const stackedArea = `${stackedPath} L ${scaleX(curveData.length - 1)} ${padTop + plotH} L ${padLeft} ${padTop + plotH} Z`;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Combinatorial Alpha Stacking Simulation ({activeCount} Active Filters)
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-500 rounded"></span>
            <span className="text-slate-400">Baseline Unconditioned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-emerald-400 rounded"></span>
            <span className="text-emerald-400 font-bold">Stacked Active Combo</span>
          </div>
        </div>
      </div>

      {/* SVG Multi-Curve Overlay */}
      <div className="relative h-56 w-full flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0b0e14]/70 z-10 flex items-center justify-center">
            <span className="text-cyan-300 font-bold animate-pulse text-xs">Simulating Combinations...</span>
          </div>
        )}

        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          <defs>
            <linearGradient id="stackedAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Grid lines */}
          {[0, 0.33, 0.66, 1.0].map((frac, idx) => {
            const val = Math.round(minR + frac * (maxR - minR));
            return (
              <g key={`sty-${idx}`}>
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
          {curveData.map((p, idx) => (
            <text
              key={`stx-${idx}`}
              x={scaleX(idx)}
              y={padTop + plotH + 14}
              fill="#64748b"
              fontSize="8"
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}

          {/* Stacked Area & Lines */}
          <path d={stackedArea} fill="url(#stackedAreaGrad)" />
          <path d={baselinePath} fill="none" stroke="#64748b" strokeWidth="1.8" strokeDasharray="3,3" />
          <path d={stackedPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Stacked Dots */}
          {curveData.map((p, idx) => (
            <circle
              key={`stdot-${idx}`}
              cx={scaleX(idx)}
              cy={scaleY(p.stacked_r)}
              r="2.5"
              fill="#10b981"
              stroke="#07090e"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* Stacked Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#141a26] text-[11px]">
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#161c28]">
          <span className="text-[9px] text-slate-400 block">Stacked Sample</span>
          <span className="text-white font-bold">{stats.n_trades} Trades</span>
        </div>
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#161c28]">
          <span className="text-[9px] text-slate-400 block">Stacked Win Rate</span>
          <span className="text-cyan-300 font-bold">{stats.win_rate_pct}%</span>
        </div>
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#161c28]">
          <span className="text-[9px] text-slate-400 block">Expectancy</span>
          <span className="text-emerald-400 font-extrabold">+{stats.expectancy_r}R / Trade</span>
        </div>
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#161c28]">
          <span className="text-[9px] text-slate-400 block">Net Alpha Lift</span>
          <span className="text-amber-400 font-extrabold">+{stats.net_lift_pct}%</span>
        </div>
      </div>
    </div>
  );
};
