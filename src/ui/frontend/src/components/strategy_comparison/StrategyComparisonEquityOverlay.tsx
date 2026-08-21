import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StrategyComparisonEquityOverlayProps {
  equityCurves?: Record<string, number[]>;
}

export const StrategyComparisonEquityOverlay: React.FC<StrategyComparisonEquityOverlayProps> = ({
  equityCurves = {},
}) => {
  const colorMap: Record<string, string> = {
    'BB Reversion v4': '#10b981',
    'Order Block v4': '#06b6d4',
    'London Breakout v2': '#8b5cf6',
    'Liquidity Sweep v3': '#f59e0b',
  };

  const strats = Object.keys(equityCurves).length > 0 ? Object.keys(equityCurves) : ['BB Reversion v4', 'Order Block v4', 'London Breakout v2', 'Liquidity Sweep v3'];

  // Synthetic fallback paths if empty
  const defaultPaths: Record<string, number[]> = {
    'BB Reversion v4': Array.from({ length: 30 }, (_, i) => 10000 + i * 280 + Math.sin(i) * 150),
    'Order Block v4': Array.from({ length: 30 }, (_, i) => 10000 + i * 240 + Math.cos(i) * 120),
    'London Breakout v2': Array.from({ length: 30 }, (_, i) => 10000 + i * 190 + Math.sin(i * 0.8) * 110),
    'Liquidity Sweep v3': Array.from({ length: 30 }, (_, i) => 10000 + i * 210 + Math.cos(i * 0.5) * 140),
  };

  const curves = Object.keys(equityCurves).length > 0 ? equityCurves : defaultPaths;

  // Find min and max equity across all series
  let allVals: number[] = [];
  Object.values(curves).forEach((arr) => {
    allVals = allVals.concat(arr);
  });
  const minVal = Math.min(...allVals, 9500);
  const maxVal = Math.max(...allVals, 18000);

  const svgW = 560;
  const svgH = 220;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const scaleY = (val: number) => padTop + plotH - ((val - minVal) / Math.max(1, maxVal - minVal)) * plotH;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Normalized Cumulative Equity Overlay ($10,000 Base)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          {strats.map((s) => (
            <span key={s} className="flex items-center gap-1 font-bold" style={{ color: colorMap[s] || '#10b981' }}>
              ● {s}
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 0.5, 1.0].map((frac) => {
            const val = minVal + frac * (maxVal - minVal);
            const yPos = padTop + plotH - frac * plotH;
            return (
              <g key={`eq-gr-${frac}`}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={padLeft + plotW}
                  y2={yPos}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
                <text x={padLeft - 6} y={yPos + 3} fill="#64748b" fontSize="8" textAnchor="end">
                  ${Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Equity Paths */}
          {Object.entries(curves).map(([sName, arr]) => {
            if (!arr || arr.length === 0) return null;
            const strokeColor = colorMap[sName] || '#10b981';
            const pts = arr
              .map((v, i) => {
                const x = padLeft + (i / Math.max(1, arr.length - 1)) * plotW;
                const y = scaleY(v);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <polyline
                key={sName}
                points={pts}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Dynamic 30-Point Sampled Trajectories</span>
        <span className="text-emerald-400 font-bold">Compound Growth Linearity</span>
      </div>
    </div>
  );
};
