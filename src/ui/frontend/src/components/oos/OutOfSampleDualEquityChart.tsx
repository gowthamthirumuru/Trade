import React from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';

interface EquityComparisonStep {
  step: number;
  label: string;
  is_equity: number;
  oos_equity: number;
}

interface OutOfSampleDualEquityChartProps {
  equityComparison?: EquityComparisonStep[];
}

export const OutOfSampleDualEquityChart: React.FC<OutOfSampleDualEquityChartProps> = ({
  equityComparison = [],
}) => {
  const safeData = equityComparison.length > 0 ? equityComparison : [
    { step: 1, label: 'P1', is_equity: 10000, oos_equity: 10000 },
    { step: 5, label: 'P5', is_equity: 11500, oos_equity: 11200 },
    { step: 10, label: 'P10', is_equity: 13200, oos_equity: 12600 },
    { step: 15, label: 'P15', is_equity: 15400, oos_equity: 14100 },
    { step: 20, label: 'P20', is_equity: 17800, oos_equity: 15900 },
    { step: 25, label: 'P25', is_equity: 19200, oos_equity: 17800 },
  ];

  const svgW = 560;
  const svgH = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const allEquities = safeData.flatMap((d) => [d.is_equity, d.oos_equity]);
  const minEq = Math.min(9500, ...allEquities);
  const maxEq = Math.max(20000, ...allEquities);

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, safeData.length - 1)) * plotW;
  const scaleY = (eq: number) => padTop + plotH - ((eq - minEq) / Math.max(1, maxEq - minEq)) * plotH;

  const isPathData = safeData
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(d.is_equity)}`)
    .join(' ');

  const oosPathData = safeData
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(d.oos_equity)}`)
    .join(' ');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">
            Normalized Equity Curve Comparison (In-Sample vs Blind OOS)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
            <span className="text-slate-400">In-Sample (Train)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-emerald-400 font-bold">Blind Out-of-Sample (OOS)</span>
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          <defs>
            <linearGradient id="isEquityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="oosEquityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1.0].map((frac, idx) => {
            const val = Math.round(minEq + frac * (maxEq - minEq));
            return (
              <g key={`eq-grid-${idx}`}>
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

          {/* In-Sample Path */}
          <path d={isPathData} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />

          {/* Out-of-Sample Path */}
          <path d={oosPathData} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

          {/* OOS Points */}
          {safeData.map((d, idx) => (
            <circle
              key={`dot-oos-${idx}`}
              cx={scaleX(idx)}
              cy={scaleY(d.oos_equity)}
              r="3"
              fill="#10b981"
              stroke="#07090e"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Starting Base Capital: $10,000.00</span>
        <span className="text-emerald-400 font-bold">Zero Lookahead / Blind Forward Evaluation</span>
      </div>
    </div>
  );
};
