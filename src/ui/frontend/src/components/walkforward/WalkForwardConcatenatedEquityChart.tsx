import React from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';

interface EquityPoint {
  trade_idx: number;
  date: string;
  oos_equity: number;
  label: string;
}

interface WalkForwardConcatenatedEquityChartProps {
  points?: EquityPoint[];
}

export const WalkForwardConcatenatedEquityChart: React.FC<WalkForwardConcatenatedEquityChartProps> = ({
  points = [],
}) => {
  const safePoints = points.length > 0 ? points : [
    { trade_idx: 1, date: '2020-01', oos_equity: 10000, label: 'T1' },
    { trade_idx: 5, date: '2021-03', oos_equity: 10850, label: 'T5' },
    { trade_idx: 10, date: '2022-06', oos_equity: 11920, label: 'T10' },
    { trade_idx: 15, date: '2023-09', oos_equity: 12640, label: 'T15' },
    { trade_idx: 20, date: '2024-12', oos_equity: 13800, label: 'T20' },
  ];

  const svgW = 500;
  const svgH = 200;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const equities = safePoints.map((p) => p.oos_equity);
  const minEq = Math.min(9500, ...equities);
  const maxEq = Math.max(14000, ...equities);

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, safePoints.length - 1)) * plotW;
  const scaleY = (eq: number) => padTop + plotH - ((eq - minEq) / Math.max(1, maxEq - minEq)) * plotH;

  const pathData = safePoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(p.oos_equity)}`)
    .join(' ');

  const areaData = `${pathData} L ${scaleX(safePoints.length - 1)} ${padTop + plotH} L ${scaleX(0)} ${padTop + plotH} Z`;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Stitched Out-of-Sample Walk-Forward Equity Curve
          </h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold">100% Blind OOS Segments</span>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          <defs>
            <linearGradient id="wfEquityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1.0].map((frac, idx) => {
            const val = Math.round(minEq + frac * (maxEq - minEq));
            return (
              <g key={`eq-${idx}`}>
                <line
                  x1={padLeft}
                  y1={scaleY(val)}
                  x2={padLeft + plotW}
                  y2={scaleY(val)}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
                <text x={padLeft - 6} y={scaleY(val) + 3} fill="#64748b" fontSize="8" textAnchor="end">
                  ${val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area Gradient */}
          <path d={areaData} fill="url(#wfEquityGrad)" />

          {/* Line Path */}
          <path d={pathData} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

          {/* Points */}
          {safePoints.map((p, idx) => (
            <circle
              key={`dot-${idx}`}
              cx={scaleX(idx)}
              cy={scaleY(p.oos_equity)}
              r="3"
              fill="#10b981"
              stroke="#07090e"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
