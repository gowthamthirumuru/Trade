import React, { useState, useEffect, useCallback } from 'react';
import { StrategyComparisonHeader } from './StrategyComparisonHeader';
import { StrategyComparisonControlRibbon } from './StrategyComparisonControlRibbon';
import { StrategyComparisonRadarChart } from './StrategyComparisonRadarChart';
import { StrategyComparisonMetricsMatrix } from './StrategyComparisonMetricsMatrix';
import { StrategyComparisonEquityOverlay } from './StrategyComparisonEquityOverlay';
import { StrategyComparisonPairwiseCard } from './StrategyComparisonPairwiseCard';
import { GitCompare } from 'lucide-react';

export const StrategyComparisonPage: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedBenchmark, setSelectedBenchmark] = useState('Zero / Risk-Free');

  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Comparison Data
  const fetchComparison = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/analysis/compare?pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}&benchmark=${encodeURIComponent(selectedBenchmark)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setComparisonData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedPair, selectedTimeframe, selectedBenchmark]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  const handleExportCSV = () => {
    const strats = comparisonData?.strategies || [];
    const headers = 'Strategy,Sharpe,Sortino,ProfitFactor,WinRatePct,ExpectancyR,MaxDDPct,Calmar,WFERPct,SmoothnessR2,TradesCount,DragPct\n';
    const rows = strats
      .map(
        (s: any) =>
          `"${s.name}",${s.sharpe},${s.sortino ?? 0},${s.profit_factor},${s.win_rate},${s.expectancy_r ?? 0},${s.max_dd},${s.calmar ?? 0},${s.wfer},${s.smoothness ?? 0},${s.trades_count ?? 0},${s.drag_pct ?? 0}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy_comparison_${selectedPair}_${selectedTimeframe}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span>Multi-Strategy Radar &amp; Head-to-Head Comparison Suite</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Compare multi-attribute risk-adjusted radar profiles, normalized cumulative equity curves, pairwise alpha differentials, and quantitative performance matrices
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <StrategyComparisonHeader
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedBenchmark={selectedBenchmark}
        onBenchmarkChange={setSelectedBenchmark}
        onRecompute={fetchComparison}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <StrategyComparisonControlRibbon
          strategies={comparisonData?.strategies}
          topPerformer={comparisonData?.top_performer ?? 'BB Reversion v4'}
        />

        {/* Section 1: Multi-Attribute Radar & Metrics Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <StrategyComparisonRadarChart
              indicators={comparisonData?.radar_indicators}
              series={comparisonData?.radar_series}
            />
          </div>

          <div className="lg:col-span-7">
            <StrategyComparisonMetricsMatrix
              strategies={comparisonData?.strategies}
            />
          </div>
        </div>

        {/* Section 2: Normalized Equity Curves Overlay & Pairwise Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <StrategyComparisonEquityOverlay
              equityCurves={comparisonData?.equity_curves}
            />
          </div>

          <div className="lg:col-span-6">
            <StrategyComparisonPairwiseCard
              pairwiseMatrix={comparisonData?.pairwise_matrix}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
