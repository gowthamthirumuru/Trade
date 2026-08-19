import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  Zap,
  Target,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export interface StrategyAnalytics {
  expectancy_r: number;
  oos_expectancy_r: number;
  profit_factor: number;
  win_rate: number;
  max_drawdown_pct: number;
  trades_count: number;
  sharpe_ratio: number;
  robustness_score: number;
  equity_curve: Array<{ date: string; equity_r: number }>;
  regime_breakdown?: {
    trending: number;
    volatile: number;
    ranging: number;
  };
}

interface QuickAnalyticsCardProps {
  strategyName: string;
  analytics: StrategyAnalytics;
}

export const QuickAnalyticsCard: React.FC<QuickAnalyticsCardProps> = ({
  strategyName,
  analytics,
}) => {
  const [selectedTf, setSelectedTf] = useState('15m');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; equity_r: number; x: number; y: number } | null>(null);

  const points = analytics.equity_curve || [
    { date: "Jan '20", equity_r: 0.0 },
    { date: "Jul '20", equity_r: 0.42 },
    { date: "Jan '21", equity_r: 0.78 },
    { date: "Jul '21", equity_r: 0.65 },
    { date: "Jan '22", equity_r: 1.25 },
    { date: "Jul '22", equity_r: 1.58 },
    { date: "Jan '23", equity_r: 1.95 },
    { date: "Jul '23", equity_r: 2.20 },
    { date: "Jan '24", equity_r: 2.64 },
    { date: "Jul '24", equity_r: 2.89 },
    { date: "Jan '25", equity_r: 3.42 },
    { date: "May '25", equity_r: 3.65 },
  ];

  // SVG dimensions for equity curve
  const width = 440;
  const height = 90;
  const paddingX = 20;
  const paddingY = 15;

  const minVal = -0.5;
  const maxVal = 4.0;

  const scaleX = (idx: number) => paddingX + (idx / Math.max(1, points.length - 1)) * (width - 2 * paddingX);
  const scaleY = (val: number) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(p.equity_r).toFixed(1)}`)
    .join(' ');

  const areaD = `${pathD} L ${scaleX(points.length - 1)} ${height - paddingY} L ${scaleX(0)} ${height - paddingY} Z`;

  // Research Wall index (Jan '23 is at index 6)
  const wallX = scaleX(6);

  return (
    <div className="quant-card p-4 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-3.5">
      {/* Header & Timeframe Switcher */}
      <div className="flex items-center justify-between border-b border-[#151a24] pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white truncate max-w-[220px]">
            Strategy Quick Analytics ({strategyName})
          </h3>
        </div>

        <div className="flex items-center bg-[#0e121a] p-0.5 rounded-lg border border-[#1c2436]">
          {['15m', '1H', '4H', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTf(tf)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                selectedTf === tf
                  ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Primary KPI Metrics Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {/* Expectancy (R) */}
        <div className="bg-[#0e121a] border border-[#1a2232] p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Expectancy (R)</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {analytics.expectancy_r >= 0 ? '+' : ''}
            {analytics.expectancy_r.toFixed(2)}R
          </div>
        </div>

        {/* OOS Expectancy (R) */}
        <div className="bg-[#0e121a] border border-cyan-900/60 p-2 rounded-xl relative">
          <div className="text-[10px] text-cyan-300 font-medium flex items-center justify-center gap-0.5">
            <span>OOS Exp (R)</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {analytics.oos_expectancy_r >= 0 ? '+' : ''}
            {analytics.oos_expectancy_r.toFixed(2)}R
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#0e121a] border border-[#1a2232] p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Profit Factor</div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {analytics.profit_factor.toFixed(2)}
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-[#0e121a] border border-[#1a2232] p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Win Rate</div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {analytics.win_rate.toFixed(1)}%
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="bg-[#0e121a] border border-[#1a2232] p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Max Drawdown</div>
          <div className="text-sm font-bold text-rose-400 mt-0.5">
            {analytics.max_drawdown_pct.toFixed(1)}%
          </div>
        </div>

        {/* Trades */}
        <div className="bg-[#0e121a] border border-[#1a2232] p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Trades</div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {analytics.trades_count.toLocaleString()}
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-[#0e121a] border border-[#1a2232] p-2 rounded-xl">
          <div className="text-[10px] text-slate-400">Sharpe Ratio</div>
          <div className="text-sm font-bold text-slate-100 mt-0.5">
            {analytics.sharpe_ratio.toFixed(2)}
          </div>
        </div>

        {/* Robustness Score */}
        <div className="bg-[#0e121a] border border-emerald-950/60 p-2 rounded-xl">
          <div className="text-[10px] text-emerald-400">Robustness Score</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {analytics.robustness_score} / 100
          </div>
        </div>
      </div>

      {/* Equity (R) Interactive Sparkline Curve */}
      <div className="bg-[#080a0f] border border-[#151a24] rounded-xl p-3 relative shadow-inner">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span className="font-bold text-cyan-300">Equity (R) — Cumulative Alpha</span>
          <span className="text-[9px] text-slate-500">Jan '20 → May '25</span>
        </div>

        {/* SVG Curve Container */}
        <div className="relative w-full h-[95px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Zero Line */}
            <line
              x1={paddingX}
              y1={scaleY(0)}
              x2={width - paddingX}
              y2={scaleY(0)}
              stroke="#1e293b"
              strokeDasharray="2 2"
              strokeWidth="1"
            />

            {/* Research Wall Demarcation Line (Jan '23) */}
            <line
              x1={wallX}
              y1={paddingY}
              x2={wallX}
              y2={height - paddingY}
              stroke="#22d3ee"
              strokeDasharray="3 3"
              strokeWidth="1.2"
            />
            <text
              x={wallX + 4}
              y={paddingY + 8}
              fill="#22d3ee"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
            >
              OOS 2023+
            </text>

            {/* Area Fill */}
            <path d={areaD} fill="url(#eqGrad)" />

            {/* Glowing Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points */}
            {points.map((pt, idx) => {
              const cx = scaleX(idx);
              const cy = scaleY(pt.equity_r);
              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  className="cursor-pointer fill-[#06b6d4] stroke-[#080a0f] stroke-2 hover:r-5 transition-all"
                  onMouseEnter={() =>
                    setHoveredPoint({ date: pt.date, equity_r: pt.equity_r, x: cx, y: cy })
                  }
                />
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100 - 28}%`,
              }}
              className="absolute pointer-events-none transform -translate-x-1/2 bg-[#0e121a] border border-cyan-500/80 px-2 py-0.5 rounded shadow-xl text-[10px] font-bold text-white whitespace-nowrap z-20"
            >
              <span className="text-cyan-300">{hoveredPoint.date}: </span>
              <span className="text-emerald-400">+{hoveredPoint.equity_r.toFixed(2)}R</span>
            </div>
          )}
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1">
          <span>Jan '20</span>
          <span>Jan '21</span>
          <span>Jan '22</span>
          <span className="text-cyan-400 font-bold">Jan '23 (Wall)</span>
          <span>Jan '24</span>
          <span>May '25</span>
        </div>
      </div>
    </div>
  );
};
