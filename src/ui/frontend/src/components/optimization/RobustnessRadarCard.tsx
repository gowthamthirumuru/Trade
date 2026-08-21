import React from 'react';
import { Info } from 'lucide-react';

interface RadarDimension {
  name: string;
  top_result: number;
  baseline: number;
  max: number;
}

interface RobustnessRadarCardProps {
  dimensions?: RadarDimension[];
}

export const RobustnessRadarCard: React.FC<RobustnessRadarCardProps> = ({
  dimensions = [
    { name: 'Parameter Stability', top_result: 88, baseline: 65, max: 100 },
    { name: 'Walk-Forward', top_result: 84, baseline: 62, max: 100 },
    { name: 'Monte Carlo', top_result: 86, baseline: 60, max: 100 },
    { name: 'Execution Stress', top_result: 82, baseline: 58, max: 100 },
    { name: 'OOS Stability', top_result: 87, baseline: 64, max: 100 },
    { name: 'Regime Consistency', top_result: 83, baseline: 59, max: 100 },
  ],
}) => {
  // SVG Radar Dimensions
  const svgW = 280;
  const svgH = 220;
  const cx = svgW / 2;
  const cy = svgH / 2 - 5;
  const radius = 65;

  const numAxes = dimensions.length;
  const angleStep = (2 * Math.PI) / numAxes;

  // Vertex points
  const getCoordinates = (val: number, maxVal: number, angleIdx: number) => {
    const angle = angleIdx * angleStep - Math.PI / 2;
    const r = (val / maxVal) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  // Build polygon path strings
  const topResultPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.top_result, d.max, i);
      return `${x},${y}`;
    })
    .join(' ');

  const baselinePoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(d.baseline, d.max, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-white text-xs">Robustness Analysis (Top Result)</h3>
          <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
        </div>
      </div>

      {/* SVG Radar Chart */}
      <div className="relative h-48 w-full flex items-center justify-center">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Concentric Hexagons */}
          {[0.25, 0.5, 0.75, 1.0].map((ring, rIdx) => {
            const ringPts = dimensions
              .map((d, i) => {
                const { x, y } = getCoordinates(d.max * ring, d.max, i);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={`ring-${rIdx}`}
                points={ringPts}
                fill="none"
                stroke="#161c28"
                strokeWidth="1"
                strokeDasharray={ring < 1.0 ? '2,2' : undefined}
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {dimensions.map((d, i) => {
            const { x, y } = getCoordinates(d.max, d.max, i);
            return <line key={`spoke-${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#161c28" strokeWidth="1" />;
          })}

          {/* Baseline Polygon */}
          <polygon
            points={baselinePoints}
            fill="#06b6d4"
            fillOpacity="0.1"
            stroke="#06b6d4"
            strokeWidth="1.2"
            strokeDasharray="3,3"
          />

          {/* Top Result Polygon */}
          <polygon
            points={topResultPoints}
            fill="#8b5cf6"
            fillOpacity="0.25"
            stroke="#a855f7"
            strokeWidth="2"
          />

          {/* Top Result Vertex Dots */}
          {dimensions.map((d, i) => {
            const { x, y } = getCoordinates(d.top_result, d.max, i);
            return <circle key={`dot-${i}`} cx={x} cy={y} r="2.5" fill="#a855f7" stroke="#ffffff" strokeWidth="0.8" />;
          })}

          {/* Dimension Labels around perimeter */}
          {dimensions.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelR = radius + 20;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);

            let anchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) anchor = 'start';
            else if (Math.cos(angle) < -0.3) anchor = 'end';

            return (
              <g key={`lbl-${i}`}>
                <text
                  x={lx}
                  y={ly - 2}
                  fill="#94a3b8"
                  fontSize="7"
                  textAnchor={anchor}
                  fontFamily="monospace"
                >
                  {d.name}
                </text>
                <text
                  x={lx}
                  y={ly + 6}
                  fill="#c084fc"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor={anchor}
                  fontFamily="monospace"
                >
                  {d.top_result}/100
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-slate-400 pt-1 border-t border-[#141a26]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
          <span className="text-purple-300 font-bold">Top Result</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="text-cyan-300 font-bold">Baseline</span>
        </div>
      </div>
    </div>
  );
};
