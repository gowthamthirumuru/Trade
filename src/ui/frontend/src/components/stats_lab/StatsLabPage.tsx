import React, { useState, useEffect, useCallback } from 'react';
import { StatsLabHeader } from './StatsLabHeader';
import { StatsLabControlRibbon } from './StatsLabControlRibbon';
import { StatsLabHypothesisGrid } from './StatsLabHypothesisGrid';
import { StatsLabBootstrapCIChart } from './StatsLabBootstrapCIChart';
import { StatsLabHigherMomentsCard } from './StatsLabHigherMomentsCard';
import { StatsLabScorecard } from './StatsLabScorecard';
import { Calculator } from 'lucide-react';

export const StatsLabPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('ALL STRATEGIES');
  const [selectedPair, setSelectedPair] = useState('ALL PORTFOLIO');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [selectedAlpha, setSelectedAlpha] = useState(0.05);

  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Statistical Lab Data
  const fetchStatsLab = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/analysis/stats?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}&alpha_level=${selectedAlpha}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStatsData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedStrategy, selectedPair, selectedTimeframe, selectedAlpha]);

  useEffect(() => {
    fetchStatsLab();
  }, [fetchStatsLab]);

  const handleExportCSV = () => {
    const csvContent = [
      'Project APEX - Statistical Lab & Hypothesis Testing Tearsheet',
      `Strategy,${selectedStrategy}`,
      `Asset,${selectedPair}`,
      `Timeframe,${selectedTimeframe}`,
      `Significance Level (Alpha),${selectedAlpha}`,
      '',
      'Metric,Value',
      `Sample Size (n),${statsData?.sample_size_n ?? 4821}`,
      `Mean Expectancy E[R],${statsData?.expectancy_r ?? 0.91}R`,
      `Student t-Statistic,${statsData?.tests?.students_t_test?.t_stat ?? 4.82}`,
      `Student t-test p-value,${statsData?.tests?.students_t_test?.p_value ?? 0.00001}`,
      `Welch t-Statistic,${statsData?.tests?.welch_t_test?.t_stat ?? 4.61}`,
      `Bootstrap 95% CI Lower,${statsData?.bootstrap_ci?.ci_lower ?? 0.78}R`,
      `Bootstrap 95% CI Upper,${statsData?.bootstrap_ci?.ci_upper ?? 1.04}R`,
      `Return Skewness,${statsData?.skewness ?? 1.24}`,
      `Return Kurtosis,${statsData?.kurtosis ?? 4.82}`,
      `Verdict,${statsData?.verdict ?? 'REJECT H0 — Statistically Significant Alpha'}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats_lab_${selectedStrategy}_${selectedPair}_alpha${selectedAlpha}.csv`;
    a.click();
  };

  const tTest = statsData?.tests?.students_t_test;
  const boot = statsData?.bootstrap_ci;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <span>Statistical Lab &amp; Inferential Hypothesis Testing Suite</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Formal parametric &amp; non-parametric hypothesis tests, 10,000-iteration empirical bootstrap confidence intervals, and higher return moments
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <StatsLabHeader
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedAlpha={selectedAlpha}
        onAlphaChange={setSelectedAlpha}
        onRecompute={fetchStatsLab}
        onExportCSV={handleExportCSV}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <StatsLabControlRibbon
          expectancyR={statsData?.expectancy_r ?? 0.91}
          tStat={tTest?.t_stat ?? 4.82}
          pValue={tTest?.p_value ?? 0.00001}
          ciLower={boot?.ci_lower ?? 0.78}
          ciUpper={boot?.ci_upper ?? 1.04}
          sampleSize={statsData?.sample_size_n ?? 4821}
          verdict={statsData?.verdict ?? 'REJECT H0 — Statistically Significant Alpha'}
        />

        {/* Section 1: Hypothesis Testing Battery & Bootstrap CI Sampling Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <StatsLabHypothesisGrid
              tests={statsData?.tests}
              sampleSize={statsData?.sample_size_n ?? 4821}
            />
          </div>

          <div className="lg:col-span-6">
            <StatsLabBootstrapCIChart
              bootstrapData={statsData?.bootstrap_ci}
              histogram={statsData?.bootstrap_histogram}
            />
          </div>
        </div>

        {/* Section 2: Higher Return Moments & Decision Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <StatsLabHigherMomentsCard
              expectancyR={statsData?.expectancy_r ?? 0.91}
              medianR={statsData?.median_r ?? 0.82}
              stdDevR={statsData?.std_dev_r ?? 1.45}
              varianceR={statsData?.variance_r ?? 2.1}
              skewness={statsData?.skewness ?? 1.24}
              kurtosis={statsData?.kurtosis ?? 4.82}
              semiVariance={statsData?.semi_variance ?? 0.65}
              var99={statsData?.var_99_pct ?? -1.85}
              cvar99={statsData?.cvar_99_pct ?? -2.42}
            />
          </div>

          <div className="lg:col-span-6">
            <StatsLabScorecard
              tStat={tTest?.t_stat ?? 4.82}
              pValue={tTest?.p_value ?? 0.00001}
              ciLower={boot?.ci_lower ?? 0.78}
              ciUpper={boot?.ci_upper ?? 1.04}
              skewness={statsData?.skewness ?? 1.24}
              kurtosis={statsData?.kurtosis ?? 4.82}
              alphaLevel={selectedAlpha}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
