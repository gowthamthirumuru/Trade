import React, { useState, useEffect, useCallback } from 'react';
import { ConditionHeader } from './ConditionHeader';
import { ConditionControlRibbon } from './ConditionControlRibbon';
import { ConditionLiftRanking, ConditionFeature } from './ConditionLiftRanking';
import { ConditionStackSimulator } from './ConditionStackSimulator';
import { ShapleyAttributionLab } from './ShapleyAttributionLab';
import { ConditionStabilityDecay } from './ConditionStabilityDecay';
import { Layers } from 'lucide-react';

export const ConditionAnalysisPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('BB Reversion v4');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [activeConditionIds, setActiveConditionIds] = useState<string[]>(['COND-01', 'COND-02']);

  const [attributionData, setAttributionData] = useState<any>(null);
  const [stackedData, setStackedData] = useState<any>(null);
  const [isLoadingAttribution, setIsLoadingAttribution] = useState(false);
  const [isLoadingStack, setIsLoadingStack] = useState(false);

  // 1. Fetch Attribution Data
  const fetchAttribution = useCallback(() => {
    setIsLoadingAttribution(true);
    fetch(`/api/v1/edge/conditions/attribution?strategy=${encodeURIComponent(selectedStrategy)}&pair=${encodeURIComponent(selectedPair)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAttributionData(data);
        setIsLoadingAttribution(false);
      })
      .catch(() => setIsLoadingAttribution(false));
  }, [selectedStrategy, selectedPair]);

  useEffect(() => {
    fetchAttribution();
  }, [fetchAttribution]);

  // 2. Simulate Active Condition Stack
  const simulateStack = useCallback(() => {
    setIsLoadingStack(true);
    fetch('/api/v1/edge/conditions/simulate-stack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy: selectedStrategy,
        pair: selectedPair,
        active_condition_ids: activeConditionIds,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStackedData(data);
        setIsLoadingStack(false);
      })
      .catch(() => setIsLoadingStack(false));
  }, [selectedStrategy, selectedPair, activeConditionIds]);

  useEffect(() => {
    simulateStack();
  }, [simulateStack]);

  // Toggle Single Condition
  const handleToggleCondition = (id: string) => {
    setActiveConditionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allConditions: ConditionFeature[] = attributionData?.features || [];

  const filteredConditions = allConditions.filter(
    (c) => selectedCategory === 'All Categories' || c.category === selectedCategory
  );

  const handleSelectAll = () => {
    setActiveConditionIds(allConditions.map((c) => c.id));
  };

  const handleDeselectAll = () => {
    setActiveConditionIds([]);
  };

  const handleSelectTop3 = () => {
    setActiveConditionIds(['COND-01', 'COND-02', 'COND-03']);
  };

  const handleExportCSV = () => {
    const headers = 'ConditionID,Name,Category,LiftPct,WinRateBefore,WinRateAfter,ExpBefore,ExpAfter,Importance,pValue,TradesCount\n';
    const rows = allConditions
      .map(
        (c) =>
          `${c.id},"${c.name}",${c.category},${c.lift_pct},${c.win_rate_before},${c.win_rate_after},${c.expectancy_before},${c.expectancy_after},${c.importance_score},${c.p_value},${c.trades_count}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `condition_attribution_${selectedStrategy}_${selectedPair}.csv`;
    a.click();
  };

  const stackedStats = stackedData?.stacked_stats || {
    n_trades: 284,
    win_rate_pct: 74.8,
    expectancy_r: 1.38,
    profit_factor: 2.94,
    net_lift_pct: 206.7,
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Condition Attribution & Feature Alpha Laboratory</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Measure marginal win-rate lift, Shapley feature importances, and simulate combinatorial filter stacks on live candles
          </p>
        </div>
      </div>

      {/* 2. Controls & Categories Ribbon */}
      <ConditionHeader
        selectedStrategy={selectedStrategy}
        onStrategyChange={setSelectedStrategy}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRecompute={fetchAttribution}
        onExportCSV={handleExportCSV}
        isLoading={isLoadingAttribution}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Ribbon */}
        <ConditionControlRibbon
          baseWinRate={attributionData?.base_win_rate_pct ?? 52.4}
          baseExpectancy={attributionData?.base_expectancy_r ?? 0.45}
          maxLiftFeature={attributionData?.max_lift_feature ?? 'London Session (+38.1% Lift)'}
          stackedWinRate={stackedStats.win_rate_pct}
          stackedExpectancy={stackedStats.expectancy_r}
          multicollinearityVif={attributionData?.multicollinearity_vif ?? 1.42}
        />

        {/* Section 1: Ranked Conditions & Interactive Stacking Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6">
            <ConditionLiftRanking
              conditions={filteredConditions}
              activeConditionIds={activeConditionIds}
              onToggleCondition={handleToggleCondition}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onSelectTop3={handleSelectTop3}
            />
          </div>

          <div className="lg:col-span-6">
            <ConditionStackSimulator
              curveData={stackedData?.cumulative_curve}
              stats={stackedStats}
              activeCount={activeConditionIds.length}
              isLoading={isLoadingStack}
            />
          </div>
        </div>

        {/* Section 2: Shapley Attribution & Rolling Alpha Decay */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5">
            <ShapleyAttributionLab conditions={allConditions} />
          </div>

          <div className="lg:col-span-7">
            <ConditionStabilityDecay decayWindows={attributionData?.rolling_decay} />
          </div>
        </div>
      </div>
    </div>
  );
};
