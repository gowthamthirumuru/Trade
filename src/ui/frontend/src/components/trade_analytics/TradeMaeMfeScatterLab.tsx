import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

export interface MaeMfePoint {
  trade_id: number;
  mae_pct: number;
  mfe_pct: number;
  pnl_r: number;
  result: string;
}

interface TradeMaeMfeScatterLabProps {
  points?: MaeMfePoint[];
}

export const TradeMaeMfeScatterLab: React.FC<TradeMaeMfeScatterLabProps> = ({ points = [] }) => {
  const safePoints = points.length > 0 ? points : [
    { trade_id: 101, mae_pct: 0.42, mfe_pct: 2.85, pnl_r: 2.4, result: 'WIN' },
    { trade_id: 102, mae_pct: 1.1, mfe_pct: 0.35, pnl_r: -1.0, result: 'LOSS' },
    { trade_id: 103, mae_pct: 0.28, mfe_pct: 3.4, pnl_r: 3.0, result: 'WIN' },
    { trade_id: 104, mae_pct: 0.65, mfe_pct: 1.95, pnl_r: 1.8, result: 'WIN' },
    { trade_id: 105, mae_pct: 1.05, mfe_pct: 0.15, pnl_r: -1.0, result: 'LOSS' },
    { trade_id: 106, mae_pct: 0.35, mfe_pct: 2.2, pnl_r: 2.0, result: 'WIN' },
    { trade_id: 107, mae_pct: 0.5, mfe_pct: 3.1, pnl_r: 2.9, result: 'WIN' },
    { trade_id: 108, mae_pct: 0.95, mfe_pct: 0.4, pnl_r: -1.0, result: 'LOSS' },
  ];

  const svgW = 560;
  const svgH = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const maxMAE = 2.0;
  const maxMFE = 4.0;

  const scaleX = (mae: number) => padLeft + (Math.min(maxMAE, Math.abs(mae)) / maxMAE) * plotW;
  const scaleY = (mfe: number) => padTop + plotH - (Math.min(maxMFE, mfe) / maxMFE) * plotH;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            MAE vs MFE Excursion Efficiency Lab
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-emerald-400 font-bold">● Winner (High MFE)</span>
          <span className="text-rose-400 font-bold">● Stopped (High MAE)</span>
        </div>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          {[1.0, 2.0, 3.0, 4.0].map((val) => (
            <g key={`mfe-gr-${val}`}>
              <line
                x1={padLeft}
                y1={scaleY(val)}
                x2={padLeft + plotW}
                y2={scaleY(val)}
                stroke="#141a26"
                strokeDasharray="2,3"
              />
              <text x={padLeft - 6} y={scaleY(val) + 3} fill="#64748b" fontSize="8" textAnchor="end">
                +{val}%
              </text>
            </g>
          ))}

          {/* Scatter Points */}
          {safePoints.map((pt) => {
            const isWin = pt.result === 'WIN';
            return (
              <circle
                key={pt.trade_id}
                cx={scaleX(pt.mae_pct)}
                cy={scaleY(pt.mfe_pct)}
                r="4"
                fill={isWin ? '#10b981' : '#f43f5e'}
                opacity={0.8}
                stroke="#07090e"
                strokeWidth="1.5"
              />
            );
          })}

          {/* X Axis Labels */}
          {[0.5, 1.0, 1.5, 2.0].map((maeVal) => (
            <text
              key={`mae-lbl-${maeVal}`}
              x={scaleX(maeVal)}
              y={padTop + plotH + 15}
              fill="#94a3b8"
              fontSize="8"
              textAnchor="middle"
            >
              -{maeVal}%
            </text>
          ))}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>X-Axis: Adverse Drawdown (MAE) | Y-Axis: Peak Excursion (MFE)</span>
        <span className="text-emerald-400 font-bold">Optimal Stop Placement</span>
      </div>
    </div>
  );
};
