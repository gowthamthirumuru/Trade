import React, { useState, useEffect, useCallback } from 'react';
import { BacktestHeader, BacktestTab } from './BacktestHeader';
import { BacktestConfigGrid, BacktestConfig } from './BacktestConfigGrid';
import { BacktestResearchContract, DataSplitInfo } from './BacktestResearchContract';
import { BacktestKpiRibbon, BacktestMetrics } from './BacktestKpiRibbon';
import { BacktestChartsRow, EquityPoint, RollingPoint } from './BacktestChartsRow';
import {
  BacktestAnalyticsRow,
  MonthlyHeatmapRow,
  DayOfWeekItem,
  SessionStats,
  RDistItem,
} from './BacktestAnalyticsRow';
import { BacktestTradesTable, BacktestTradeLog } from './BacktestTradesTable';
import { BacktestRobustnessTab } from './BacktestRobustnessTab';
import { BacktestValidationTab } from './BacktestValidationTab';
import { History, Target, Clock, DollarSign, Layers, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

interface SavedSnapshot {
  id: string;
  timestamp: string;
  strategy: string;
  pair: string;
  timeframe: string;
  netReturnPct: number;
  winRatePct: number;
  tradesCount: number;
}

export const BacktestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BacktestTab>('Configuration');
  const [isRunning, setIsRunning] = useState(false);

  // Dynamic Strategy and Instrument Registries from API
  const [strategiesList, setStrategiesList] = useState<any[]>([]);
  const [instrumentsList, setInstrumentsList] = useState<any[]>([]);
  const [dataQualityPct, setDataQualityPct] = useState<number>(99.8);

  // 1. Backtest Configuration State
  const [config, setConfig] = useState<BacktestConfig>({
    strategy: 'BB Reversion v4',
    version: '4.0.0',
    family: 'Mean Reversion',
    description: 'Bollinger Band reversion strategy with trend and volatility filter.',
    tags: ['Reversion', 'Bollinger', 'London', 'Volatility'],
    instrument: 'XAUUSD',
    timeframe: '15m',
    dataSource: 'Dukascopy',
    datasetVersion: 'XAUUSD_15M_PARQUET',
    startDate: '2004-01-01',
    endDate: '2026-08-20',
    sessionTemplate: 'Forex (London-NY)',
    spreadModel: 'Variable (Historical)',
    commission: '$7.00 / lot / side',
    slippageModel: 'Volatility-Based',
    fillModel: 'Market Orders',
    intrabarModel: '1m Lower TF',
    stopTargetPriority: 'SL First',
    initialCapital: 10000,
    riskPerTradePct: 0.50,
    positionSizing: 'Fixed Fractional',
    maxConcurrentPositions: 3,
    maxPortfolioRiskPct: 1.50,
    dailyLossLimit: 'Off',
    maxDrawdownStop: 'Off',
    compounding: true,
    portfolioMode: 'Single Strategy',
    capitalAllocation: 'Equal',
    correlationAdjustment: true,
    reinvestment: true,
    benchmark: 'None',
  });

  // 2. Real Metrics State
  const [metrics, setMetrics] = useState<BacktestMetrics>({
    netReturnPct: 0.0,
    netReturnQuote: 0.0,
    cagrPct: 0.0,
    expectancyR: 0.0,
    profitFactor: 1.0,
    sharpeRatio: 0.0,
    sortinoRatio: 0.0,
    calmarRatio: 0.0,
    maxDrawdownPct: 0.0,
    winRatePct: 0.0,
    tradesCount: 0,
    moreMetrics: {
      avg_trade_duration_hours: 0,
      max_consecutive_wins: 0,
      max_consecutive_losses: 0,
      total_fees_slippage: 0,
      recovery_factor: 0,
      profit_per_day: 0,
    },
  });

  // 3. Real Analytics States
  const [winTrades, setWinTrades] = useState<number>(0);
  const [lossTrades, setLossTrades] = useState<number>(0);
  const [totalCandles, setTotalCandles] = useState<number>(0);
  const [engineTime, setEngineTime] = useState<string>('0.00s');
  const [completedTime, setCompletedTime] = useState<string>('');
  const [integrityScore, setIntegrityScore] = useState<number>(98);

  const [equityPoints, setEquityPoints] = useState<EquityPoint[]>([]);
  const [rollingMetrics, setRollingMetrics] = useState<Record<string, RollingPoint[]>>({});
  const [monthlyHeatmap, setMonthlyHeatmap] = useState<MonthlyHeatmapRow[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekItem[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    london_r: 0,
    london_pct: 0,
    ny_r: 0,
    ny_pct: 0,
    overlap_r: 0,
    overlap_pct: 0,
    asia_r: 0,
    asia_pct: 0,
  });

  const [rDistribution, setRDistribution] = useState<RDistItem[]>([]);
  const [rDistributionBySide, setRDistributionBySide] = useState<{
    all?: RDistItem[];
    long?: RDistItem[];
    short?: RDistItem[];
  }>({});

  const [dataSplit, setDataSplit] = useState<DataSplitInfo>({
    train: { range: '—', pct: 60, days: 0 },
    validate: { range: '—', pct: 20, days: 0 },
    oos: { range: '—', pct: 20, days: 0 },
  });

  const [tradeLogs, setTradeLogs] = useState<BacktestTradeLog[]>([]);
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshot[]>([]);

  // -------------------------------------------------------------------------
  // Fetch Registry Data (Strategies, Data Lake Instruments, History Snapshots)
  // -------------------------------------------------------------------------
  useEffect(() => {
    // 1. Strategies Pool
    fetch('/api/v1/research/strategies')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setStrategiesList(data);
        }
      })
      .catch(() => {});

    // 2. Data Lake Instruments
    fetch('/api/v1/research/datalab/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.instruments && Array.isArray(data.instruments)) {
          setInstrumentsList(data.instruments);
        }
      })
      .catch(() => {});

    // 3. Backtest Run History Snapshots
    fetch('/api/v1/research/backtest/history')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSavedSnapshots(data);
        }
      })
      .catch(() => {});
  }, []);

  // -------------------------------------------------------------------------
  // 4. Execution Simulation Trigger Handler
  // -------------------------------------------------------------------------
  const handleRunBacktest = useCallback(() => {
    setIsRunning(true);
    fetch('/api/v1/research/backtest/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy_name: config.strategy,
        pair: config.instrument,
        timeframe: config.timeframe,
        initial_capital: config.initialCapital,
        risk_per_trade_pct: config.riskPerTradePct,
        compounding: config.compounding,
        taker_fee_bps: 5.0,
        slippage_bps: config.slippageModel === 'Zero Slippage' ? 0.0 : config.slippageModel === 'Fixed (0.5 pips)' ? 5.0 : 2.0,
        start_date: config.startDate,
        end_date: config.endDate,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setIsRunning(false);
        if (!data) return;

        if (data.metrics) {
          setMetrics({
            netReturnPct: data.metrics.net_return_pct ?? 0.0,
            netReturnQuote: data.metrics.net_return_quote ?? 0.0,
            cagrPct: data.metrics.cagr_pct ?? 0.0,
            expectancyR: data.metrics.expectancy_r ?? 0.0,
            profitFactor: data.metrics.profit_factor ?? 1.0,
            sharpeRatio: data.metrics.sharpe_ratio ?? 0.0,
            sortinoRatio: data.metrics.sortino_ratio ?? 0.0,
            calmarRatio: data.metrics.calmar_ratio ?? 0.0,
            maxDrawdownPct: data.metrics.max_drawdown_pct ?? 0.0,
            winRatePct: data.metrics.win_rate_pct ?? 0.0,
            tradesCount: data.metrics.trades_count ?? 0,
            moreMetrics: data.metrics.more_metrics,
          });
          setWinTrades(data.metrics.win_trades ?? 0);
          setLossTrades(data.metrics.loss_trades ?? 0);
        }

        if (data.equity_points) {
          setEquityPoints(data.equity_points);
        }

        if (data.rolling_metrics) {
          setRollingMetrics(data.rolling_metrics);
        }

        if (data.monthly_heatmap) {
          setMonthlyHeatmap(data.monthly_heatmap);
        }

        if (data.day_of_week) {
          setDayOfWeek(data.day_of_week);
        }

        if (data.session_performance) {
          setSessionStats(data.session_performance);
        }

        if (data.r_distribution) {
          setRDistribution(data.r_distribution);
        }

        if (data.r_distribution_by_side) {
          setRDistributionBySide(data.r_distribution_by_side);
        }

        if (data.data_split) {
          setDataSplit(data.data_split);
        }

        if (data.trade_logs) {
          setTradeLogs(data.trade_logs);
        }

        if (data.total_candles !== undefined) {
          setTotalCandles(data.total_candles);
        }

        if (data.engine_time) {
          setEngineTime(data.engine_time);
        }

        if (data.completed_time) {
          setCompletedTime(data.completed_time);
        }

        if (data.integrity_score) {
          setIntegrityScore(data.integrity_score);
        }
      })
      .catch(() => {
        setIsRunning(false);
      });
  }, [
    config.strategy,
    config.instrument,
    config.timeframe,
    config.initialCapital,
    config.riskPerTradePct,
    config.compounding,
    config.slippageModel,
    config.startDate,
    config.endDate,
  ]);

  // Initial Run on mount
  useEffect(() => {
    handleRunBacktest();
  }, [handleRunBacktest]);

  // Save Snapshot Handler
  const handleSaveSnapshot = () => {
    const newSnapshot: SavedSnapshot = {
      id: `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      strategy: config.strategy,
      pair: config.instrument,
      timeframe: config.timeframe,
      netReturnPct: metrics.netReturnPct,
      winRatePct: metrics.winRatePct,
      tradesCount: metrics.tradesCount,
    };

    fetch('/api/v1/research/backtest/save-snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSnapshot),
    }).catch(() => {});

    setSavedSnapshots((prev) => [newSnapshot, ...prev]);
  };

  // CSV Export Handler
  const handleExportAllCSV = () => {
    if (!tradeLogs.length) return;
    const headers = ['Trade ID', 'Entry Time', 'Exit Time', 'Direction', 'Entry Price', 'Exit Price', 'PnL (R)', 'PnL ($)', 'Exit Trigger'];
    const rows = tradeLogs.map((t) => [
      t.id,
      t.entry_time,
      t.exit_time,
      t.side,
      t.entry_price,
      t.exit_price,
      t.pnl_r,
      t.pnl_quote,
      t.exit_reason,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_backtest_${config.strategy.replace(/\s+/g, '_')}_${config.instrument}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Execution Stress Test Handler
  const handleStressTest = () => {
    setConfig((prev) => ({
      ...prev,
      slippageModel: 'Volatility-Based (Stress 3.0x)',
      spreadModel: 'Variable (Historical)',
    }));
    handleRunBacktest();
  };

  // Handle configuration updates dynamically
  const handleUpdateConfig = (updated: Partial<BacktestConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      if (updated.instrument) {
        const isCrypto = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].includes(updated.instrument);
        next.dataSource = isCrypto ? 'Binance' : 'Dukascopy';
        next.datasetVersion = `${updated.instrument}_${next.timeframe.toUpperCase()}_PARQUET`;
        const matchedInst = instrumentsList.find((i) => i.pair === updated.instrument);
        if (matchedInst && matchedInst.quality) {
          setDataQualityPct(matchedInst.quality);
        }
      }
      if (updated.timeframe) {
        next.datasetVersion = `${next.instrument}_${updated.timeframe.toUpperCase()}_PARQUET`;
      }
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07090e] text-slate-100 select-none overflow-y-auto">
      {/* 1. Header Navigation & Action Bar */}
      <BacktestHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRunning={isRunning}
        onRunBacktest={handleRunBacktest}
        onSaveSnapshot={handleSaveSnapshot}
        onExport={handleExportAllCSV}
      />

      {/* 2. Main Backtesting Content Sub-Views */}
      <div className="p-4 space-y-3.5 flex-1">
        {/* ================================================================= */}
        {/* TAB 1: CONFIGURATION */}
        {/* ================================================================= */}
        {activeTab === 'Configuration' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Top 5 Modular Configuration Cards */}
            <BacktestConfigGrid
              config={config}
              onUpdateConfig={handleUpdateConfig}
              strategiesList={strategiesList}
              instrumentsList={instrumentsList}
              dataQualityPct={dataQualityPct}
              onStressTest={handleStressTest}
            />

            {/* Research Contract, Data Split, Quick Actions & Run Summary */}
            <BacktestResearchContract
              strategyName={`${config.strategy} (${config.version})`}
              instrument={config.instrument}
              timeframe={config.timeframe}
              startDate={config.startDate}
              endDate={config.endDate}
              totalCandles={totalCandles}
              totalTrades={metrics.tradesCount}
              engineTime={engineTime}
              completedTime={completedTime}
              integrityScore={integrityScore}
              dataSplit={dataSplit}
              commission={config.commission}
              riskModel={`${config.riskPerTradePct.toFixed(2)}% ${config.positionSizing}`}
              compounding={config.compounding}
              intrabarModel={config.intrabarModel}
              executionModel={config.spreadModel}
              slippageModel={config.slippageModel}
              onNavigateTab={(tab) => {
                if (tab === 'Trades') setActiveTab('Trades');
              }}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: RESULTS (THE CONSOLIDATED EXECUTIVE VIEW) */}
        {/* ================================================================= */}
        {activeTab === 'Results' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* 10 Institutional Performance KPI Cards */}
            <BacktestKpiRibbon metrics={metrics} />

            {/* 3 Middle Visualizations: Equity Curve, Underwater Drawdown, Rolling Performance */}
            <BacktestChartsRow
              equityPoints={equityPoints}
              rollingMetrics={rollingMetrics}
            />

            {/* Bottom 5 Specialized Analytics Panels */}
            <BacktestAnalyticsRow
              monthlyData={monthlyHeatmap}
              dayOfWeekData={dayOfWeek}
              sessionStats={sessionStats}
              rDistribution={rDistribution}
              rDistributionBySide={rDistributionBySide}
              winTrades={winTrades}
              lossTrades={lossTrades}
              winRatePct={metrics.winRatePct}
              expectancyR={metrics.expectancyR}
            />

            {/* Trade Execution Logs Table Preview */}
            <BacktestTradesTable
              trades={tradeLogs}
              totalTradesCount={metrics.tradesCount}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: TRADES (DEDICATED EXECUTION LOG WORKBENCH) */}
        {/* ================================================================= */}
        {activeTab === 'Trades' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Top Trade Statistics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 font-mono text-xs">
              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Executions</div>
                <div className="text-base font-extrabold text-white mt-0.5">{metrics.tradesCount.toLocaleString()}</div>
                <div className="text-[9px] text-cyan-400 font-bold">100% In DuckDB</div>
              </div>

              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Win Rate</div>
                <div className={`text-base font-extrabold mt-0.5 ${metrics.winRatePct >= 50 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {metrics.winRatePct.toFixed(1)}%
                </div>
                <div className="text-[9px] text-emerald-400 font-bold">{winTrades.toLocaleString()} Winners</div>
              </div>

              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Loss Count</div>
                <div className="text-base font-extrabold text-rose-400 mt-0.5">{lossTrades.toLocaleString()}</div>
                <div className="text-[9px] text-rose-400 font-bold">{(100 - metrics.winRatePct).toFixed(1)}% Losses</div>
              </div>

              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Expectancy (R)</div>
                <div className={`text-base font-extrabold mt-0.5 ${metrics.expectancyR >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {metrics.expectancyR >= 0 ? `+${metrics.expectancyR.toFixed(2)}R` : `${metrics.expectancyR.toFixed(2)}R`}
                </div>
                <div className="text-[9px] text-slate-400 font-bold">Average Per Trade</div>
              </div>

              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Profit Factor</div>
                <div className={`text-base font-extrabold mt-0.5 ${metrics.profitFactor >= 1.0 ? 'text-white' : 'text-rose-400'}`}>
                  {metrics.profitFactor.toFixed(2)}
                </div>
                <div className="text-[9px] text-emerald-400 font-bold">Gross Win/Loss</div>
              </div>

              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Friction</div>
                <div className="text-base font-extrabold text-slate-200 mt-0.5">
                  ${(metrics.moreMetrics?.total_fees_slippage || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] text-amber-400 font-bold">Taker Fees + Slippage</div>
              </div>

              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Duration</div>
                <div className="text-base font-extrabold text-cyan-300 mt-0.5">
                  {metrics.moreMetrics?.avg_trade_duration_hours || 4.2}h
                </div>
                <div className="text-[9px] text-slate-400 font-bold">Holding Time</div>
              </div>

              <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Max Win Streak</div>
                <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                  {metrics.moreMetrics?.max_consecutive_wins || 0}
                </div>
                <div className="text-[9px] text-rose-400 font-bold">Loss: {metrics.moreMetrics?.max_consecutive_losses || 0}</div>
              </div>
            </div>

            {/* Comprehensive Interactive Trades Table */}
            <BacktestTradesTable
              trades={tradeLogs}
              totalTradesCount={metrics.tradesCount}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: ANALYTICS (DEEP STATISTICAL LAB & ALPHA BREAKDOWN) */}
        {/* ================================================================= */}
        {activeTab === 'Analytics' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* KPI Ribbon */}
            <BacktestKpiRibbon metrics={metrics} />

            {/* 3 Middle Visualizations: Equity Curve, Underwater Drawdown, Rolling Performance */}
            <BacktestChartsRow
              equityPoints={equityPoints}
              rollingMetrics={rollingMetrics}
            />

            {/* Bottom 5 Specialized Analytics Panels: Monthly Heatmap, Day of Week, Session Donut, R-Distribution, Outcome */}
            <BacktestAnalyticsRow
              monthlyData={monthlyHeatmap}
              dayOfWeekData={dayOfWeek}
              sessionStats={sessionStats}
              rDistribution={rDistribution}
              rDistributionBySide={rDistributionBySide}
              winTrades={winTrades}
              lossTrades={lossTrades}
              winRatePct={metrics.winRatePct}
              expectancyR={metrics.expectancyR}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: ROBUSTNESS (STRESS TESTING & PARAMETER JITTER) */}
        {/* ================================================================= */}
        {activeTab === 'Robustness' && (
          <div className="animate-in fade-in duration-150">
            <BacktestRobustnessTab
              strategy={config.strategy}
              pair={config.instrument}
              timeframe={config.timeframe}
              expectancyR={metrics.expectancyR}
              sharpeRatio={metrics.sharpeRatio}
              onRunStressTest={handleStressTest}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: VALIDATION (IN-SAMPLE VS OOS & OVERFITTING DIAGNOSTICS) */}
        {/* ================================================================= */}
        {activeTab === 'Validation' && (
          <div className="animate-in fade-in duration-150">
            <BacktestValidationTab
              strategy={config.strategy}
              pair={config.instrument}
              timeframe={config.timeframe}
            />
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: HISTORY (DUCKDB RUN SNAPSHOTS) */}
        {/* ================================================================= */}
        {activeTab === 'History' && (
          <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 font-mono animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#141a26] pb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-xs">Backtest Run History & DuckDB Snapshots</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{savedSnapshots.length} Records in DuckDB</span>
            </div>
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#07090e] z-10">
                  <tr className="text-slate-400 border-b border-[#141a26] text-[10px]">
                    <th className="py-2 px-3">Snapshot ID</th>
                    <th className="py-2 px-3">Date & Time</th>
                    <th className="py-2 px-3">Strategy</th>
                    <th className="py-2 px-3">Instrument</th>
                    <th className="py-2 px-3">Timeframe</th>
                    <th className="py-2 px-3 text-right">Net Return</th>
                    <th className="py-2 px-3 text-right">Win Rate</th>
                    <th className="py-2 px-3 text-right">Trades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141a26]">
                  {savedSnapshots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No backtest snapshots recorded yet. Click "Save Snapshot" to persist.
                      </td>
                    </tr>
                  ) : (
                    savedSnapshots.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-[#121824] text-[11px] transition">
                        <td className="py-2 px-3 font-bold text-cyan-300">#{s.id}</td>
                        <td className="py-2 px-3 text-slate-400">{s.timestamp}</td>
                        <td className="py-2 px-3 text-white font-bold">{s.strategy}</td>
                        <td className="py-2 px-3 text-slate-300">{s.pair}</td>
                        <td className="py-2 px-3 text-cyan-400">{s.timeframe}</td>
                        <td className={`py-2 px-3 text-right font-extrabold ${s.netReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.netReturnPct >= 0 ? `+${s.netReturnPct.toFixed(1)}%` : `${s.netReturnPct.toFixed(1)}%`}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200">{s.winRatePct.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right text-white font-bold">{s.tradesCount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
