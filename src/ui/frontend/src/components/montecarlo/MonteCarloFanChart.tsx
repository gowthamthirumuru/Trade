import React from 'react';
import { Activity, Sparkles } from 'lucide-react';

interface FanChartData {
  x_axis: string[];
  p05: number[];
  p25: number[];
  p50_median: number[];
  p75: number[];
  p95: number[];
}

interface MonteCarloFanChartProps {
  fanChart?: FanChartData;
  iterations?: number;
}

export const MonteCarloFanChart: React.FC<MonteCarloFanChartProps> = ({
  fanChart,
  iterations = 5000,
}) => {
  const safeFan = fanChart || {
    x_axis: Array.from({ length: 25 }, (_, i) => `T${i * 40}`),
    p05: Array.from({ length: 25 }, (_, i) => 10000 + i * 80),
    p25: Array.from({ length: 25 }, (_, i) => 10000 + i * 130),
    p50_median: Array.from({ length: 25 }, (_, i) => 10000 + i * 180),
    p75: Array.from({ length: 25 }, (_, i) => 10000 + i * 230),
    p95: Array.from({ length: 25 }, (_, i) => 10000 + i * 290),
  };

  const svgW = 560;
  const svgH = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const allVals = [
    ...(safeFan.p05 || []),
    ...(safeFan.p25 || []),
    ...(safeFan.p50_median || []),
    ...(safeFan.p75 || []),
    ...(safeFan.p95 || []),
  ];
  const minVal = Math.min(8000, ...allVals);
  const maxVal = Math.max(14000, ...allVals);

  const nSteps = Math.max(1, (safeFan.p50_median || []).length);
  const scaleX = (idx: number) => padLeft + (idx / (nSteps - 1 || 1)) * plotW;
  const scaleY = (val: number) => padTop + plotH - ((val - minVal) / Math.max(1, maxVal - minVal)) * plotH;

  const makePath = (arr: number[]) =>
    arr.map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(v)}`).join(' ');

  const makeBand = (upper: number[], lower: number[]) => {
    const topPath = upper.map((v, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(v)}`).join(' ');
    const botPath = lower
      .slice()
      .reverse()
      .map((v, idx) => `L ${scaleX(lower.length - 1 - idx)} ${scaleY(v)}`)
      .join(' ');
    return `${topPath} ${botPath} Z`;
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Multi-Path Resampled Equity Fan Chart ({iterations.toLocaleString()} Iterations)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">95th %ile</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span className="text-slate-400">75th %ile</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="text-purple-300 font-bold">Median (50th)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-400">25th %ile</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-slate-400">5th %ile</span>
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 0.5, 1.0].map((frac, idx) => {
            const val = Math.round(minVal + frac * (maxVal - minVal));
            return (
              <g key={`grid-${idx}`}>
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

          {/* Outer Quantile Band (5th to 95th) */}
          <path d={makeBand(safeFan.p95, safeFan.p05)} fill="#06b6d4" opacity="0.08" />

          {/* Inner Quantile Band (25th to 75th) */}
          <path d={makeBand(safeFan.p75, safeFan.p25)} fill="#a855f7" opacity="0.15" />

          {/* 95th Percentile Line */}
          <path d={makePath(safeFan.p95)} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />

          {/* 75th Percentile Line */}
          <path d={makePath(safeFan.p75)} fill="none" stroke="#06b6d4" strokeWidth="1.5" />

          {/* Median 50th Percentile Line */}
          <path d={makePath(safeFan.p50_median)} fill="none" stroke="#a855f7" strokeWidth="2.5" />

          {/* 25th Percentile Line */}
          <path d={makePath(safeFan.p25)} fill="none" stroke="#f59e0b" strokeWidth="1.5" />

          {/* 5th Percentile Line */}
          <path d={makePath(safeFan.p05)} fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Resampled Path Depth: {iterations.toLocaleString()} Trajectories</span>
        <span className="text-cyan-400 font-bold">Stationary Bootstrap Resampling</span>
      </div>
    </div>
  );
};
