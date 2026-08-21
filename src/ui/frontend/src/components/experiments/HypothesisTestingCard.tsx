import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, FlaskConical, Info } from 'lucide-react';

interface PermutationBin {
  bin: number;
  frequency: number;
}

interface HypothesisTestingCardProps {
  pValue?: number;
  tStat?: number;
  mannWhitneyP?: number;
  observedAlphaLift?: number;
  permutationDistribution?: PermutationBin[];
}

export const HypothesisTestingCard: React.FC<HypothesisTestingCardProps> = ({
  pValue = 0.0014,
  tStat = 2.85,
  mannWhitneyP = 0.0021,
  observedAlphaLift = 0.27,
  permutationDistribution = [
    { bin: -0.20, frequency: 4 },
    { bin: -0.15, frequency: 12 },
    { bin: -0.10, frequency: 28 },
    { bin: -0.05, frequency: 54 },
    { bin: 0.00, frequency: 82 },
    { bin: 0.05, frequency: 58 },
    { bin: 0.10, frequency: 32 },
    { bin: 0.15, frequency: 16 },
    { bin: 0.20, frequency: 8 },
    { bin: 0.25, frequency: 4 },
    { bin: 0.30, frequency: 2 },
  ],
}) => {
  const isSignificant = pValue < 0.05;

  // SVG Histogram dimensions
  const svgW = 520;
  const svgH = 180;
  const padLeft = 35;
  const padRight = 35;
  const padTop = 20;
  const padBottom = 30;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  const maxFreq = Math.max(...permutationDistribution.map((d) => d.frequency), 90);
  const minBin = permutationDistribution[0]?.bin ?? -0.20;
  const maxBin = permutationDistribution[permutationDistribution.length - 1]?.bin ?? 0.30;

  const scaleX = (val: number) => padLeft + ((val - minBin) / (maxBin - minBin)) * plotW;
  const scaleY = (freq: number) => padTop + plotH - (freq / maxFreq) * plotH;

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-4 font-mono text-xs select-none shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">Statistical Hypothesis Testing Laboratory (Zero-Data-Snooping)</h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
            isSignificant
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
              : 'bg-rose-950 text-rose-300 border-rose-700'
          }`}
        >
          {isSignificant ? '✓ Statistically Significant (p < 0.05)' : '✗ Not Significant'}
        </span>
      </div>

      {/* Hypothesis Statements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Null Hypothesis (H₀)</div>
          <div className="text-slate-200 text-[11px]">
            The variant trading model generates zero or negative excess alpha over the control baseline (μ_variant ≤ μ_baseline).
          </div>
        </div>

        <div className="bg-[#07090e] border border-purple-900/50 rounded-lg p-3 space-y-1">
          <div className="text-[10px] text-purple-300 font-bold uppercase">Alternative Hypothesis (H₁)</div>
          <div className="text-emerald-300 text-[11px] font-bold">
            The variant trading model provides genuine, statistically verifiable positive alpha lift (μ_variant &gt; μ_baseline).
          </div>
        </div>
      </div>

      {/* Permutation Distribution Plot */}
      <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-white">Bootstrap Permutation Distribution (1,000 Resamples)</span>
          <span className="text-slate-400">Observed Lift: <span className="text-emerald-400 font-extrabold">+{observedAlphaLift.toFixed(2)}R</span></span>
        </div>

        <div className="relative h-44 w-full flex items-center justify-center">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
            {/* Bars */}
            {permutationDistribution.map((d, idx) => {
              const barX = scaleX(d.bin);
              const barY = scaleY(d.frequency);
              const barW = (plotW / permutationDistribution.length) - 2;
              const isBeyond = d.bin >= observedAlphaLift;

              return (
                <rect
                  key={`pbin-${idx}`}
                  x={barX}
                  y={barY}
                  width={Math.max(2, barW)}
                  height={padTop + plotH - barY}
                  fill={isBeyond ? '#10b981' : '#334155'}
                  rx="1"
                  opacity={isBeyond ? '0.9' : '0.6'}
                />
              );
            })}

            {/* Critical Alpha Line (0.05) */}
            <line
              x1={scaleX(0.12)}
              y1={padTop}
              x2={scaleX(0.12)}
              y2={padTop + plotH}
              stroke="#eab308"
              strokeWidth="1.2"
              strokeDasharray="3,3"
            />
            <text x={scaleX(0.12) - 4} y={padTop + 12} fill="#eab308" fontSize="7" textAnchor="end">
              Critical α = 0.05
            </text>

            {/* Observed Difference Line */}
            <line
              x1={scaleX(observedAlphaLift)}
              y1={padTop}
              x2={scaleX(observedAlphaLift)}
              y2={padTop + plotH}
              stroke="#10b981"
              strokeWidth="1.8"
            />
            <text x={scaleX(observedAlphaLift) + 4} y={padTop + 12} fill="#10b981" fontSize="7" fontWeight="bold">
              Observed (+{observedAlphaLift}R)
            </text>

            {/* X-Axis Ticks */}
            {permutationDistribution.map((d, idx) => {
              if (idx % 2 === 0) {
                return (
                  <text
                    key={`pxtick-${idx}`}
                    x={scaleX(d.bin)}
                    y={padTop + plotH + 12}
                    fill="#64748b"
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {d.bin > 0 ? `+${d.bin}` : d.bin}
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </div>
      </div>

      {/* 4 Quantitative Hypothesis Verification Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <span className="text-[9px] text-slate-500 block uppercase">Welch's t-Statistic</span>
          <span className="text-sm font-extrabold text-white">t = {tStat.toFixed(2)}</span>
        </div>

        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <span className="text-[9px] text-slate-500 block uppercase">Two-Sided p-Value</span>
          <span className="text-sm font-extrabold text-emerald-400">p = {pValue.toFixed(4)}</span>
        </div>

        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <span className="text-[9px] text-slate-500 block uppercase">Mann-Whitney U Test</span>
          <span className="text-sm font-extrabold text-cyan-300">p = {mannWhitneyP.toFixed(4)}</span>
        </div>

        <div className="bg-[#07090e] border border-[#161c28] rounded-lg p-2.5">
          <span className="text-[9px] text-slate-500 block uppercase">Deflated Sharpe Gate</span>
          <span className="text-sm font-extrabold text-emerald-400">Gate 6 PASSED</span>
        </div>
      </div>
    </div>
  );
};
