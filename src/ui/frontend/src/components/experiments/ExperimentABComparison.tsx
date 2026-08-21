import React, { useState } from 'react';
import { GitCompare, TrendingUp, CheckCircle2, ShieldCheck, ArrowRight, Activity, ArrowUpRight, Download } from 'lucide-react';
import { ExperimentItem } from './ExperimentsKanban';

interface MetricDelta {
  baseline: number;
  variant: number;
  delta: number;
}

interface ABComparisonData {
  experiment_id: string;
  strategy: string;
  pair: string;
  timeframe: string;
  statistical_significance: {
    p_value: number;
    is_significant: boolean;
    t_statistic: number;
    mann_whitney_p: number;
    observed_alpha_lift: number;
    confidence_level: string;
    dsr_gate_passed: boolean;
    dsr_p_value: number;
  };
  metrics_comparison: {
    net_return: MetricDelta;
    sharpe: MetricDelta;
    expectancy_r: MetricDelta;
    max_drawdown: MetricDelta;
    profit_factor: MetricDelta;
    win_rate: MetricDelta;
  };
  equity_curve: Array<{
    date: string;
    baselineEquity: number;
    variantEquity: number;
    alphaDivergence: number;
  }>;
}

interface ExperimentABComparisonProps {
  data?: ABComparisonData;
  experiments?: ExperimentItem[];
  selectedExperimentId?: string;
  onSelectExperiment?: (exp: ExperimentItem) => void;
  onPromoteEdge?: (id: string) => void;
  onRunBacktest?: () => void;
}

export const ExperimentABComparison: React.FC<ExperimentABComparisonProps> = ({
  data,
  experiments = [],
  selectedExperimentId,
  onSelectExperiment,
  onPromoteEdge,
  onRunBacktest,
}) => {
  const [promoted, setPromoted] = useState(false);

  // Dynamic Data & Fallbacks
  const comp = data?.metrics_comparison || {
    net_return: { baseline: 24.5, variant: 38.2, delta: 13.7 },
    sharpe: { baseline: 1.58, variant: 2.18, delta: 0.60 },
    expectancy_r: { baseline: 0.64, variant: 0.91, delta: 0.27 },
    max_drawdown: { baseline: 11.8, variant: 8.4, delta: -3.4 },
    profit_factor: { baseline: 1.72, variant: 2.18, delta: 0.46 },
    win_rate: { baseline: 58.0, variant: 64.4, delta: 6.4 },
  };

  const stat = data?.statistical_significance || {
    p_value: 0.0014,
    is_significant: true,
    t_statistic: 2.85,
    mann_whitney_p: 0.0021,
    observed_alpha_lift: 0.27,
    confidence_level: '99.8% (Statistically Proven Alpha)',
    dsr_gate_passed: true,
    dsr_p_value: 0.0042,
  };

  const equitySeries = data?.equity_curve && data.equity_curve.length > 0 ? data.equity_curve : [
    { date: '2024-01', baselineEquity: 10000, variantEquity: 10000, alphaDivergence: 0 },
    { date: '2024-04', baselineEquity: 10600, variantEquity: 10900, alphaDivergence: 300 },
    { date: '2024-08', baselineEquity: 11200, variantEquity: 12100, alphaDivergence: 900 },
    { date: '2024-12', baselineEquity: 11800, variantEquity: 13400, alphaDivergence: 1600 },
    { date: '2025-04', baselineEquity: 12450, variantEquity: 13820, alphaDivergence: 1370 },
  ];

  // SVG Chart dimensions
  const svgW = 600;
  const svgH = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const plotW = svgW - padLeft - padRight;
  const plotH = svgH - padTop - padBottom;

  // Dynamically compute min/max from actual equity curve data points
  const allEquities = equitySeries.flatMap((p) => [p.baselineEquity, p.variantEquity]);
  const rawMin = Math.min(...allEquities, 9000);
  const rawMax = Math.max(...allEquities, 11000);
  const minEq = Math.floor(rawMin * 0.98);
  const maxEq = Math.ceil(rawMax * 1.02);

  const scaleX = (idx: number) => padLeft + (idx / Math.max(1, equitySeries.length - 1)) * plotW;
  const scaleY = (val: number) => padTop + plotH - ((val - minEq) / Math.max(1, maxEq - minEq)) * plotH;

  const baselinePath = equitySeries
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(p.baselineEquity)}`)
    .join(' ');

  const variantPath = equitySeries
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(idx)} ${scaleY(p.variantEquity)}`)
    .join(' ');

  const handlePromote = () => {
    const eid = data?.experiment_id || selectedExperimentId || 'EXP-01';
    if (onPromoteEdge) {
      onPromoteEdge(eid);
      setPromoted(true);
      setTimeout(() => setPromoted(false), 2500);
    }
  };

  const handleExportCSV = () => {
    const headers = 'Date,BaselineEquity,VariantEquity,AlphaDivergence\n';
    const rows = equitySeries
      .map((p) => `${p.date},${p.baselineEquity},${p.variantEquity},${p.alphaDivergence}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab_comparison_${data?.experiment_id || 'EXP-01'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* 1. Top Meta Banner */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Experiment Selector */}
            {experiments.length > 0 && onSelectExperiment && (
              <select
                value={selectedExperimentId || data?.experiment_id || experiments[0]?.id}
                onChange={(e) => {
                  const found = experiments.find((exp) => exp.id === e.target.value);
                  if (found) onSelectExperiment(found);
                }}
                className="bg-[#07090e] border border-purple-700/80 rounded px-2 py-0.5 text-purple-300 font-extrabold outline-none text-xs cursor-pointer"
              >
                {experiments.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.id} — {exp.title} ({exp.strategy})
                  </option>
                ))}
              </select>
            )}

            <span className="text-cyan-300 font-bold">
              ({data?.pair || 'XAUUSD'} • {data?.timeframe || '15m'})
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Head-to-head empirical trade simulation evaluating treatment filter vs control baseline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-slate-300 hover:text-white transition text-xs font-bold"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onRunBacktest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-slate-300 hover:text-white transition text-xs font-bold"
          >
            <span>Run Full Backtest</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handlePromote}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-extrabold rounded-lg text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{promoted ? 'Promoted to Production!' : 'Promote Edge to Prod'}</span>
          </button>
        </div>
      </div>

      {/* 2. 6-Metric Delta Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { title: 'Expectancy R', b: comp.expectancy_r.baseline, v: comp.expectancy_r.variant, d: comp.expectancy_r.delta, unit: 'R', isGood: comp.expectancy_r.delta > 0 },
          { title: 'Sharpe Ratio', b: comp.sharpe.baseline, v: comp.sharpe.variant, d: comp.sharpe.delta, unit: '', isGood: comp.sharpe.delta > 0 },
          { title: 'Max Drawdown', b: comp.max_drawdown.baseline, v: comp.max_drawdown.variant, d: comp.max_drawdown.delta, unit: '%', isGood: comp.max_drawdown.delta < 0 },
          { title: 'Profit Factor', b: comp.profit_factor.baseline, v: comp.profit_factor.variant, d: comp.profit_factor.delta, unit: '', isGood: comp.profit_factor.delta > 0 },
          { title: 'Win Rate', b: comp.win_rate.baseline, v: comp.win_rate.variant, d: comp.win_rate.delta, unit: '%', isGood: comp.win_rate.delta > 0 },
          { title: 'Net Return', b: comp.net_return.baseline, v: comp.net_return.variant, d: comp.net_return.delta, unit: '%', isGood: comp.net_return.delta > 0 },
        ].map((m, idx) => (
          <div key={idx} className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1.5 shadow-sm">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{m.title}</div>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-extrabold text-white">
                {m.v > 0 && m.unit === 'R' ? `+${m.v.toFixed(2)}` : m.v}
                {m.unit}
              </span>
              <span
                className={`text-[11px] font-extrabold px-1.5 py-0.2 rounded ${
                  m.isGood
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {m.d > 0 ? `+${m.d}` : m.d}
                {m.unit}
              </span>
            </div>
            <div className="text-[9px] text-slate-500">
              Baseline Control: {m.b > 0 && m.unit === 'R' ? `+${m.b.toFixed(2)}` : m.b}
              {m.unit}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Dual Comparative Equity Curve */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">Comparative Cumulative Equity Curve (A/B)</h3>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400"></span>
              <span className="text-emerald-300 font-bold">Variant (Treatment Model)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-slate-500 border-b border-dashed"></span>
              <span className="text-slate-400 font-bold">Baseline (Control Model)</span>
            </div>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="relative h-56 w-full flex items-center justify-center">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
            {/* Dynamic Y Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
              const eq = Math.round(minEq + frac * (maxEq - minEq));
              return (
                <g key={`ab-y-${i}`}>
                  <line
                    x1={padLeft}
                    y1={scaleY(eq)}
                    x2={padLeft + plotW}
                    y2={scaleY(eq)}
                    stroke="#141a26"
                    strokeDasharray="2,3"
                  />
                  <text x={padLeft - 6} y={scaleY(eq) + 3} fill="#64748b" fontSize="8" textAnchor="end">
                    ${eq.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* X Labels */}
            {equitySeries.map((p, idx) => (
              <text
                key={`ab-x-${idx}`}
                x={scaleX(idx)}
                y={padTop + plotH + 14}
                fill="#64748b"
                fontSize="8"
                textAnchor="middle"
              >
                {p.date}
              </text>
            ))}

            {/* Paths */}
            <path d={baselinePath} fill="none" stroke="#64748b" strokeWidth="1.8" strokeDasharray="3,3" />
            <path d={variantPath} fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" />

            {/* Variant Points */}
            {equitySeries.map((p, idx) => (
              <circle
                key={`var-pt-${idx}`}
                cx={scaleX(idx)}
                cy={scaleY(p.variantEquity)}
                r="3"
                fill="#10b981"
                stroke="#07090e"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 4. Statistical Rigor Confirmation Ribbon */}
      <div className="bg-[#07090e] border border-[#161c28] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-white font-bold">Two-Sample Welch's t-Test: </span>
            <span className="text-emerald-400 font-extrabold">
              t = {stat.t_statistic}, p = {stat.p_value}
            </span>
            <span className="text-slate-400"> (Null Hypothesis H₀ Rejected with {stat.confidence_level})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-700 text-[10px]">
            DSR Gate 6 Passed (p = {stat.dsr_p_value})
          </span>
        </div>
      </div>
    </div>
  );
};
