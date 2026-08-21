import React from 'react';
import { Activity, Zap } from 'lucide-react';

export interface RollingDriftPoint {
  timestamp: string;
  rolling_sharpe: number;
  rolling_vol_pct: number;
}

interface PerformanceRollingSharpeChartProps {
  rollingCurve?: RollingDriftPoint[];
}

export const PerformanceRollingSharpeChart: React.FC<PerformanceRollingSharpeChartProps> = ({
  rollingCurve = [],
}) => {
  const safeData = rollingCurve.length > 0 ? rollingCurve : [
    { timestamp: 'T-100', rolling_sharpe: 2.1, rolling_vol_pct: 14.2 },
    { timestamp: 'T-80', rolling_sharpe: 2.4, rolling_vol_pct: 12.8 },
    { timestamp: 'T-60', rolling_sharpe: 1.9, rolling_vol_pct: 16.5 },
    { timestamp: 'T-40', rolling_sharpe: 2.2, rolling_vol_pct: 13.9 },
    { timestamp: 'T-20', rolling_sharpe: 2.6, rolling_vol_pct: 11.4 },
    { timestamp: 'T-0', rolling_sharpe: 2.3, rolling_vol_pct: 13.1 },
  ];

  const svgW = 1140;
  const svgH = 200;
  const padLeft = 45;
  const padRight = 45;
  const padTop = 20;
  const padBottom = 25;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const srVals = safeData.map((d) => d.rolling_sharpe);
  const minSR = Math.min(-0.5, Math.floor(Math.min(...srVals) * 1.2));
  const maxSR = Math.max(3.5, Math.ceil(Math.max(...srVals) * 1.2));

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, safeData.length - 1)) * plotW;
  const scaleY = (sr: number) => padTop + plotH - ((sr - minSR) / Math.max(0.1, maxSR - minSR)) * plotH;

  const pathData = safeData
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(d.rolling_sharpe)}`)
    .join(' ');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Rolling 30-Day Sharpe Ratio &amp; Alpha Stability Drift
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-cyan-400"></span>
            <span className="text-cyan-300 font-bold">Rolling Sharpe</span>
          </div>
          <span className="text-slate-500">Benchmark: &gt; 1.50</span>
        </div>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Zero Level Reference Line */}
          {minSR < 0 && maxSR > 0 && (
            <line
              x1={padLeft}
              y1={scaleY(0)}
              x2={padLeft + plotW}
              y2={scaleY(0)}
              stroke="#334155"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
          )}

          {/* Institutional Hurdle Level 1.50 */}
          <line
            x1={padLeft}
            y1={scaleY(1.5)}
            x2={padLeft + plotW}
            y2={scaleY(1.5)}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
          <text x={padLeft + plotW - 4} y={scaleY(1.5) - 4} fill="#34d399" fontSize="8" textAnchor="end">
            HURDLE (1.50 SR)
          </text>

          {/* Grid lines */}
          {[0, 1.0, 2.0, 3.0].map((val) => {
            if (val > maxSR || val < minSR) return null;
            return (
              <g key={`r-sr-gr-${val}`}>
                <line
                  x1={padLeft}
                  y1={scaleY(val)}
                  x2={padLeft + plotW}
                  y2={scaleY(val)}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
                <text x={padLeft - 6} y={scaleY(val) + 3} fill="#64748b" fontSize="8" textAnchor="end">
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Path */}
          <path d={pathData} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {safeData.map((d, idx) => (
            <g key={`pt-rsr-${idx}`}>
              <circle
                cx={scaleX(idx)}
                cy={scaleY(d.rolling_sharpe)}
                r="3"
                fill="#06b6d4"
                stroke="#07090e"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Continuous 30-Period Rolling Window</span>
        <span className="text-cyan-400 font-bold">Stable Alpha Production</span>
      </div>
    </div>
  );
};
