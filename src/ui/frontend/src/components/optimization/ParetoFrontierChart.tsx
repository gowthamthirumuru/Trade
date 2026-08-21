import React, { useState } from 'react';
import { Info, ArrowRight } from 'lucide-react';

export interface ParetoCandidate {
  name: string;
  sharpe: number;
  max_dd: number;
  expectancy_r: number;
  pf: number;
  optimal: boolean;
  selected?: boolean;
}

interface ParetoFrontierChartProps {
  candidates?: ParetoCandidate[];
  onSelectCandidate?: (candidate: ParetoCandidate) => void;
}

export const ParetoFrontierChart: React.FC<ParetoFrontierChartProps> = ({
  candidates = [
    { name: 'BB(20, 1.80σ)', sharpe: 2.18, max_dd: 8.4, expectancy_r: 0.91, pf: 2.18, optimal: true, selected: true },
    { name: 'BB(20, 2.00σ)', sharpe: 2.07, max_dd: 8.7, expectancy_r: 0.84, pf: 2.05, optimal: true, selected: false },
    { name: 'BB(22, 2.10σ)', sharpe: 2.01, max_dd: 8.9, expectancy_r: 0.82, pf: 2.02, optimal: true, selected: false },
    { name: 'BB(20, 1.90σ)', sharpe: 1.95, max_dd: 9.2, expectancy_r: 0.79, pf: 1.98, optimal: true, selected: false },
    { name: 'BB(16, 2.10σ)', sharpe: 1.92, max_dd: 9.5, expectancy_r: 0.76, pf: 1.94, optimal: true, selected: false },
    { name: 'BB(18, 1.70σ)', sharpe: 1.84, max_dd: 10.1, expectancy_r: 0.72, pf: 1.88, optimal: true, selected: false },
    { name: 'BB(24, 2.20σ)', sharpe: 1.76, max_dd: 10.8, expectancy_r: 0.69, pf: 1.82, optimal: true, selected: false },
    { name: 'BB(26, 2.30σ)', sharpe: 1.64, max_dd: 11.5, expectancy_r: 0.65, pf: 1.75, optimal: true, selected: false },
    { name: 'BB(28, 2.40σ)', sharpe: 1.48, max_dd: 12.6, expectancy_r: 0.58, pf: 1.62, optimal: false, selected: false },
    { name: 'BB(30, 2.50σ)', sharpe: 1.32, max_dd: 13.9, expectancy_r: 0.49, pf: 1.51, optimal: false, selected: false },
    { name: 'BB(12, 1.40σ)', sharpe: 1.15, max_dd: 15.2, expectancy_r: 0.38, pf: 1.38, optimal: false, selected: false },
    { name: 'BB(10, 1.20σ)', sharpe: 0.94, max_dd: 16.4, expectancy_r: 0.25, pf: 1.22, optimal: false, selected: false },
  ],
  onSelectCandidate,
}) => {
  const [filterMode, setFilterMode] = useState<'Non-Dominated' | 'All Explored'>('Non-Dominated');
  const [hoveredCandidate, setHoveredCandidate] = useState<ParetoCandidate | null>(null);

  const displayedList = filterMode === 'Non-Dominated' ? candidates.filter((c) => c.optimal) : candidates;

  // SVG dimensions
  const svgW = 320;
  const svgH = 200;
  const padLeft = 32;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 30;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const minDd = 0.0;
  const maxDd = 16.0;
  const minSharpe = 0.0;
  const maxSharpe = 2.5;

  const scaleX = (dd: number) => padLeft + (dd / maxDd) * plotW;
  const scaleY = (sr: number) => padTop + plotH - (sr / maxSharpe) * plotH;

  const getColor = (sr: number, dd: number) => {
    if (sr >= 2.10 && dd <= 8.5) return '#10b981'; // Green (Optimal)
    if (sr >= 1.90) return '#06b6d4'; // Cyan
    if (sr >= 1.70) return '#eab308'; // Yellow
    if (sr >= 1.40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Header & Filter */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-white text-xs">Pareto Frontier (Multi-Objective)</h3>
          <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
        </div>

        <div className="flex items-center gap-1 text-[10px]">
          <span className="text-slate-400">Show:</span>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-cyan-300 font-bold outline-none"
          >
            <option value="Non-Dominated">Non-Dominated</option>
            <option value="All Explored">All Explored</option>
          </select>
        </div>
      </div>

      {/* SVG Scatter Plot */}
      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Y Grid lines */}
          {[0, 0.5, 1.0, 1.5, 2.0, 2.5].map((s) => (
            <g key={`pareto-y-${s}`}>
              <line
                x1={padLeft}
                y1={scaleY(s)}
                x2={padLeft + plotW}
                y2={scaleY(s)}
                stroke="#141a26"
                strokeDasharray="2,3"
              />
              <text x={padLeft - 5} y={scaleY(s) + 3} fill="#64748b" fontSize="7" textAnchor="end">
                {s.toFixed(1)}
              </text>
            </g>
          ))}

          {/* X Grid lines */}
          {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((dd) => (
            <g key={`pareto-x-${dd}`}>
              <line
                x1={scaleX(dd)}
                y1={padTop}
                x2={scaleX(dd)}
                y2={padTop + plotH}
                stroke="#141a26"
                strokeDasharray="2,3"
              />
              <text x={scaleX(dd)} y={padTop + plotH + 10} fill="#64748b" fontSize="7" textAnchor="middle">
                {dd}
              </text>
            </g>
          ))}

          {/* Scatter Points */}
          {displayedList.map((c, idx) => {
            const isTop = c.selected || idx === 0;
            const ptColor = getColor(c.sharpe, c.max_dd);
            return (
              <g key={`pareto-dot-${idx}`}>
                {isTop && (
                  <circle
                    cx={scaleX(c.max_dd)}
                    cy={scaleY(c.sharpe)}
                    r="8"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={scaleX(c.max_dd)}
                  cy={scaleY(c.sharpe)}
                  r={isTop ? 4.5 : 3.5}
                  fill={ptColor}
                  stroke="#07090e"
                  strokeWidth="1"
                  className="cursor-pointer transition hover:scale-150"
                  onMouseEnter={() => setHoveredCandidate(c)}
                  onMouseLeave={() => setHoveredCandidate(null)}
                  onClick={() => onSelectCandidate && onSelectCandidate(c)}
                />
              </g>
            );
          })}

          {/* Axis Labels */}
          <text
            x={10}
            y={padTop + plotH / 2}
            fill="#94a3b8"
            fontSize="7"
            textAnchor="middle"
            fontWeight="bold"
            transform={`rotate(-90 10 ${padTop + plotH / 2})`}
          >
            Sharpe Ratio
          </text>

          <text
            x={padLeft + plotW / 2}
            y={padTop + plotH + 20}
            fill="#94a3b8"
            fontSize="7"
            textAnchor="middle"
            fontWeight="bold"
          >
            Max Drawdown (%)
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredCandidate && (
          <div className="absolute top-2 right-4 bg-black/90 border border-slate-700 p-2 rounded text-[9px] text-white shadow-xl pointer-events-none z-20">
            <div className="font-bold text-cyan-300">{hoveredCandidate.name}</div>
            <div className="flex justify-between gap-3 text-slate-400">
              <span>Sharpe:</span> <span className="text-emerald-400 font-bold">{hoveredCandidate.sharpe}</span>
            </div>
            <div className="flex justify-between gap-3 text-slate-400">
              <span>Max DD:</span> <span className="text-rose-400 font-bold">{hoveredCandidate.max_dd}%</span>
            </div>
            <div className="flex justify-between gap-3 text-slate-400">
              <span>Expectancy:</span>{' '}
              <span className="text-white font-bold">+{hoveredCandidate.expectancy_r}R</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Gradient Axis Direction Bar */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-[#141a26]">
        <span className="text-emerald-400 font-bold">Less Drawdown</span>
        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" />
        <span className="text-rose-400 font-bold">More Drawdown</span>
      </div>
    </div>
  );
};
