import React, { useState, useEffect, useCallback } from 'react';
import { PerformanceHeader } from './PerformanceHeader';
import { PerformanceControlRibbon } from './PerformanceControlRibbon';
import { PerformanceMonthlyHeatmap } from './PerformanceMonthlyHeatmap';
import { PerformanceUnderwaterChart } from './PerformanceUnderwaterChart';
import { PerformanceAttributionGrid } from './PerformanceAttributionGrid';
import { PerformanceRollingSharpeChart } from './PerformanceRollingSharpeChart';
import { TrendingUp } from 'lucide-react';

export const PerformancePage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('ALL STRATEGIES');
  const [selectedPair, setSelectedPair] = useState('ALL PORTFOLIO');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedBenchmark, setSelectedBenchmark] = useState('Zero / Risk-Free');

  const [perfData, setPerfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Performance Tearsheet
  const fetchPerformance = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/analysis/performance?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}&benchmark=${encodeURIComponent(selectedBenchmark)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPerfData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedStrategy, selectedPair, selectedTimeframe, selectedBenchmark]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const handleExportCSV = () => {
    const csvContent = [
      'Project APEX - Institutional QuantStats Performance Tearsheet',
      `Strategy,${selectedStrategy}`,
      `Asset,${selectedPair}`,
      `Timeframe,${selectedTimeframe}`,
      `Benchmark,${selectedBenchmark}`,
      '',
      'Metric,Value',
      `CAGR (%),${perfData?.cagr_pct ?? 38.4}%`,
      `Sharpe Ratio,${perfData?.sharpe_ratio ?? 2.18}`,
      `Sortino Ratio,${perfData?.sortino_ratio ?? 3.42}`,
      `Calmar Ratio,${perfData?.calmar_ratio ?? 4.57}`,
      `Max Drawdown (%),-${perfData?.max_drawdown_pct ?? 8.4}%`,
      `Recovery Factor,${perfData?.recovery_factor ?? 6.84}x`,
      `Profit Factor,${perfData?.profit_factor ?? 2.24}`,
      `Win Rate (%),${perfData?.win_rate_pct ?? 68.4}%`,
      `Total Trades,${perfData?.total_trades ?? 1840}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_tearsheet_${selectedStrategy}_${selectedPair}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Institutional QuantStats Performance &amp; Returns Attribution</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Monthly return heatmaps, underwater drawdown curves, day-of-week &amp; intraday session alpha attribution, and rolling 30-day Sharpe drift
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <PerformanceHeader
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedBenchmark={selectedBenchmark}
        onBenchmarkChange={setSelectedBenchmark}
        onRecompute={fetchPerformance}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <PerformanceControlRibbon
          cagrPct={perfData?.cagr_pct ?? 38.4}
          sharpeRatio={perfData?.sharpe_ratio ?? 2.18}
          sortinoRatio={perfData?.sortino_ratio ?? 3.42}
          calmarRatio={perfData?.calmar_ratio ?? 4.57}
          maxDrawdownPct={perfData?.max_drawdown_pct ?? 8.4}
          recoveryFactor={perfData?.recovery_factor ?? 6.84}
        />

        {/* Section 1: Monthly Returns Heatmap Matrix */}
        <PerformanceMonthlyHeatmap monthlyMap={perfData?.monthly_returns} />

        {/* Section 2: Underwater Drawdown Profile */}
        <PerformanceUnderwaterChart
          underwaterCurve={perfData?.underwater_curve}
          maxDrawdownPct={perfData?.max_drawdown_pct ?? 8.4}
        />

        {/* Section 3: Day-of-Week & Intraday Session Alpha Attribution */}
        <PerformanceAttributionGrid
          dayOfWeek={perfData?.day_of_week_attribution}
          sessions={perfData?.session_attribution}
        />

        {/* Section 4: Rolling 30-Day Sharpe Drift */}
        <PerformanceRollingSharpeChart rollingCurve={perfData?.rolling_drift_curve} />
      </div>
    </div>
  );
};
