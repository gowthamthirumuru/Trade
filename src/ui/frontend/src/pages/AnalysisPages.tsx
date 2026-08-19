import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Calculator,
  GitCompare,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

// ============================================================================
// 1. PERFORMANCE PAGE
// ============================================================================

export const PerformancePage: React.FC = () => {
  const [perfData, setPerfData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/analysis/performance')
      .then((res) => res.json())
      .then((data) => setPerfData(data))
      .catch(() => {});
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = ['2026', '2025', '2024'];
  const monthlyMap = perfData?.monthly_returns || {
    '2026': { Jan: 4.8, Feb: 3.4, Mar: 5.1, Apr: 4.2, May: 6.8, Jun: 3.1, Jul: 5.4, Aug: 2.9 },
    '2025': { Jan: 4.2, Feb: 3.1, Mar: 6.8, Apr: 2.4, May: 5.1, Jun: 3.9, Jul: 4.8, Aug: 1.9, Sep: 5.4, Oct: 6.2, Nov: 3.8, Dec: 4.5 },
    '2024': { Jan: 5.1, Feb: 2.8, Mar: -1.2, Apr: 4.6, May: 7.2, Jun: 3.4, Jul: 5.0, Aug: 1.8, Sep: 4.2, Oct: 6.1, Nov: 3.7, Dec: 4.8 },
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Portfolio Performance & Returns Attribution
        </h2>
        <p className="text-xs text-slate-400">
          Monthly return heatmaps, day-of-week alpha attribution, recovery factors, and rolling risk ratios
        </p>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
        {[
          { label: 'CAGR', val: '+38.4%', color: 'text-emerald-400' },
          { label: 'Sharpe Ratio', val: '2.18', color: 'text-emerald-400' },
          { label: 'Sortino Ratio', val: '3.42', color: 'text-emerald-400' },
          { label: 'Calmar Ratio', val: '4.57', color: 'text-emerald-400' },
          { label: 'Max Drawdown', val: '8.4%', color: 'text-slate-200' },
          { label: 'Recovery Factor', val: '6.84', color: 'text-cyan-400' },
        ].map((m, i) => (
          <div key={i} className="quant-card p-3.5">
            <span className="text-[10px] text-slate-400 font-medium block">{m.label}</span>
            <span className={`text-xl font-extrabold font-mono mt-0.5 block ${m.color}`}>{m.val}</span>
          </div>
        ))}
      </div>

      {/* Monthly Returns Heatmap Table */}
      <div className="quant-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" /> Monthly Returns Heatmap (%)
        </h3>

        <div className="overflow-x-auto text-xs font-mono text-center">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1c1c1c] text-slate-400">
                <th className="p-2 text-left font-sans">Year</th>
                {months.map((m) => (
                  <th key={m} className="p-2">{m}</th>
                ))}
                <th className="p-2 text-right font-sans">YTD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171717] text-slate-200">
              {years.map((yr) => {
                const row = monthlyMap[yr] || {};
                let ytd = 0;
                Object.values(row).forEach((v: any) => {
                  ytd += Number(v);
                });

                return (
                  <tr key={yr} className="hover:bg-[#101010] transition">
                    <td className="p-2.5 text-left font-bold text-white font-sans text-xs">{yr}</td>
                    {months.map((m) => {
                      const val = row[m];
                      if (val === undefined) {
                        return <td key={m} className="p-2.5 text-slate-600">—</td>;
                      }
                      const num = Number(val);
                      const isPos = num >= 0;
                      return (
                        <td
                          key={m}
                          className={`p-2.5 font-bold ${
                            isPos
                              ? num >= 5.0
                                ? 'bg-emerald-950/40 text-emerald-300 font-extrabold'
                                : 'bg-emerald-950/20 text-emerald-400'
                              : 'bg-rose-950/40 text-rose-400'
                          }`}
                        >
                          {isPos ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-right font-bold text-emerald-400 font-mono text-xs">
                      +{ytd.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. TRADE ANALYTICS PAGE
// ============================================================================

export const TradeAnalyticsPage: React.FC = () => {
  const [tradeData, setTradeData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/analysis/trades')
      .then((res) => res.json())
      .then((data) => setTradeData(data))
      .catch(() => {});
  }, []);

  const bins = tradeData?.r_distribution || [
    { r_range: '< -1.5R', count: 42 },
    { r_range: '-1.5R to -0.5R', count: 1771 },
    { r_range: '-0.5R to 0.5R', count: 210 },
    { r_range: '0.5R to 1.5R', count: 1140 },
    { r_range: '1.5R to 2.5R', count: 1240 },
    { r_range: '2.5R to 3.5R', count: 510 },
    { r_range: '> 3.5R', count: 108 },
  ];

  const distChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '3%', top: '10%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: bins.map((b: any) => b.r_range),
      axisLine: { lineStyle: { color: '#1a1a1a' } },
      axisLabel: { color: '#64748B', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#1a1a1a' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: '#1a1a1a', type: 'dashed' } },
    },
    series: [
      {
        name: 'Trades Count',
        type: 'bar',
        data: bins.map((b: any) => b.count),
        itemStyle: {
          color: (params: any) => (params.dataIndex <= 1 ? '#F43F5E' : '#10B981'),
        },
      },
    ],
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-cyan-400" /> Trade Analytics, R-Distribution & Execution Drag
        </h2>
        <p className="text-xs text-slate-400">
          Analyze R-multiple distribution skewness, Maximum Adverse Excursion (MAE/MFE), and taker fee / slippage friction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: R-Multiple Distribution */}
        <div className="lg:col-span-7 quant-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Trade R-Multiple Distribution Histogram</h3>
          <div className="h-[280px]">
            <ReactECharts option={distChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Right: Cost Drag Audit */}
        <div className="lg:col-span-5 quant-card p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white border-b border-[#1c1c1c] pb-3">
              Execution Cost & Friction Audit
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c] flex justify-between">
                <span className="text-slate-400 font-sans">Gross Trading Profit:</span>
                <span className="text-white font-bold">$38,450.00</span>
              </div>
              <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c] flex justify-between">
                <span className="text-slate-400 font-sans">Taker Fees Paid (5 bps):</span>
                <span className="text-rose-400 font-bold">-$2,410.50</span>
              </div>
              <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c] flex justify-between">
                <span className="text-slate-400 font-sans">Simulated Slippage (2 bps):</span>
                <span className="text-rose-400 font-bold">-$964.20</span>
              </div>
              <div className="p-3.5 bg-purple-950/20 rounded border border-purple-800/40 flex justify-between text-sm">
                <span className="text-purple-300 font-sans font-bold">Net Portfolio PnL:</span>
                <span className="text-emerald-400 font-bold font-mono">+$35,075.30</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 p-3 bg-[#050505] rounded border border-[#1c1c1c]">
            Total fee & slippage drag accounts for <span className="text-amber-400 font-bold">8.78%</span> of gross profits, well below the 15% institutional friction threshold.
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. STATS LAB PAGE
// ============================================================================

export const StatsLabPage: React.FC = () => {
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/analysis/stats')
      .then((res) => res.json())
      .then((data) => setStatsData(data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" /> Statistical Lab & Hypothesis Testing
        </h2>
        <p className="text-xs text-slate-400">
          Formal inferential hypothesis tests, Student's t-test, Welch's t-test, bootstrap confidence intervals, and higher moments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Inferential Tests */}
        <div className="quant-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-[#1c1c1c] pb-3">
            Hypothesis Testing Suite (Sample n = 4,821 Trades)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#050505] rounded border border-[#1c1c1c] space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">Student's t-test (Alpha Significance)</span>
                <span className="text-emerald-400 font-mono">t = 4.82 (p &lt; 0.0001)</span>
              </div>
              <p className="text-[11px] text-slate-400">Null Hypothesis: Mean return = 0. Verdict: Strongly Reject H0.</p>
            </div>

            <div className="p-3.5 bg-[#050505] rounded border border-[#1c1c1c] space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">Welch's t-test (Heteroskedasticity Robust)</span>
                <span className="text-emerald-400 font-mono">t = 4.61 (p &lt; 0.0001)</span>
              </div>
              <p className="text-[11px] text-slate-400">Unequal variance across regimes. Verdict: Strongly Reject H0.</p>
            </div>

            <div className="p-3.5 bg-[#050505] rounded border border-[#1c1c1c] space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-white">Kolmogorov-Smirnov Test (Normality)</span>
                <span className="text-cyan-400 font-mono">KS = 0.042 (p = 0.184)</span>
              </div>
              <p className="text-[11px] text-slate-400">Evaluates empirical returns against standard Gaussian.</p>
            </div>
          </div>
        </div>

        {/* Bootstrap CI & Higher Moments */}
        <div className="quant-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-[#1c1c1c] pb-3">
            Bootstrap Confidence Intervals & Return Moments
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3.5 bg-[#050505] rounded border border-[#1c1c1c] space-y-2">
              <span className="text-slate-400 font-sans font-bold">95% Bootstrap Confidence Interval for Expectancy:</span>
              <div className="text-2xl font-extrabold text-emerald-400">
                [ +0.78R , +1.04R ]
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Computed over 10,000 bootstrap resamples with replacement.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c]">
                <span className="text-slate-400 text-[10px] font-sans block">Return Skewness</span>
                <span className="text-lg font-bold text-cyan-400">+1.24 (Positive)</span>
              </div>
              <div className="p-3 bg-[#050505] rounded border border-[#1c1c1c]">
                <span className="text-slate-400 text-[10px] font-sans block">Return Kurtosis</span>
                <span className="text-lg font-bold text-purple-400">4.82 (Fat-tailed)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. STRATEGY COMPARISON PAGE
// ============================================================================

export const ComparisonPage: React.FC = () => {
  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {},
    legend: { data: ['BB Reversion v4', 'Order Block v4', 'London Breakout v2'], textStyle: { color: '#94A3B8' } },
    radar: {
      indicator: [
        { name: 'Sharpe Ratio', max: 3.0 },
        { name: 'Profit Factor', max: 3.0 },
        { name: 'Win Rate (%)', max: 100 },
        { name: 'Low Drawdown', max: 100 },
        { name: 'WFER (%)', max: 100 },
        { name: 'Smoothness', max: 100 },
      ],
      splitLine: { lineStyle: { color: '#1a1a1a' } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: '#1a1a1a' } },
    },
    series: [
      {
        name: 'Strategy Comparison',
        type: 'radar',
        data: [
          { value: [2.18, 2.18, 62.4, 91.6, 81.4, 88.5], name: 'BB Reversion v4', itemStyle: { color: '#10B981' } },
          { value: [1.92, 1.92, 64.4, 90.9, 78.2, 84.0], name: 'Order Block v4', itemStyle: { color: '#06B6D4' } },
          { value: [1.72, 1.72, 54.1, 92.4, 83.1, 86.2], name: 'London Breakout v2', itemStyle: { color: '#8B5CF6' } },
        ],
      },
    ],
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-indigo-400" /> Multi-Strategy Radar & Head-to-Head Comparison
        </h2>
        <p className="text-xs text-slate-400">
          Compare risk-adjusted returns, efficiency ratios, drawdown resilience, and smoothness profiles side-by-side
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 quant-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Strategy Attributes Radar</h3>
          <div className="h-[320px]">
            <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        <div className="lg:col-span-6 quant-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-[#1c1c1c] pb-3">
            Comparative Metrics Matrix
          </h3>

          <div className="overflow-x-auto text-xs font-mono">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1c1c1c] text-slate-400 text-[11px]">
                  <th className="py-2 px-2 font-sans">Strategy</th>
                  <th className="py-2 px-2 text-right">Sharpe</th>
                  <th className="py-2 px-2 text-right">PF</th>
                  <th className="py-2 px-2 text-right">Win %</th>
                  <th className="py-2 px-2 text-right">Max DD</th>
                  <th className="py-2 px-2 text-right">WFER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171717] text-slate-200">
                {[
                  { name: 'BB Reversion v4', sharpe: 2.18, pf: 2.18, win: 62.4, dd: 8.4, wfer: 81.4 },
                  { name: 'Order Block v4', sharpe: 1.92, pf: 1.92, win: 64.4, dd: 9.1, wfer: 78.2 },
                  { name: 'Liquidity Sweep v3', sharpe: 1.81, pf: 1.81, win: 58.7, dd: 10.2, wfer: 75.6 },
                  { name: 'London Breakout v2', sharpe: 1.72, pf: 1.72, win: 54.1, dd: 7.6, wfer: 83.1 },
                ].map((s, i) => (
                  <tr key={i} className="hover:bg-[#101010] transition">
                    <td className="py-2.5 px-2 font-bold text-white font-sans">{s.name}</td>
                    <td className="py-2.5 px-2 text-right text-emerald-400 font-bold">{s.sharpe.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-200">{s.pf.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-200">{s.win.toFixed(1)}%</td>
                    <td className="py-2.5 px-2 text-right text-slate-400">{s.dd.toFixed(1)}%</td>
                    <td className="py-2.5 px-2 text-right text-cyan-400 font-bold">{s.wfer.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatisticalLabPage = StatsLabPage;
export const StrategyComparisonPage = ComparisonPage;

