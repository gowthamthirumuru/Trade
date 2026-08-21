import React, { useState } from 'react';

interface ProgressPoint {
  iteration: number;
  best_score: number;
  rolling_mean: number;
}

interface OptimizationProgressChartProps {
  progressCurve?: ProgressPoint[];
  convergencePct?: number;
  parametersExplored?: number;
  neighborhoodsFound?: number;
}

export const OptimizationProgressChart: React.FC<OptimizationProgressChartProps> = ({
  progressCurve = [],
  convergencePct = 98.2,
  parametersExplored = 150,
  neighborhoodsFound = 12,
}) => {
  const [activeView, setActiveView] = useState<'Best Score' | 'Convergence'>('Best Score');

  // Fallback points if empty
  const defaultCurve: ProgressPoint[] = [
    { iteration: 1, best_score: 0.65, rolling_mean: 0.52 },
    { iteration: 15, best_score: 0.95, rolling_mean: 0.72 },
    { iteration: 30, best_score: 1.34, rolling_mean: 1.05 },
    { iteration: 50, best_score: 1.62, rolling_mean: 1.38 },
    { iteration: 75, best_score: 1.88, rolling_mean: 1.65 },
    { iteration: 100, best_score: 2.01, rolling_mean: 1.82 },
    { iteration: 125, best_score: 2.12, rolling_mean: 1.96 },
    { iteration: 150, best_score: 2.18, rolling_mean: 2.04 },
  ];

  const curve = progressCurve.length > 0 ? progressCurve : defaultCurve;

  // SVG dimensions
  const svgW = 320;
  const svgH = 180;
  const padLeft = 32;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const maxIter = 150;
  const minScore = 0.0;
  const maxScore = 2.5;

  const scaleX = (it: number) => padLeft + (it / maxIter) * plotW;
  const scaleY = (score: number) => padTop + plotH - ((score - minScore) / (maxScore - minScore)) * plotH;

  const bestScorePath = curve
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.iteration)} ${scaleY(p.best_score)}`)
    .join(' ');

  const rollingMeanPath = curve
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(p.iteration)} ${scaleY(p.rolling_mean)}`)
    .join(' ');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Header & View Switcher */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <h3 className="font-bold text-white text-xs">Optimization Progress</h3>
        <div className="flex items-center gap-1 bg-[#07090e] border border-[#1a2232] rounded p-0.5 text-[9px]">
          <button
            onClick={() => setActiveView('Best Score')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              activeView === 'Best Score' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Best Score
          </button>
          <button
            onClick={() => setActiveView('Convergence')}
            className={`px-2 py-0.5 rounded font-bold transition ${
              activeView === 'Convergence' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Convergence
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 0.5, 1.0, 1.5, 2.0, 2.5].map((s) => (
            <g key={`ygrid-${s}`}>
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

          {[0, 25, 50, 75, 100, 125, 150].map((it) => (
            <g key={`xgrid-${it}`}>
              <line
                x1={scaleX(it)}
                y1={padTop}
                x2={scaleX(it)}
                y2={padTop + plotH}
                stroke="#141a26"
                strokeDasharray="2,3"
              />
              <text x={scaleX(it)} y={padTop + plotH + 12} fill="#64748b" fontSize="7" textAnchor="middle">
                {it}
              </text>
            </g>
          ))}

          {/* Lines */}
          <path d={rollingMeanPath} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,3" />
          <path d={bestScorePath} fill="none" stroke="#a855f7" strokeWidth="2.2" strokeLinecap="round" />

          {/* Dots on Best Score */}
          {curve.map((p, idx) => (
            <circle
              key={`dot-${idx}`}
              cx={scaleX(p.iteration)}
              cy={scaleY(p.best_score)}
              r="2.5"
              fill="#a855f7"
              stroke="#07090e"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-[#141a26]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-purple-500"></span>
            <span className="text-purple-300 font-bold">Best Score</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 border-b border-dashed"></span>
            <span className="text-cyan-300">Rolling Mean (10)</span>
          </span>
        </div>
      </div>

      {/* 4 Bottom Stats */}
      <div className="grid grid-cols-4 gap-1 text-center text-[9px] pt-1.5 border-t border-[#141a26]">
        <div>
          <span className="text-slate-500 block">Early Stopping</span>
          <span className="text-slate-300 font-bold">Disabled</span>
        </div>
        <div>
          <span className="text-slate-500 block">Convergence</span>
          <span className="text-emerald-400 font-extrabold">{convergencePct}%</span>
        </div>
        <div>
          <span className="text-slate-500 block">Explored</span>
          <span className="text-cyan-300 font-bold">{parametersExplored}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Neighborhoods</span>
          <span className="text-white font-bold">{neighborhoodsFound}</span>
        </div>
      </div>
    </div>
  );
};
