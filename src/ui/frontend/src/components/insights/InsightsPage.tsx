import React, { useState, useEffect, useCallback } from 'react';
import { InsightsHeader } from './InsightsHeader';
import { InsightsControlRibbon } from './InsightsControlRibbon';
import { InsightsCardGrid, MarketInsightItem } from './InsightsCardGrid';
import { InsightsRegimeMatrix } from './InsightsRegimeMatrix';
import { Lightbulb } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedPair, setSelectedPair] = useState('ALL');

  const [insightsData, setInsightsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Market Insights Data
  const fetchInsights = useCallback(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/intelligence/insights?category=${encodeURIComponent(selectedCategory)}&severity=${encodeURIComponent(selectedSeverity)}&pair=${encodeURIComponent(selectedPair)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setInsightsData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedCategory, selectedSeverity, selectedPair]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const insightsList: MarketInsightItem[] = insightsData?.insights || [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto font-mono text-xs">
      {/* 1. Header Bar */}
      <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Automated Market Insights, Alpha Decay &amp; Regime Diagnostics</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Real-time monitoring of volatility expansions, strategy degradation alerts, cross-asset correlation shifts, and portfolio reallocation directives
          </p>
        </div>
      </div>

      {/* 2. Controls Ribbon */}
      <InsightsHeader
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSeverity={selectedSeverity}
        onSeverityChange={setSelectedSeverity}
        selectedPair={selectedPair}
        onPairChange={setSelectedPair}
        onRecompute={fetchInsights}
        isLoading={isLoading}
      />

      {/* 3. Main Content Views */}
      <div className="p-4 space-y-4 flex-1">
        {/* KPI Summary Ribbon */}
        <InsightsControlRibbon
          totalCount={insightsData?.total_count ?? 5}
          criticalWarningsCount={insightsData?.critical_warnings_count ?? 1}
          atrExpansionPct={insightsData?.atr_expansion_pct ?? 29.8}
          portfolioSharpeComposite={insightsData?.portfolio_sharpe_composite ?? 2.84}
          frictionDragPct={insightsData?.friction_drag_pct ?? 8.78}
          opportunitiesCount={insightsData?.opportunities_count ?? 1}
        />

        {/* Section 1: Insights Grid */}
        <InsightsCardGrid insights={insightsList} />

        {/* Section 2: Regime Matrix */}
        <InsightsRegimeMatrix />
      </div>
    </div>
  );
};
