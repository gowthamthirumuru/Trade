import React from 'react';
import { Percent, TrendingDown } from 'lucide-react';

export interface UnderwaterPoint {
  timestamp: string;
  drawdown_pct: number;
}

interface PerformanceUnderwaterChartProps {
  underwaterCurve?: UnderwaterPoint[];
  maxDrawdownPct?: number;
}

export const PerformanceUnderwaterChart: React.FC<PerformanceUnderwaterChartProps> = ({
  underwaterCurve = [],
  maxDrawdownPct = 8.4,
}) => {
  const safeData = underwaterCurve.length > 0 ? underwaterCurve : [
    { timestamp: 'T-100', drawdown_pct: 0.0 },
    { timestamp: 'T-80', drawdown_pct: -2.1 },
    { timestamp: 'T-60', drawdown_pct: -5.4 },
    { timestamp: 'T-40', drawdown_pct: -8.4 },
    { timestamp: 'T-20', drawdown_pct: -3.2 },
    { timestamp: 'T-0', drawdown_pct: -0.8 },
  ];

  const svgW = 560;
  const svgH = 200;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const ddVals = safeData.map((d) => d.drawdown_pct);
  const minDD = Math.min(-10.0, Math.floor(Math.min(...ddVals) * 1.2));

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, safeData.length - 1)) * plotW;
  const scaleY = (dd: number) => padTop + (Math.abs(dd) / Math.abs(minDD)) * plotH;

  const pathData = safeData
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(d.drawdown_pct)}`)
    .join(' ');

  const areaData = `${pathData} L ${scaleX(safeData.length - 1)} ${padTop} L ${scaleX(0)} ${padTop} Z`;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-rose-400" />
          <h3 className="font-bold text-white text-xs">
            Underwater Drawdown Profile (%)
          </h3>
        </div>
        <span className="text-[10px] text-rose-400 font-bold">
          Max DD: -{maxDrawdownPct.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          <defs>
            <linearGradient id="underwaterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Zero Level Baseline */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft + plotW}
            y2={padTop}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Grid lines */}
          {[-5, -10, -15, -20].map((val) => {
            if (val < minDD) return null;
            return (
              <g key={`dd-gr-${val}`}>
                <line
                  x1={padLeft}
                  y1={scaleY(val)}
                  x2={padLeft + plotW}
                  y2={scaleY(val)}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
                <text x={padLeft - 6} y={scaleY(val) + 3} fill="#64748b" fontSize="8" textAnchor="end">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Drawdown Area */}
          <path d={areaData} fill="url(#underwaterGrad)" />

          {/* Drawdown Line */}
          <path d={pathData} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Continuous Peak-to-Trough Recovery</span>
        <span className="text-emerald-400 font-bold">Fast Recovery Factor</span>
      </div>
    </div>
  );
};
