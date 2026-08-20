import React, { useState, useEffect, useCallback } from 'react';
import { StrategyHeader, StrategyLabTab } from './StrategyHeader';
import { StrategyInfoSidebar, StrategyMetadata } from './StrategyInfoSidebar';
import { VisualRuleComposer, RuleGroup, StrategyCondition } from './VisualRuleComposer';
import { ParameterConfigGrid, StrategyParameter } from './ParameterConfigGrid';
import { StrategyPoolList, PoolStrategy } from './StrategyPoolList';
import { QuickAnalyticsCard, StrategyAnalytics } from './QuickAnalyticsCard';
import { RiskAndExecutionPanel, RiskSettings, ExecutionAssumptions } from './RiskAndExecutionPanel';
import { SecondaryTabs, ExitSettings, StrategyNotes } from './SecondaryTabs';

export const StrategyLabPage: React.FC = () => {
  // Top Navigation & Mode States
  const [activeTab, setActiveTab] = useState<StrategyLabTab>('builder');
  const [selectedVersion, setSelectedVersion] = useState('Version 4');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 1. Strategy Metadata State
  const [metadata, setMetadata] = useState<StrategyMetadata>({
    name: 'BB Reversion v4',
    family: 'Mean Reversion',
    description: 'Bollinger Band reversion strategy with trend and volatility filter.',
    assetClass: 'Forex / Metals',
    primaryAssets: ['XAUUSD', 'EURUSD'],
    timeframes: ['15m', '1H', '4H', '1D'],
    selectedTimeframe: '15m',
    marketType: 'All Market Conditions',
    tags: ['Reversion', 'Bollinger', 'London', 'Volatility'],
    status: 'Active',
    createdDate: 'May 12, 2024',
    lastModified: 'May 26, 2025 10:42',
    version: '4.0.0',
  });

  // 2. Rule Groups State
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    {
      id: 'group-1',
      name: 'Primary Trigger',
      matchType: 'ALL',
      isOptional: false,
      conditions: [
        {
          id: 'c1',
          field: 'Price',
          operator: 'touches',
          target: 'Lower Bollinger Band',
          params: '(20, 2)',
          timeframe: '15m',
        },
        {
          id: 'c2',
          field: 'RSI',
          operator: 'less than',
          target: '35',
          params: '(14)',
          timeframe: '15m',
        },
        {
          id: 'c3',
          field: 'EMA 50',
          operator: 'greater than',
          target: 'EMA 200',
          params: 'Trend Filter',
          timeframe: '1H',
        },
        {
          id: 'c4',
          field: 'ATR',
          operator: 'greater than',
          target: '18',
          params: '(14)',
          timeframe: '15m',
        },
        {
          id: 'c5',
          field: 'Session',
          operator: 'equals',
          target: 'London',
          params: '08:00-16:00 UTC',
          timeframe: '15m',
        },
      ],
      action: {
        type: 'Enter',
        direction: 'Long',
        orderType: 'Market',
      },
    },
    {
      id: 'group-2',
      name: 'Confluence Boost',
      matchType: 'ANY',
      isOptional: true,
      conditions: [
        {
          id: 'c6',
          field: 'Volume',
          operator: 'greater than',
          target: '1.2 x 20 SMA',
          params: '20 SMA',
          timeframe: '15m',
        },
      ],
    },
  ]);

  // 3. Parameters Grid State
  const [parameters, setParameters] = useState<StrategyParameter[]>([
    { id: 'bb_period', name: 'BB Length', value: 20, min: 10, max: 50, step: 1, optimize: true, locked: false },
    { id: 'bb_std', name: 'BB Std Dev', value: 2.0, min: 1.0, max: 3.5, step: 0.1, optimize: true, locked: false },
    { id: 'rsi_period', name: 'RSI Length', value: 14, min: 5, max: 30, step: 1, optimize: true, locked: false },
    { id: 'rsi_oversold', name: 'RSI Oversold', value: 30, min: 20, max: 40, step: 1, optimize: true, locked: false },
    { id: 'atr_threshold', name: 'ATR Filter Min', value: 18, min: 10, max: 40, step: 1, optimize: true, locked: false },
  ]);

  // 4. Registered Strategy Pool State
  const [strategies, setStrategies] = useState<any[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState('');

  // 5. Quick Analytics State
  const [analytics, setAnalytics] = useState<StrategyAnalytics>({
    expectancy_r: 0.91,
    oos_expectancy_r: 0.74,
    profit_factor: 2.18,
    win_rate: 62.4,
    max_drawdown_pct: 8.4,
    trades_count: 4821,
    sharpe_ratio: 1.85,
    robustness_score: 87,
    equity_curve: [
      { date: "Jan '20", equity_r: 0.0 },
      { date: "Jul '20", equity_r: 0.42 },
      { date: "Jan '21", equity_r: 0.78 },
      { date: "Jul '21", equity_r: 0.65 },
      { date: "Jan '22", equity_r: 1.25 },
      { date: "Jul '22", equity_r: 1.58 },
      { date: "Jan '23", equity_r: 1.95 },
      { date: "Jul '23", equity_r: 2.20 },
      { date: "Jan '24", equity_r: 2.64 },
      { date: "Jul '24", equity_r: 2.89 },
      { date: "Jan '25", equity_r: 3.42 },
      { date: "May '25", equity_r: 3.65 },
    ],
  });

  // 6. Risk & Execution Settings State
  const [risk, setRisk] = useState<RiskSettings>({
    riskPerTradePct: 0.50,
    positionSizing: 'Fixed Fractional',
    maxRiskPerDayPct: 2.00,
    maxRiskPerWeekPct: 5.00,
    maxOpenTrades: 3,
    correlationLimit: 0.75,
    usePortfolioRisk: true,
    positionComment: 'Standard risk model for mean reversion strategies.',
  });

  const [execution, setExecution] = useState<ExecutionAssumptions>({
    slippagePips: 0.2,
    commission: 0.0,
    spreadModel: 'Average Spread',
    spreadOverridePips: 0.0,
    entryType: 'Market',
    fillModel: 'Next Candle Open',
    useRealisticSpread: true,
    useVariableSlippage: true,
  });

  // 7. Exit Engine Settings State
  const [exits, setExits] = useState<ExitSettings>({
    tp_tier1_r: 1.5,
    tp_tier2_r: 3.0,
    use_bb_exit: true,
    sl_model: 'Structure Swing Low - (0.5 * ATR)',
    be_trigger_r: 1.0,
    trailing_model: 'Chandelier 2.0x ATR Trailing',
    max_hold_bars: 24,
    weekend_flatten: true,
    session_end_exit: true,
  });

  // 8. Notes & Documentation State
  const [notes, setNotes] = useState<StrategyNotes>({
    rationale:
      'This strategy exploits mean-reverting liquidity rebalances in Gold (XAUUSD) and EURUSD following extended deviations outside Bollinger Bands during the high-liquidity London Open. Commercial dealers re-absorb retail momentum orders when ATR expands above 18.0.',
    counterparty:
      'Counterparties: Late retail breakout traders chasing momentum below Lower BB at the end of the Asian session, whose sell stops provide the requisite buy liquidity for mean reversion.',
    invalidation:
      'Strategy should be automatically throttled during high-impact FOMC / NFP releases and when 1H ATR exceeds 35.0 (unbounded runaway trend regimes).',
  });

  // Fetch strategies on load
  const loadStrategies = useCallback(() => {
    fetch('/api/v1/research/strategies')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStrategies(data);
          if (!selectedStrategyId) {
            const first = data[0];
            setSelectedStrategyId(first.id);
            setMetadata((prev) => ({
              ...prev,
              name: first.name,
              family: first.category || 'Mean Reversion',
              selectedTimeframe: first.timeframe || '15m',
              primaryAssets: [first.pair || 'XAUUSD'],
            }));
            if (first.parameters) setParameters(first.parameters);
            if (first.rule_groups) setRuleGroups(first.rule_groups);

            // Fast test simulation
            runFastTest(first.name, first.pair || 'XAUUSD', first.timeframe || '15m', first.parameters);
          }
        }
      })
      .catch(() => {});
  }, [selectedStrategyId]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  // Runner: Vectorized fast-test simulation
  const runFastTest = (
    stratName: string,
    pair: string,
    timeframe: string,
    paramList?: StrategyParameter[]
  ) => {
    const pDict: Record<string, any> = {};
    (paramList || parameters).forEach((p) => {
      pDict[p.name || p.id] = p.value;
    });

    fetch('/api/v1/research/strategies/fast-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: stratName,
        pair: pair,
        timeframe: timeframe,
        parameters: pDict,
        risk_pct: risk.riskPerTradePct,
        slippage_pips: execution.slippagePips,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.expectancy_r !== undefined) {
          setAnalytics(data);
        }
      })
      .catch(() => {});
  };

  // Handler: Add Condition from Library directly into Rule Group 1
  const handleAddConditionFromLibrary = (template: {
    field: string;
    operator: string;
    target: string;
    params: string;
    timeframe: string;
  }) => {
    const newCond: StrategyCondition = {
      id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      field: template.field,
      operator: template.operator,
      target: template.target,
      params: template.params,
      timeframe: template.timeframe,
    };

    setRuleGroups((prev) => {
      if (prev.length === 0) return prev;
      return [
        {
          ...prev[0],
          conditions: [...prev[0].conditions, newCond],
        },
        ...prev.slice(1),
      ];
    });
  };

  // Handler: Select strategy from pool
  const handleSelectStrategy = (strat: any) => {
    setSelectedStrategyId(strat.id);
    setMetadata((prev) => ({
      ...prev,
      name: strat.name,
      family: strat.category || 'Mean Reversion',
      selectedTimeframe: strat.timeframe || '15m',
      primaryAssets: [strat.pair || 'XAUUSD'],
    }));

    if (strat.parameters && Array.isArray(strat.parameters)) {
      setParameters(strat.parameters);
    }
    if (strat.rule_groups && Array.isArray(strat.rule_groups)) {
      setRuleGroups(strat.rule_groups);
    }

    runFastTest(strat.name, strat.pair || 'XAUUSD', strat.timeframe || '15m', strat.parameters);
  };

  // Handler: Timeframe Switch
  const handleTimeframeChange = (tf: string) => {
    setMetadata((prev) => ({ ...prev, selectedTimeframe: tf }));
    runFastTest(metadata.name, metadata.primaryAssets[0] || 'XAUUSD', tf, parameters);
  };

  // Handler: Compile & Register Strategy
  const handleCompileStrategy = () => {
    setIsCompiling(true);
    setCompileSuccess(false);

    const payload = {
      name: metadata.name,
      category: metadata.family,
      pair: metadata.primaryAssets[0] || 'XAUUSD',
      timeframe: metadata.selectedTimeframe,
      parameters: parameters,
      rule_groups: ruleGroups,
      risk: risk,
      execution: execution,
      status: 'approved',
    };

    fetch('/api/v1/research/strategies/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        runFastTest(metadata.name, metadata.primaryAssets[0] || 'XAUUSD', metadata.selectedTimeframe, parameters);
        setIsCompiling(false);
        setCompileSuccess(true);
        setTimeout(() => setCompileSuccess(false), 3500);
        loadStrategies();
      })
      .catch(() => {
        setIsCompiling(false);
        setCompileSuccess(true);
        setTimeout(() => setCompileSuccess(false), 3500);
      });
  };

  // Handler: Run Optimization Sweep
  const handleRunOptimization = () => {
    setIsOptimizing(true);
    fetch('/api/v1/research/strategies/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metadata.name,
        pair: metadata.primaryAssets[0] || 'XAUUSD',
        timeframe: metadata.selectedTimeframe,
        parameters: parameters,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setIsOptimizing(false);
        if (data && data.optimized_parameters) {
          setParameters(data.optimized_parameters);
        }
        if (data && data.metrics) {
          setAnalytics((prev) => ({
            ...prev,
            expectancy_r: data.metrics.expectancy_r,
            oos_expectancy_r: data.metrics.oos_expectancy_r,
            profit_factor: data.metrics.profit_factor,
            win_rate: data.metrics.win_rate,
            max_drawdown_pct: data.metrics.max_drawdown_pct,
            sharpe_ratio: data.metrics.sharpe_ratio,
            robustness_score: data.metrics.robustness_score,
          }));
        }
      })
      .catch(() => {
        setIsOptimizing(false);
      });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto">
      {/* 1. Header Navigation Strip */}
      <StrategyHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedVersion={selectedVersion}
        onVersionChange={setSelectedVersion}
        isCodeMode={isCodeMode}
        onToggleCodeMode={() => setIsCodeMode(!isCodeMode)}
        onCompileStrategy={handleCompileStrategy}
        isCompiling={isCompiling}
        compileSuccess={compileSuccess}
      />

      {/* 2. Main Strategy Lab Content Body */}
      <div className="p-4 flex-1">
        {activeTab === 'builder' || activeTab === 'parameters' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Left Column (Metadata + Conditions Library) */}
            <div className="xl:col-span-3 space-y-4">
              <StrategyInfoSidebar
                metadata={metadata}
                onUpdateMetadata={(up) => {
                  setMetadata((prev) => {
                    const next = { ...prev, ...up };
                    if (up.primaryAssets && up.primaryAssets.length > 0) {
                      runFastTest(next.name, up.primaryAssets[0], next.selectedTimeframe, parameters);
                    }
                    return next;
                  });
                }}
                onAddCondition={handleAddConditionFromLibrary}
              />
            </div>

            {/* Center Column (Visual Rule Composer OR Parameter Configuration based on active tab) */}
            <div className="xl:col-span-5 space-y-4">
              {activeTab === 'builder' && (
                <VisualRuleComposer
                  ruleGroups={ruleGroups}
                  onUpdateRuleGroups={setRuleGroups}
                  isCodeMode={isCodeMode}
                  onToggleCodeMode={() => setIsCodeMode(!isCodeMode)}
                />
              )}

              {activeTab === 'parameters' && (
                <ParameterConfigGrid
                  strategyName={metadata.name}
                  parameters={parameters}
                  onUpdateParameters={(newParams) => {
                    setParameters(newParams);
                    runFastTest(metadata.name, metadata.primaryAssets[0] || 'XAUUSD', metadata.selectedTimeframe, newParams);
                  }}
                  onRunOptimization={handleRunOptimization}
                  isOptimizing={isOptimizing}
                />
              )}
            </div>

            {/* Right Column (Strategy Pool + Quick Analytics + Risk & Execution) */}
            <div className="xl:col-span-4 space-y-4">
              <StrategyPoolList
                strategies={strategies}
                selectedStrategyId={selectedStrategyId}
                onSelectStrategy={handleSelectStrategy}
                onToggleFavorite={(id) =>
                  setStrategies((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
                  )
                }
              />

              <QuickAnalyticsCard
                strategyName={metadata.name}
                analytics={analytics}
                selectedTimeframe={metadata.selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
              />

              <RiskAndExecutionPanel
                risk={risk}
                onUpdateRisk={(up) => setRisk((prev) => ({ ...prev, ...up }))}
                execution={execution}
                onUpdateExecution={(up) => setExecution((prev) => ({ ...prev, ...up }))}
              />
            </div>
          </div>
        ) : (
          <SecondaryTabs
            activeTab={activeTab}
            strategyName={metadata.name}
            notes={notes}
            onUpdateNotes={(up) => setNotes((prev) => ({ ...prev, ...up }))}
            risk={risk}
            onUpdateRisk={(up) => setRisk((prev) => ({ ...prev, ...up }))}
            exits={exits}
            onUpdateExits={(up) => setExits((prev) => ({ ...prev, ...up }))}
          />
        )}
      </div>
    </div>
  );
};
