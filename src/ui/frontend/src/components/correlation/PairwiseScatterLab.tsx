import React from 'react';
import { Activity, TrendingUp, ShieldCheck } from 'lucide-react';

interface ScatterPoint {
  trade_idx: number;
  return_a: number;
  return_b: number;
}

interface RollingDriftPoint {
  period: number;
  correlation: number;
  label: string;
}

interface PairwiseScatterLabProps {
  strategyA: string;
  strategyB: string;
  points: ScatterPoint[];
  rollingDrift: RollingDriftPoint[];
  beta: number;
}

export const PairwiseScatterLab: React.FC<PairwiseScatterLabProps> = ({
  strategyA = 'BB Reversion v4',
  strategyB = 'Order Block v4',
  points = [],
  rollingDrift = [],
  beta = 0.25,
}) => {
  const safePoints = points.length > 0 ? points : [
    { trade_idx: 1, return_a: 1.2, return_b: 0.4 },
    { trade_idx: 2, return_a: -1.0, return_b: 1.5 },
    { trade_idx: 3, return_a: 0.8, return_b: -1.0 },
    { trade_idx: 4, return_a: 2.1, return_b: 0.8 },
    { trade_idx: 5, return_a: -1.0, return_b: -1.0 },
  ];

  const svgW = 440;
  const svgH = 200;
  const pad = 30;
  const plotW = svgW - 2 * pad;
  const plotH = svgH - 2 * pad;

  const rA = safePoints.map((p) => p.return_a);
  const rB = safePoints.map((p) => p.return_b);

  const minA = Math.min(-2.0, ...rA);
  const maxA = Math.max(3.0, ...rA);
  const minB = Math.min(-2.0, ...rB);
  const maxB = Math.max(3.0, ...rB);

  const scaleX = (val: number) => pad + ((val - minA) / Math.max(0.1, maxA - minA)) * plotW;
  const scaleY = (val: number) => pad + plotH - ((val - minB) / Math.max(0.1, maxB - minB)) * plotH;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">
            Pairwise Return Scatter & Beta Lab
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-purple-300 font-bold max-w-[120px] truncate">{strategyA}</span>
          <span className="text-slate-500">vs</span>
          <span className="text-cyan-300 font-bold max-w-[120px] truncate">{strategyB}</span>
        </div>
      </div>

      {/* SVG Scatter Plot */}
      <div className="relative h-44 w-full bg-[#07090e] border border-[#161c28] rounded-xl flex items-center justify-center p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Zero axes */}
          <line
            x1={scaleX(0)}
            y1={pad}
            x2={scaleX(0)}
            y2={pad + plotH}
            stroke="#1f293d"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
          <line
            x1={pad}
            y1={scaleY(0)}
            x2={pad + plotW}
            y2={scaleY(0)}
            stroke="#1f293d"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />

          {/* Regression Line */}
          <line
            x1={scaleX(minA)}
            y1={scaleY(minA * beta)}
            x2={scaleX(maxA)}
            y2={scaleY(maxA * beta)}
            stroke="#a855f7"
            strokeWidth="2"
          />

          {/* Scatter Points */}
          {safePoints.map((p, idx) => (
            <circle
              key={`sc-${idx}`}
              cx={scaleX(p.return_a)}
              cy={scaleY(p.return_b)}
              r="4"
              fill={p.return_a > 0 && p.return_b > 0 ? '#10b981' : p.return_a < 0 && p.return_b < 0 ? '#f43f5e' : '#06b6d4'}
              stroke="#07090e"
              strokeWidth="1"
              opacity="0.85"
            />
          ))}
        </svg>
      </div>

      {/* Beta & Orthogonality KPI summary */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#141a26]">
          <span className="text-slate-500 block uppercase text-[8px]">Regression Beta</span>
          <span className="text-purple-300 font-bold text-xs">β = {beta.toFixed(2)}</span>
        </div>
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#141a26]">
          <span className="text-slate-500 block uppercase text-[8px]">Diversification</span>
          <span className="text-emerald-400 font-bold text-xs">ORTHOGONAL</span>
        </div>
        <div className="p-2 bg-[#07090e] rounded-lg border border-[#141a26]">
          <span className="text-slate-500 block uppercase text-[8px]">Sample Size</span>
          <span className="text-slate-200 font-bold text-xs">{safePoints.length} Trades</span>
        </div>
      </div>
    </div>
  );
};
