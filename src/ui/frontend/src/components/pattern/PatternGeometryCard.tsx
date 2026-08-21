import React from 'react';
import { Eye, Layers, ShieldCheck, Crosshair } from 'lucide-react';
import { DiscoveredPattern } from './PatternMiningList';

interface PatternGeometryCardProps {
  pattern: DiscoveredPattern | null;
}

export const PatternGeometryCard: React.FC<PatternGeometryCardProps> = ({ pattern }) => {
  const pat = pattern || {
    id: 'PAT-01',
    pattern: 'Order Block (Bullish 15m Retest)',
    category: 'SMC Structural',
    frequency: 240,
    win_rate: 64.2,
    avg_r: 1.15,
    lift: '+24.0%',
    optimal_entry: 'Limit order at 50% OB equilibrium',
    stop_loss: '0.5 ATR below OB low',
    take_profit: 'Next opposing swing liquidity pool (3R)',
    profit_factor: 2.84,
    p_value: 0.0014,
  };

  const svgW = 480;
  const svgH = 220;

  const isFVG = pat.pattern.includes('FVG') || pat.pattern.includes('Fair Value Gap');
  const isSweep = pat.pattern.includes('Sweep') || pat.pattern.includes('Asian');
  const isSpring = pat.pattern.includes('Spring') || pat.pattern.includes('Wyckoff');

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">
            Structural Candlestick Geometry ({pat.id})
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">{pat.category}</span>
      </div>

      {/* Interactive Candlestick SVG Diagram */}
      <div className="relative h-48 w-full bg-[#07090e] border border-[#161c28] rounded-xl flex items-center justify-center overflow-hidden p-2">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
          {/* Grid lines */}
          <line x1="30" y1="50" x2="450" y2="50" stroke="#141a26" strokeDasharray="2,3" />
          <line x1="30" y1="110" x2="450" y2="110" stroke="#141a26" strokeDasharray="2,3" />
          <line x1="30" y1="170" x2="450" y2="170" stroke="#141a26" strokeDasharray="2,3" />

          {isFVG ? (
            /* FVG 3-Bar Imbalance Sequence */
            <g>
              {/* Candle 1 (Bullish) */}
              <line x1="100" y1="110" x2="100" y2="180" stroke="#10b981" strokeWidth="2" />
              <rect x="85" y="130" width="30" height="40" fill="#10b981" rx="2" />

              {/* Candle 2 (Large Impulse Up) */}
              <line x1="200" y1="40" x2="200" y2="160" stroke="#10b981" strokeWidth="2" />
              <rect x="185" y="55" width="30" height="95" fill="#10b981" rx="2" />

              {/* Candle 3 (Pullback High) */}
              <line x1="300" y1="70" x2="300" y2="140" stroke="#f43f5e" strokeWidth="2" />
              <rect x="285" y="80" width="30" height="35" fill="#f43f5e" rx="2" />

              {/* FVG Imbalance Zone between Candle 1 High (110) and Candle 3 Low (70) */}
              <rect x="85" y="100" width="230" height="30" fill="#06b6d4" fillOpacity="0.15" stroke="#06b6d4" strokeDasharray="3,3" />
              <text x="325" y="118" fill="#06b6d4" fontSize="10" fontWeight="bold">FVG Imbalance Zone</text>

              {/* 50% Consequent Encroachment Line */}
              <line x1="85" y1="115" x2="315" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2,2" />
              <text x="325" y="132" fill="#38bdf8" fontSize="9">50% CE Equilibrium</text>

              {/* Retest Entry Arrow */}
              <path d="M 380 135 L 340 115 L 350 140 Z" fill="#10b981" />
              <text x="390" y="140" fill="#10b981" fontSize="10" fontWeight="bold">Long Entry on CE Retest</text>
            </g>
          ) : isSweep ? (
            /* Asian Liquidity Sweep Sequence */
            <g>
              {/* Asian High Range Line */}
              <line x1="40" y1="80" x2="440" y2="80" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="45" y="72" fill="#f59e0b" fontSize="10" fontWeight="bold">Asian Session High (BSL Pool)</text>

              {/* Asian Consolidation Candles */}
              <rect x="100" y="95" width="20" height="30" fill="#64748b" rx="2" />
              <rect x="140" y="90" width="20" height="40" fill="#64748b" rx="2" />
              <rect x="180" y="85" width="20" height="35" fill="#64748b" rx="2" />

              {/* London Sweep Candle (Long Upper Wick piercing Asian High) */}
              <line x1="260" y1="45" x2="260" y2="150" stroke="#f43f5e" strokeWidth="2" />
              <rect x="250" y="85" width="20" height="50" fill="#f43f5e" rx="2" />

              {/* Sweep Wick Annotation */}
              <circle cx="260" cy="45" r="4" fill="none" stroke="#f43f5e" strokeWidth="2" />
              <text x="275" y="50" fill="#f43f5e" fontSize="10" fontWeight="bold">Liquidity Purge Wick</text>

              {/* Fade Reversal Arrow */}
              <path d="M 330 90 L 330 150 M 325 140 L 330 150 L 335 140" fill="none" stroke="#10b981" strokeWidth="2" />
              <text x="345" y="125" fill="#10b981" fontSize="10" fontWeight="bold">Short Fade Entry</text>
            </g>
          ) : isSpring ? (
            /* Wyckoff Spring Sequence */
            <g>
              {/* Range Support Line */}
              <line x1="40" y1="130" x2="440" y2="130" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="45" y="122" fill="#38bdf8" fontSize="10" fontWeight="bold">Support Level / Trading Range Low</text>

              <rect x="100" y="90" width="20" height="35" fill="#64748b" rx="2" />
              <rect x="150" y="100" width="20" height="25" fill="#64748b" rx="2" />

              {/* Spring Candle (Deep Wick below Support with High Close) */}
              <line x1="240" y1="85" x2="240" y2="185" stroke="#10b981" strokeWidth="2" />
              <rect x="230" y="90" width="20" height="35" fill="#10b981" rx="2" />

              {/* False Breakdown Wick */}
              <circle cx="240" cy="185" r="4" fill="none" stroke="#f43f5e" strokeWidth="2" />
              <text x="255" y="190" fill="#f43f5e" fontSize="9" fontWeight="bold">Spring False Breakdown</text>

              {/* Reclaim Impulse */}
              <path d="M 310 120 L 350 70 M 335 72 L 350 70 L 352 85" fill="none" stroke="#10b981" strokeWidth="2" />
              <text x="360" y="80" fill="#10b981" fontSize="10" fontWeight="bold">Sign of Strength (SOS)</text>
            </g>
          ) : (
            /* Order Block Default Sequence */
            <g>
              {/* Order Block Candle (Down Candle) */}
              <line x1="120" y1="80" x2="120" y2="170" stroke="#f43f5e" strokeWidth="2" />
              <rect x="105" y="100" width="30" height="50" fill="#f43f5e" rx="2" />
              <text x="75" y="90" fill="#f43f5e" fontSize="9" fontWeight="bold">Bearish OB Candle</text>

              {/* 50% OB Equilibrium Zone */}
              <rect x="105" y="100" width="240" height="50" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeDasharray="3,3" />
              <text x="355" y="125" fill="#10b981" fontSize="9" fontWeight="bold">OB 50% Equilibrium</text>

              {/* Displacement Candle */}
              <line x1="220" y1="40" x2="220" y2="150" stroke="#10b981" strokeWidth="2" />
              <rect x="205" y="55" width="30" height="85" fill="#10b981" rx="2" />

              {/* Retest Candle */}
              <line x1="310" y1="95" x2="310" y2="160" stroke="#10b981" strokeWidth="2" />
              <rect x="295" y="100" width="30" height="40" fill="#10b981" rx="2" />

              {/* Entry Arrow */}
              <path d="M 360 145 L 320 125 L 330 150 Z" fill="#10b981" />
              <text x="365" y="160" fill="#10b981" fontSize="10" fontWeight="bold">Long Limit Fill</text>
            </g>
          )}
        </svg>
      </div>

      {/* Geometry Specifications Box */}
      <div className="p-3 bg-[#07090e] border border-[#161c28] rounded-xl text-[10px] text-slate-400 space-y-1.5">
        <div className="font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Point-in-Time Geometric Invariance</span>
          </div>
          <span className="text-cyan-300 font-mono">Sample Count: {pat.frequency}</span>
        </div>
        <p className="text-slate-300">
          Pattern detection operates strictly point-in-time on bar close $t_0$, verifying zero lookahead bias before trade execution.
        </p>
      </div>
    </div>
  );
};
