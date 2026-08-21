import React, { useState, useEffect, useCallback } from 'react';
import { RegimeHeader } from './RegimeHeader';
import { RegimeControlRibbon } from './RegimeControlRibbon';
import { RegimePerformanceGrid, RegimeMetricItem } from './RegimePerformanceGrid';
import { MarkovTransitionMatrix } from './MarkovTransitionMatrix';
import { RegimeTimelineChart } from './RegimeTimelineChart';
import { StationaryDistributionCard } from './StationaryDistributionCard';
import { Activity } from 'lucide-react';

export const RegimeAnalysisPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('BB Reversion v4');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');

  const [regimeData, setRegimeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Regime Analysis Data
  const fetchRegimes = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/edge/regimes/matrix?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setRegimeData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedStrategy, selectedPair, selectedTimeframe]);

  useEffect(() => {
    fetchRegimes();
  }, [fetchRegimes]);

  const handleExportCSV = () => {
    const regimes: RegimeMetricItem[] = regimeData?.regimes || [];
    const headers = 'ID,Name,ExpectancyR,WinRatePct,ProfitFactor,MaxDrawdownPct,TradesCount,Status,Recommendation\n';
    const rows = regimes
      .map(
        (r) =>
          `${r.id},"${r.name}",${r.expectancy_r},${r.win_rate_pct},${r.profit_factor},${r.max_drawdown_pct},${r.trades_count},${r.edge_status},"${r.recommendation}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regime_analysis_${selectedStrategy}_${selectedPair}_${selectedTimeframe}.csv`;
    a.click();
  };

  const regimes: RegimeMetricItem[] = regimeData?.regimes || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Market Regime Classification & Markov Dynamics Suite</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Quantify strategy edge performance across 5 market volatility and trend regimes with empirical Markov transition dynamics
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <RegimeHeader
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        onRecompute={fetchRegimes}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <RegimeControlRibbon
          currentRegime={regimeData?.current_market_regime ?? 'Bullish Trend + High Volatility'}
          primeExpectancy={regimeData?.prime_edge_expectancy_r ?? 1.45}
          primeWinRate={regimeData?.prime_edge_win_rate_pct ?? 72.4}
          transitionEntropy={regimeData?.transition_entropy ?? 1.18}
          stationaryBullPct={regimeData?.stationary_distribution?.probabilities?.[0] ?? 49.0}
        />

        {/* Section 1: 5-Regime Performance Breakdown Grid */}
        <RegimePerformanceGrid regimes={regimes} />

        {/* Section 2: Markov Transition Matrix & Stationary Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <MarkovTransitionMatrix data={regimeData?.transition_matrix} />
          </div>

          <div className="lg:col-span-5">
            <StationaryDistributionCard data={regimeData?.stationary_distribution} />
          </div>
        </div>

        {/* Section 3: Regime Timeline Progression */}
        <RegimeTimelineChart timeline={regimeData?.timeline || []} />
      </div>
    </div>
  );
};
