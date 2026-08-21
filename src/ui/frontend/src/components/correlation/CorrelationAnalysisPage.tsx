import React, { useState, useEffect, useCallback } from 'react';
import { CorrelationHeader } from './CorrelationHeader';
import { CorrelationControlRibbon } from './CorrelationControlRibbon';
import { CorrelationHeatmap } from './CorrelationHeatmap';
import { PairwiseScatterLab } from './PairwiseScatterLab';
import { DiversificationAllocationCard } from './DiversificationAllocationCard';
import { RedundancyPruningCard } from './RedundancyPruningCard';
import { GitCompare } from 'lucide-react';

export const CorrelationAnalysisPage: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedMetric, setSelectedMetric] = useState('pearson');
  const [selectedGranularity, setSelectedGranularity] = useState('daily');
  const [selectedPairIndices, setSelectedPairIndices] = useState<[number, number]>([0, 1]);

  const [correlationData, setCorrelationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Correlation Suite Data
  const fetchCorrelations = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/edge/correlations?pair=${encodeURIComponent(selectedPair)}&metric=${encodeURIComponent(selectedMetric)}&granularity=${encodeURIComponent(selectedGranularity)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setCorrelationData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedPair, selectedMetric, selectedGranularity]);

  useEffect(() => {
    fetchCorrelations();
  }, [fetchCorrelations]);

  const handleSelectPair = (i: number, j: number) => {
    setSelectedPairIndices([i, j]);
  };

  const handleExportCSV = () => {
    const strategies: string[] = correlationData?.strategies || [];
    const matrix: number[][] = correlationData?.correlation_matrix || [];
    const header = 'Strategy,' + strategies.join(',') + '\n';
    const rows = strategies
      .map((s, idx) => `"${s}",` + (matrix[idx] ? matrix[idx].join(',') : ''))
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `correlation_matrix_${selectedPair}_${selectedMetric}_${selectedGranularity}.csv`;
    a.click();
  };

  const strategies: string[] = correlationData?.strategies || [];
  const matrix: number[][] = correlationData?.correlation_matrix || [];
  const stratA = strategies[selectedPairIndices[0]] || 'BB Reversion v4';
  const stratB = strategies[selectedPairIndices[1]] || 'Order Block v4';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-purple-400" />
            <span>Cross-Strategy Correlation & Portfolio Diversification Suite</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Measure pairwise return orthogonality, covariance matrices, and Choueifaty diversification frontiers across institutional trading models
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <CorrelationHeader
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        selectedGranularity={selectedGranularity}
        onGranularityChange={setSelectedGranularity}
        onRecompute={fetchCorrelations}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <CorrelationControlRibbon
          avgCorrelation={correlationData?.diversification_kpis?.average_cross_correlation ?? 0.18}
          varianceReductionPct={correlationData?.diversification_kpis?.portfolio_variance_reduction_pct ?? 34.2}
          diversificationRatio={correlationData?.diversification_kpis?.diversification_ratio ?? 1.48}
          effectiveBets={correlationData?.diversification_kpis?.effective_number_of_bets ?? 4.8}
          totalStrategies={correlationData?.diversification_kpis?.total_strategies ?? 6}
          redundantPairsCount={correlationData?.diversification_kpis?.redundant_pairs_count ?? 0}
        />

        {/* Section 1: Heatmap Matrix & Pairwise Scatter Lab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <CorrelationHeatmap
              strategies={strategies}
              matrix={matrix}
              selectedPairIndices={selectedPairIndices}
              onSelectPair={handleSelectPair}
            />
          </div>

          <div className="lg:col-span-5">
            <PairwiseScatterLab
              strategyA={stratA}
              strategyB={stratB}
              points={correlationData?.scatter_data?.points || []}
              rollingDrift={correlationData?.rolling_drift || []}
              beta={correlationData?.scatter_data?.beta ?? 0.25}
            />
          </div>
        </div>

        {/* Section 2: Diversification Frontier & Redundancy Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <DiversificationAllocationCard />
          </div>

          <div className="lg:col-span-5">
            <RedundancyPruningCard warnings={correlationData?.redundancy_warnings || []} />
          </div>
        </div>
      </div>
    </div>
  );
};
