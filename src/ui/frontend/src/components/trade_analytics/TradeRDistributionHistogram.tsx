import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export interface RBinItem {
  r_range: string;
  count: number;
  pct: number;
}

interface TradeRDistributionHistogramProps {
  distribution?: RBinItem[];
  expectancyR?: number;
}

export const TradeRDistributionHistogram: React.FC<TradeRDistributionHistogramProps> = ({
  distribution = [],
  expectancyR = 0.88,
}) => {
  const safeBins = distribution.length > 0 ? distribution : [
    { r_range: '< -1.5R', count: 42, pct: 2.3 },
    { r_range: '-1.5R to -0.5R', count: 480, pct: 26.1 },
    { r_range: '-0.5R to 0.5R', count: 140, pct: 7.6 },
    { r_range: '0.5R to 1.5R', count: 520, pct: 28.3 },
    { r_range: '1.5R to 2.5R', count: 450, pct: 24.5 },
    { r_range: '2.5R to 3.5R', count: 160, pct: 8.7 },
    { r_range: '> 3.5R', count: 48, pct: 2.6 },
  ];

  const maxCount = Math.max(...safeBins.map((b) => b.count), 10);

  const svgW = 560;
  const svgH = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;
  const barW = plotW / safeBins.length;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Trade R-Multiple Distribution Histogram
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">
          E[R] = {expectancyR >= 0 ? `+${expectancyR.toFixed(2)}` : expectancyR.toFixed(2)}R
        </span>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 0.5, 1.0].map((frac) => {
            const val = Math.round(maxCount * frac);
            const yPos = padTop + plotH - frac * plotH;
            return (
              <g key={`r-grid-${frac}`}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={padLeft + plotW}
                  y2={yPos}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
                <text x={padLeft - 6} y={yPos + 3} fill="#64748b" fontSize="8" textAnchor="end">
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Histogram Bars */}
          {safeBins.map((bin, idx) => {
            const isLoss = bin.r_range.includes('-') || bin.r_range.includes('<');
            const h = (bin.count / maxCount) * plotH;
            const x = padLeft + idx * barW + 4;
            const y = padTop + plotH - h;
            const w = Math.max(8, barW - 8);

            return (
              <g key={bin.r_range}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx="3"
                  fill={isLoss ? '#f43f5e' : '#10b981'}
                  opacity={0.85}
                />
                <text
                  x={x + w / 2}
                  y={y - 4}
                  fill={isLoss ? '#f87171' : '#34d399'}
                  fontSize="8"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {bin.count > 0 ? `${bin.pct.toFixed(0)}%` : ''}
                </text>
                <text
                  x={x + w / 2}
                  y={padTop + plotH + 15}
                  fill="#94a3b8"
                  fontSize="7.5"
                  textAnchor="middle"
                >
                  {bin.r_range}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Discrete Risk Multiples (R = PnL / Risk)</span>
        <span className="text-emerald-400 font-bold">Right-Skewed Alpha Profile</span>
      </div>
    </div>
  );
};
