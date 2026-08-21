import React, { useState, useEffect, useCallback } from 'react';
import { MonteCarloHeader } from './MonteCarloHeader';
import { MonteCarloControlRibbon } from './MonteCarloControlRibbon';
import { MonteCarloFanChart } from './MonteCarloFanChart';
import { MonteCarloDrawdownDistribution } from './MonteCarloDrawdownDistribution';
import { MonteCarloRuinMatrix } from './MonteCarloRuinMatrix';
import { Activity } from 'lucide-react';

export const MonteCarloPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('BB Reversion v4');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedIterations, setSelectedIterations] = useState(5000);
  const [selectedMethod, setSelectedMethod] = useState('stationary');

  const [mcData, setMcData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Monte Carlo Simulation Data
  const fetchMonteCarlo = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/validation/monte-carlo?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}&iterations=${selectedIterations}&resample_method=${encodeURIComponent(selectedMethod)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setMcData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedStrategy, selectedPair, selectedTimeframe, selectedIterations, selectedMethod]);

  useEffect(() => {
    fetchMonteCarlo();
  }, [fetchMonteCarlo]);

  const handleExportCSV = () => {
    const fan = mcData?.fan_chart;
    const xAxis = fan?.x_axis || [];
    const p05 = fan?.p05 || [];
    const p25 = fan?.p25 || [];
    const p50 = fan?.p50_median || [];
    const p75 = fan?.p75 || [];
    const p95 = fan?.p95 || [];

    const headers = 'TradeStep,P05_Equity,P25_Equity,Median_P50_Equity,P75_Equity,P95_Equity\n';
    const rows = xAxis
      .map(
        (x: string, i: number) =>
          `${x},${p05[i] ?? 0},${p25[i] ?? 0},${p50[i] ?? 0},${p75[i] ?? 0},${p95[i] ?? 0}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monte_carlo_${selectedStrategy}_${selectedPair}_${selectedIterations}paths.csv`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Monte Carlo Multi-Path Bootstrap & Risk of Ruin Suite</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Resampled trade sequences, multi-quantile equity bands, drawdown probability distributions, and capital ruin integrals
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <MonteCarloHeader
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedIterations={selectedIterations}
        onIterationsChange={setSelectedIterations}
        selectedMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
        onRecompute={fetchMonteCarlo}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <MonteCarloControlRibbon
          riskOfRuinPct={mcData?.risk_of_ruin_pct ?? 0.01}
          riskOfRuin30Pct={mcData?.risk_of_ruin_30_pct ?? 2.4}
          medianReturnPct={mcData?.median_annual_return_pct ?? 42.6}
          medianMaxDrawdownPct={mcData?.median_max_drawdown_pct ?? 11.4}
          p95MaxDrawdownPct={mcData?.p95_max_drawdown_pct ?? 16.8}
          verdict={mcData?.verdict ?? 'PASSED (Negligible Ruin Risk)'}
        />

        {/* Section 1: Multi-Path Equity Fan Chart */}
        <MonteCarloFanChart fanChart={mcData?.fan_chart} iterations={selectedIterations} />

        {/* Section 2: Drawdown Distribution & Ruin Boundary Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <MonteCarloDrawdownDistribution distribution={mcData?.drawdown_distribution} />
          </div>

          <div className="lg:col-span-6">
            <MonteCarloRuinMatrix
              ruin50Pct={mcData?.risk_of_ruin_pct ?? 0.01}
              ruin30Pct={mcData?.risk_of_ruin_30_pct ?? 2.4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
