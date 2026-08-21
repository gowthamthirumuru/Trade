import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { WalkForwardWindowItem } from './WalkForwardWindowVisualizer';

interface WalkForwardSharpeComparisonChartProps {
  windows: WalkForwardWindowItem[];
}

export const WalkForwardSharpeComparisonChart: React.FC<WalkForwardSharpeComparisonChartProps> = ({
  windows = [],
}) => {
  const data = windows.length > 0 ? windows : [
    { window_id: 'W1', train_period: '2018–2020', test_period: '2020–2021', is_sharpe: 2.34, oos_sharpe: 1.95, wfer_pct: 83.3, status: 'PASSED' },
    { window_id: 'W2', train_period: '2019–2021', test_period: '2021–2022', is_sharpe: 2.45, oos_sharpe: 1.88, wfer_pct: 76.7, status: 'PASSED' },
    { window_id: 'W3', train_period: '2020–2022', test_period: '2022–2023', is_sharpe: 2.18, oos_sharpe: 1.82, wfer_pct: 83.5, status: 'PASSED' },
    { window_id: 'W4', train_period: '2021–2023', test_period: '2023–2024', is_sharpe: 2.52, oos_sharpe: 2.10, wfer_pct: 83.3, status: 'PASSED' },
    { window_id: 'W5', train_period: '2022–2024', test_period: '2024–2026', is_sharpe: 2.25, oos_sharpe: 1.85, wfer_pct: 82.2, status: 'PASSED' },
  ];

  const svgW = 500;
  const svgH = 200;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const allSharpes = data.flatMap((w) => [w.is_sharpe, w.oos_sharpe]);
  const maxSharpe = Math.max(2.5, ...allSharpes) * 1.15;

  const scaleY = (sr: number) => padTop + plotH - (sr / maxSharpe) * plotH;
  const groupWidth = plotW / data.length;
  const barWidth = Math.min(22, (groupWidth - 12) / 2);

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">In-Sample vs Out-of-Sample Sharpe Comparison</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
            <span className="text-slate-400">In-Sample (Train)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-slate-400">Out-of-Sample (Test)</span>
          </div>
        </div>
      </div>

      <div className="relative h-44 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          {[0, 1.0, 2.0, 3.0].map((val) => {
            if (val > maxSharpe) return null;
            return (
              <g key={`sh-${val}`}>
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

          {/* Bars */}
          {data.map((w, idx) => {
            const groupX = padLeft + idx * groupWidth + (groupWidth - (barWidth * 2 + 4)) / 2;
            const isH = plotH - (scaleY(w.is_sharpe) - padTop);
            const oosH = plotH - (scaleY(w.oos_sharpe) - padTop);

            return (
              <g key={w.window_id}>
                {/* IS Bar */}
                <rect
                  x={groupX}
                  y={scaleY(w.is_sharpe)}
                  width={barWidth}
                  height={Math.max(2, isH)}
                  fill="#3b82f6"
                  rx="2"
                />
                {/* OOS Bar */}
                <rect
                  x={groupX + barWidth + 4}
                  y={scaleY(w.oos_sharpe)}
                  width={barWidth}
                  height={Math.max(2, oosH)}
                  fill="#10b981"
                  rx="2"
                />
                {/* X Axis Label */}
                <text
                  x={groupX + barWidth + 2}
                  y={padTop + plotH + 15}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {w.window_id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
