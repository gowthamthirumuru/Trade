import React, { useState } from 'react';
import { Info, Box, RotateCcw } from 'lucide-react';

interface ParameterResponseSurfaceProps {
  xParam?: string;
  yParam?: string;
  xValues?: number[];
  yValues?: number[];
  heatmap?: number[][];
  onSelectPoint?: (x: number, y: number) => void;
}

export const ParameterResponseSurface: React.FC<ParameterResponseSurfaceProps> = ({
  xParam = 'BB Length',
  yParam = 'BB StdDev',
  xValues = [10, 15, 20, 25, 30, 35, 40],
  yValues = [1.20, 1.50, 1.80, 2.00, 2.20, 2.50],
  heatmap = [
    [-0.20, 0.40, 0.85, 0.90, 0.60, 0.20, -0.30],
    [0.10, 0.80, 1.45, 1.60, 1.20, 0.70, 0.05],
    [0.40, 1.20, 1.95, 2.18, 1.85, 1.15, 0.30],
    [0.30, 1.05, 1.80, 2.05, 1.70, 1.00, 0.20],
    [0.15, 0.75, 1.35, 1.55, 1.25, 0.65, 0.05],
    [-0.10, 0.30, 0.70, 0.85, 0.55, 0.15, -0.25],
  ],
  onSelectPoint,
}) => {
  const [is3DView, setIs3DView] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('Sharpe Ratio');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number } | null>(null);

  // SVG dimensions
  const svgW = 480;
  const svgH = 240;
  const padLeft = 45;
  const padRight = 55;
  const padTop = 15;
  const padBottom = 35;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  // 2D Scale functions
  const scaleX = (xVal: number) => {
    const minX = xValues[0];
    const maxX = xValues[xValues.length - 1];
    return padLeft + ((xVal - minX) / (maxX - minX)) * plotW;
  };

  const scaleY = (yVal: number) => {
    const minY = yValues[0];
    const maxY = yValues[yValues.length - 1];
    return padTop + plotH - ((yVal - minY) / (maxY - minY)) * plotH;
  };

  // 3D Isometric projection function
  const project3D = (xIdx: number, yIdx: number, val: number) => {
    const nx = (xIdx / (xValues.length - 1)) - 0.5;
    const ny = (yIdx / (yValues.length - 1)) - 0.5;
    const cx = svgW / 2 - 10;
    const cy = svgH / 2 + 35;
    const isoX = cx + (nx - ny) * 160;
    const isoY = cy + (nx + ny) * 75 - (Math.max(0, val) * 28);
    return { x: isoX, y: isoY };
  };

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-white text-xs">Parameter Response Surface ({selectedMetric})</h3>
          <div className="group relative cursor-pointer">
            <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
            <div className="opacity-0 group-hover:opacity-100 transition absolute left-5 -top-1 bg-[#121824] border border-slate-700 p-2 rounded text-[10px] text-slate-300 z-30 w-48 shadow-lg pointer-events-none">
              High-resolution Gaussian process contour mapping optimal plateau neighborhoods.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">X Axis</span>
            <select
              value={xParam}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-cyan-300 font-bold outline-none"
            >
              <option value="BB Length">BB Length</option>
              <option value="RSI Length">RSI Length</option>
              <option value="EMA Fast">EMA Fast</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">Y Axis</span>
            <select
              value={yParam}
              className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-cyan-300 font-bold outline-none"
            >
              <option value="BB StdDev">BB StdDev</option>
              <option value="ATR Multiplier">ATR Multiplier</option>
              <option value="RSI Oversold">RSI Oversold</option>
            </select>
          </div>

          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-[#07090e] border border-[#1a2232] rounded px-1.5 py-0.5 text-white font-bold outline-none"
          >
            <option value="Sharpe Ratio">Sharpe Ratio</option>
            <option value="Expectancy (R)">Expectancy (R)</option>
            <option value="Profit Factor">Profit Factor</option>
          </select>

          <button
            onClick={() => setIs3DView(!is3DView)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition ${
              is3DView
                ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold shadow-md shadow-purple-900/40'
                : 'bg-[#07090e] border-[#1a2232] text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>3D View</span>
          </button>
        </div>
      </div>

      {/* Main Contour Surface Visual */}
      <div className="relative h-60 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          <defs>
            {/* Colorbar Gradient */}
            <linearGradient id="colorbarGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="25%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Contour Surface Gradients */}
            <radialGradient id="peakGlow" cx="54%" cy="48%" r="45%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#eab308" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#10b981" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="90%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0b0e14" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Plot Background Area */}
          <rect
            x={padLeft}
            y={padTop}
            width={plotW}
            height={plotH}
            fill="#07090e"
            rx="6"
            stroke="#161c28"
            strokeWidth="1"
          />

          {!is3DView ? (
            /* 2D Contour View */
            <g>
              {/* 2D Contour Layers */}
              <ellipse
                cx={scaleX(25)}
                cy={scaleY(1.95)}
                rx={plotW * 0.42}
                ry={plotH * 0.42}
                fill="#0369a1"
                opacity="0.3"
              />
              <ellipse
                cx={scaleX(25)}
                cy={scaleY(1.95)}
                rx={plotW * 0.34}
                ry={plotH * 0.35}
                fill="#059669"
                opacity="0.4"
              />
              <ellipse
                cx={scaleX(25.5)}
                cy={scaleY(1.96)}
                rx={plotW * 0.25}
                ry={plotH * 0.28}
                fill="#10b981"
                opacity="0.6"
              />
              <ellipse
                cx={scaleX(25.5)}
                cy={scaleY(1.97)}
                rx={plotW * 0.17}
                ry={plotH * 0.20}
                fill="#eab308"
                opacity="0.75"
              />
              <ellipse
                cx={scaleX(25.5)}
                cy={scaleY(1.97)}
                rx={plotW * 0.10}
                ry={plotH * 0.12}
                fill="url(#peakGlow)"
              />

              {/* Grid lines */}
              {xValues.map((xVal) => (
                <line
                  key={`gx-${xVal}`}
                  x1={scaleX(xVal)}
                  y1={padTop}
                  x2={scaleX(xVal)}
                  y2={padTop + plotH}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
              ))}

              {yValues.map((yVal) => (
                <line
                  key={`gy-${yVal}`}
                  x1={padLeft}
                  y1={scaleY(yVal)}
                  x2={padLeft + plotW}
                  y2={scaleY(yVal)}
                  stroke="#141a26"
                  strokeDasharray="2,3"
                />
              ))}

              {/* Explored Points */}
              {xValues.map((xVal, xi) =>
                yValues.map((yVal, yi) => {
                  const val = heatmap[yi] ? heatmap[yi][xi] : 1.5;
                  const isBest = xVal === 25 && Math.abs(yVal - 2.0) < 0.1;
                  return (
                    <g key={`pt-${xi}-${yi}`}>
                      <circle
                        cx={scaleX(xVal)}
                        cy={scaleY(yVal)}
                        r={isBest ? 5 : 2.5}
                        fill={isBest ? '#f59e0b' : '#a855f7'}
                        stroke={isBest ? '#ffffff' : '#07090e'}
                        strokeWidth={isBest ? 1.5 : 0.8}
                        className="cursor-pointer transition hover:scale-150"
                        onMouseEnter={() => setHoveredPoint({ x: xVal, y: yVal, val })}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => onSelectPoint && onSelectPoint(xVal, yVal)}
                      />
                      {isBest && (
                        <circle
                          cx={scaleX(xVal)}
                          cy={scaleY(yVal)}
                          r="9"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="1.2"
                          strokeDasharray="2,2"
                          className="animate-spin origin-center"
                        />
                      )}
                    </g>
                  );
                })
              )}

              {/* Axis Labels */}
              {xValues.map((xVal) => (
                <text
                  key={`xl-${xVal}`}
                  x={scaleX(xVal)}
                  y={padTop + plotH + 14}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {xVal}
                </text>
              ))}
              <text
                x={padLeft + plotW / 2}
                y={padTop + plotH + 26}
                fill="#94a3b8"
                fontSize="8"
                textAnchor="middle"
                fontWeight="bold"
              >
                {xParam}
              </text>

              {yValues.map((yVal) => (
                <text
                  key={`yl-${yVal}`}
                  x={padLeft - 6}
                  y={scaleY(yVal) + 3}
                  fill="#64748b"
                  fontSize="8"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {yVal.toFixed(2)}
                </text>
              ))}
              <text
                x={12}
                y={padTop + plotH / 2}
                fill="#94a3b8"
                fontSize="8"
                textAnchor="middle"
                fontWeight="bold"
                transform={`rotate(-90 12 ${padTop + plotH / 2})`}
              >
                {yParam}
              </text>
            </g>
          ) : (
            /* 3D Isometric Surface Mesh */
            <g>
              {/* Mesh Polygons */}
              {yValues.slice(0, -1).map((_, yi) =>
                xValues.slice(0, -1).map((_, xi) => {
                  const v00 = heatmap[yi]?.[xi] ?? 1.0;
                  const v10 = heatmap[yi]?.[xi + 1] ?? 1.0;
                  const v11 = heatmap[yi + 1]?.[xi + 1] ?? 1.0;
                  const v01 = heatmap[yi + 1]?.[xi] ?? 1.0;

                  const p00 = project3D(xi, yi, v00);
                  const p10 = project3D(xi + 1, yi, v10);
                  const p11 = project3D(xi + 1, yi + 1, v11);
                  const p01 = project3D(xi, yi + 1, v01);

                  const avgVal = (v00 + v10 + v11 + v01) / 4.0;
                  const fillColor =
                    avgVal >= 2.0
                      ? '#f59e0b'
                      : avgVal >= 1.7
                      ? '#10b981'
                      : avgVal >= 1.2
                      ? '#06b6d4'
                      : '#1e293b';

                  return (
                    <polygon
                      key={`iso-${xi}-${yi}`}
                      points={`${p00.x},${p00.y} ${p10.x},${p10.y} ${p11.x},${p11.y} ${p01.x},${p01.y}`}
                      fill={fillColor}
                      fillOpacity="0.45"
                      stroke="#38bdf8"
                      strokeWidth="0.8"
                      className="transition hover:fill-opacity-80 cursor-pointer"
                      onClick={() => onSelectPoint && onSelectPoint(xValues[xi], yValues[yi])}
                      onMouseEnter={() =>
                        setHoveredPoint({ x: xValues[xi], y: yValues[yi], val: avgVal })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })
              )}

              {/* 3D Peak Dots */}
              {xValues.map((xVal, xi) =>
                yValues.map((yVal, yi) => {
                  const val = heatmap[yi]?.[xi] ?? 1.0;
                  const p = project3D(xi, yi, val);
                  const isPeak = val >= 2.10;
                  return (
                    <circle
                      key={`iso-dot-${xi}-${yi}`}
                      cx={p.x}
                      cy={p.y}
                      r={isPeak ? 4 : 2}
                      fill={isPeak ? '#f59e0b' : '#c084fc'}
                      stroke="#ffffff"
                      strokeWidth={isPeak ? 1.2 : 0.6}
                      className="cursor-pointer hover:scale-150"
                      onClick={() => onSelectPoint && onSelectPoint(xVal, yVal)}
                      onMouseEnter={() => setHoveredPoint({ x: xVal, y: yVal, val })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })
              )}
            </g>
          )}

          {/* Right Colorbar Legend */}
          <rect
            x={svgW - padRight + 12}
            y={padTop + 10}
            width={10}
            height={plotH - 20}
            fill="url(#colorbarGrad)"
            rx="3"
          />
          <text x={svgW - padRight + 26} y={padTop + 14} fill="#ea580c" fontSize="7" fontWeight="bold">
            2.50
          </text>
          <text x={svgW - padRight + 26} y={padTop + (plotH - 20) * 0.25 + 10} fill="#eab308" fontSize="7">
            1.75
          </text>
          <text x={svgW - padRight + 26} y={padTop + (plotH - 20) * 0.5 + 10} fill="#10b981" fontSize="7">
            1.00
          </text>
          <text x={svgW - padRight + 26} y={padTop + (plotH - 20) * 0.75 + 10} fill="#0284c7" fontSize="7">
            0.25
          </text>
          <text x={svgW - padRight + 26} y={padTop + plotH - 10} fill="#64748b" fontSize="7">
            -0.50
          </text>
          <text
            x={svgW - padRight + 17}
            y={padTop + 4}
            fill="#94a3b8"
            fontSize="7"
            textAnchor="middle"
            fontWeight="bold"
          >
            Sharpe
          </text>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 left-14 bg-black/90 border border-slate-700 px-2 py-1 rounded text-[10px] text-white shadow-xl pointer-events-none z-20">
            <div>
              <span className="text-slate-400">{xParam}:</span> <span className="font-bold text-cyan-300">{hoveredPoint.x}</span>
            </div>
            <div>
              <span className="text-slate-400">{yParam}:</span> <span className="font-bold text-cyan-300">{hoveredPoint.y.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400">{selectedMetric}:</span>{' '}
              <span className="font-bold text-emerald-400 font-mono">+{hoveredPoint.val.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-[#141a26]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          <span className="text-emerald-300 font-bold">Optimal Zone [High Confidence]</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span>Explored: 150/150</span>
        </div>
      </div>
    </div>
  );
};
