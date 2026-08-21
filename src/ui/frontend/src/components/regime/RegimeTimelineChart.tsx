import React from 'react';
import { History, TrendingUp, Activity } from 'lucide-react';

interface TimelinePoint {
  bar_num: number;
  time: string;
  regime_id: number;
  regime_label: string;
  close: number;
}

interface RegimeTimelineChartProps {
  timeline: TimelinePoint[];
}

export const RegimeTimelineChart: React.FC<RegimeTimelineChartProps> = ({ timeline }) => {
  const data = timeline.length > 0 ? timeline : [
    { bar_num: 1, time: '2025-01-01', regime_id: 0, regime_label: 'Bull High', close: 2620 },
    { bar_num: 2, time: '2025-01-05', regime_id: 0, regime_label: 'Bull High', close: 2640 },
    { bar_num: 3, time: '2025-01-10', regime_id: 1, regime_label: 'Bull Low', close: 2655 },
    { bar_num: 4, time: '2025-01-15', regime_id: 4, regime_label: 'Range', close: 2650 },
    { bar_num: 5, time: '2025-01-20', regime_id: 2, regime_label: 'Bear High', close: 2610 },
  ];

  const svgW = 600;
  const svgH = 180;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const prices = data.map((p) => p.close);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, data.length - 1)) * plotW;
  const scaleY = (p: number) => padTop + plotH - ((p - minP) / Math.max(1, maxP - minP)) * plotH;

  const getRegimeColor = (id: number) => {
    switch (id) {
      case 0:
        return '#10b981'; // Bull High
      case 1:
        return '#06b6d4'; // Bull Low
      case 2:
        return '#a855f7'; // Bear High
      case 3:
        return '#f43f5e'; // Bear Low
      default:
        return '#64748b'; // Range
    }
  };

  const pathData = data
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(p.close)}`)
    .join(' ');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">Historical Market Regime Progression Timeline</h3>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400">Bull High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span className="text-slate-400">Bull Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-slate-400">Bear High</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-slate-400">Bear Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className="text-slate-400">Range</span>
          </div>
        </div>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Y Grid lines */}
          {[0, 0.5, 1.0].map((frac, idx) => {
            const val = Math.round(minP + frac * (maxP - minP));
            return (
              <g key={`tly-${idx}`}>
                <line
                  x1={padLeft}
                  y1={scaleY(val)}
                  x2={padLeft + plotW}
                  y2={scaleY(val)}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
                <text x={padLeft - 6} y={scaleY(val) + 3} fill="#64748b" fontSize="8" textAnchor="end">
                  ${val}
                </text>
              </g>
            );
          })}

          {/* Background Path */}
          <path d={pathData} fill="none" stroke="#1f293d" strokeWidth="1.5" />

          {/* Dots colored by regime */}
          {data.map((p, idx) => (
            <circle
              key={`dot-${idx}`}
              cx={scaleX(idx)}
              cy={scaleY(p.close)}
              r="3.5"
              fill={getRegimeColor(p.regime_id)}
              stroke="#07090e"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
