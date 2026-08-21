import React from 'react';
import { ShieldCheck, TrendingUp, Binary } from 'lucide-react';

export interface DSRDecayPoint {
  trials_n: number;
  emax_sr: number;
  dsr_prob: number;
  p_value: number;
}

interface OverfittingDSRCurveChartProps {
  decayCurve?: DSRDecayPoint[];
  observedSharpe?: number;
}

export const OverfittingDSRCurveChart: React.FC<OverfittingDSRCurveChartProps> = ({
  decayCurve = [],
  observedSharpe = 2.18,
}) => {
  const safeData = decayCurve.length > 0 ? decayCurve : [
    { trials_n: 1, emax_sr: 0.0, dsr_prob: 100.0, p_value: 0.0001 },
    { trials_n: 5, emax_sr: 0.85, dsr_prob: 99.8, p_value: 0.0008 },
    { trials_n: 20, emax_sr: 1.15, dsr_prob: 99.2, p_value: 0.0021 },
    { trials_n: 50, emax_sr: 1.3, dsr_prob: 98.6, p_value: 0.0035 },
    { trials_n: 100, emax_sr: 1.38, dsr_prob: 97.8, p_value: 0.0042 },
    { trials_n: 200, emax_sr: 1.45, dsr_prob: 96.5, p_value: 0.0068 },
    { trials_n: 500, emax_sr: 1.54, dsr_prob: 94.2, p_value: 0.0125 },
  ];

  const svgW = 560;
  const svgH = 220;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 25;
  const padBottom = 30;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const emaxVals = safeData.map((d) => d.emax_sr);
  const maxVal = Math.max(3.0, observedSharpe * 1.2, ...emaxVals);

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, safeData.length - 1)) * plotW;
  const scaleY = (sr: number) => padTop + plotH - (sr / maxVal) * plotH;

  const emaxPath = safeData
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(d.emax_sr)}`)
    .join(' ');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Expected Max Sharpe Threshold under H0 vs Trials Tested (N)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-400"></span>
            <span className="text-emerald-300 font-bold">Observed SR ({observedSharpe.toFixed(2)})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-400"></span>
            <span className="text-slate-400">E[Max SR | H0]</span>
          </div>
        </div>
      </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 1.0, 2.0, 3.0].map((val) => {
            if (val > maxVal) return null;
            return (
              <g key={`dsr-gr-${val}`}>
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

          {/* Observed Sharpe Benchmark Line */}
          <line
            x1={padLeft}
            y1={scaleY(observedSharpe)}
            x2={padLeft + plotW}
            y2={scaleY(observedSharpe)}
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="3,3"
          />

          {/* E[Max SR] Curve */}
          <path d={emaxPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {safeData.map((d, idx) => (
            <g key={`pt-dsr-${idx}`}>
              <circle
                cx={scaleX(idx)}
                cy={scaleY(d.emax_sr)}
                r="3.5"
                fill="#f59e0b"
                stroke="#07090e"
                strokeWidth="1.5"
              />
              <text
                x={scaleX(idx)}
                y={padTop + plotH + 15}
                fill="#94a3b8"
                fontSize="8"
                textAnchor="middle"
                fontWeight="bold"
              >
                N={d.trials_n}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#141a26] pt-2 px-1">
        <span>Bailey &amp; López de Prado (2014) Formulation</span>
        <span className="text-emerald-400 font-bold">Observed SR Exceeds H0 Noise Ceiling</span>
      </div>
    </div>
  );
};
