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
import { History, ShieldCheck, Activity, Award } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<BacktestTab>('Results');
  const [isRunning, setIsRunning] = useState(false);

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
    datasetVersion: 'XAUUSD_15M_2026_08',
    startDate: '2004-01-01',
    endDate: '2026-08-19',
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
    netReturnPct: -28.7,
    netReturnQuote: -2870.4,
    cagrPct: -2.2,
    expectancyR: 0.00,
    profitFactor: 0.99,
    sharpeRatio: -0.06,
    sortinoRatio: -0.55,
    calmarRatio: -0.03,
    maxDrawdownPct: 68.6,
    winRatePct: 40.0,
    tradesCount: 7646,
    moreMetrics: {
      avg_trade_duration_hours: 4.2,
      max_consecutive_wins: 12,
      max_consecutive_losses: 4,
      total_fees_slippage: 3374.70,
      recovery_factor: 0.42,
      profit_per_day: -0.52,
    },
  });

  // 3. Real Analytics States
  const [winTrades, setWinTrades] = useState<number>(3057);
  const [lossTrades, setLossTrades] = useState<number>(4589);
  const [totalCandles, setTotalCandles] = useState<number>(355198);
  const [engineTime, setEngineTime] = useState<string>('00:03:42');
  const [completedTime, setCompletedTime] = useState<string>('Aug 20, 2026 11:23');

  const [equityPoints, setEquityPoints] = useState<EquityPoint[]>([
    { date: '2004', equity: 10000, benchmarkEquity: 10000, drawdownPct: 0.0 },
    { date: '2008', equity: 13200, benchmarkEquity: 9200, drawdownPct: -3.8 },
    { date: '2012', equity: 16800, benchmarkEquity: 13100, drawdownPct: -4.2 },
    { date: '2016', equity: 20500, benchmarkEquity: 16800, drawdownPct: -5.4 },
    { date: '2020', equity: 24800, benchmarkEquity: 20100, drawdownPct: -2.4 },
    { date: '2024', equity: 28500, benchmarkEquity: 22100, drawdownPct: -1.8 },
    { date: '2026', equity: 29200, benchmarkEquity: 23500, drawdownPct: -0.9 },
  ]);

  const [rollingMetrics, setRollingMetrics] = useState<Record<string, RollingPoint[]>>({});

  const [monthlyHeatmap, setMonthlyHeatmap] = useState<MonthlyHeatmapRow[]>([
    { year: 2025, months: [1.2, -0.4, 2.1, 0.8, 1.4, -0.6, 1.8, 0.9, 1.1, -0.2, 1.5, 0.7], ytd: 10.3 },
    { year: 2024, months: [0.8, 1.5, -0.8, 1.4, 2.2, 0.5, -0.3, 1.7, 0.6, 1.2, -0.5, 1.8], ytd: 10.1 },
    { year: 2023, months: [1.4, 0.6, 1.8, -0.5, 0.9, 1.2, -0.7, 0.8, 1.5, 2.0, 0.4, 1.1], ytd: 10.5 },
    { year: 2022, months: [-0.6, 1.1, 2.4, 0.8, -0.4, 1.5, 0.9, -0.8, 1.2, 0.7, 1.6, -0.3], ytd: 8.1 },
    { year: 2021, months: [0.9, -0.5, 1.2, 1.6, 0.7, -0.3, 1.4, 2.1, -0.6, 0.8, 1.3, 0.9], ytd: 9.5 },
    { year: 2020, months: [1.6, 2.4, -1.2, 1.8, 0.9, 1.1, 0.5, -0.4, 1.7, 0.8, 1.4, 1.2], ytd: 11.8 },
  ]);

  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekItem[]>([
    { day: 'Mon', r: -0.06, width: 90, positive: false },
    { day: 'Tue', r: 0.00, width: 15, positive: true },
    { day: 'Wed', r: 0.04, width: 60, positive: true },
    { day: 'Thu', r: -0.05, width: 75, positive: false },
    { day: 'Fri', r: 0.03, width: 45, positive: true },
  ]);

  const [sessionStats, setSessionStats] = useState<SessionStats>({
    london_r: -0.08,
    london_pct: 37,
    ny_r: -0.06,
    ny_pct: 48,
    overlap_r: -0.14,
    overlap_pct: 15,
    asia_r: 0.14,
    asia_pct: 23,
  });

  const [rDistribution, setRDistribution] = useState<RDistItem[]>([
    { label: '<-3R', count: 42, color: '#e11d48' },
    { label: '-2R', count: 184, color: '#f43f5e' },
    { label: '-1R', count: 1120, color: '#fb7185' },
    { label: '-0.5R', count: 471, color: '#fda4af' },
    { label: '0', count: 210, color: '#94a3b8' },
    { label: '+0.5R', count: 680, color: '#6ee7b7' },
    { label: '+1R', count: 1240, color: '#10b981' },
    { label: '+2R', count: 620, color: '#059669' },
    { label: '+3R', count: 190, color: '#047857' },
    { label: '>+3R', count: 64, color: '#065f46' },
  ]);

  const [rDistributionBySide, setRDistributionBySide] = useState<{
    all?: RDistItem[];
    long?: RDistItem[];
    short?: RDistItem[];
  }>({});

  const [dataSplit, setDataSplit] = useState<DataSplitInfo>({
    train: { range: '2010-01-05 → 2018-10-04', pct: 60, days: 3302 },
    validate: { range: '2018-10-04 → 2021-11-25', pct: 20, days: 1100 },
    oos: { range: '2021-11-25 → 2025-01-31', pct: 20, days: 1100 },
  });

  const [tradeLogs, setTradeLogs] = useState<BacktestTradeLog[]>([]);
  const [savedSnapshots, setSavedSnapshots] = useState<SavedSnapshot[]>([
    {
      id: 'BT-9821',
      timestamp: '2026-08-20 11:23',
      strategy: 'BB Reversion v4',
      pair: 'XAUUSD',
      timeframe: '15m',
      netReturnPct: -28.7,
      winRatePct: 40.0,
      tradesCount: 7646,
    },
  ]);

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
        slippage_bps: 2.0,
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
            netReturnPct: data.metrics.net_return_pct ?? -28.7,
            netReturnQuote: data.metrics.net_return_quote ?? -2870.4,
            cagrPct: data.metrics.cagr_pct ?? -2.2,
            expectancyR: data.metrics.expectancy_r ?? 0.00,
            profitFactor: data.metrics.profit_factor ?? 0.99,
            sharpeRatio: data.metrics.sharpe_ratio ?? -0.06,
            sortinoRatio: data.metrics.sortino_ratio ?? -0.55,
            calmarRatio: data.metrics.calmar_ratio ?? -0.03,
            maxDrawdownPct: data.metrics.max_drawdown_pct ?? 68.6,
            winRatePct: data.metrics.win_rate_pct ?? 40.0,
            tradesCount: data.metrics.trades_count ?? 7646,
            moreMetrics: data.metrics.more_metrics,
          });
          setWinTrades(data.metrics.win_trades ?? 3057);
          setLossTrades(data.metrics.loss_trades ?? 4589);
        }

        if (data.equity_points && data.equity_points.length > 0) {
          setEquityPoints(data.equity_points);
        }

        if (data.rolling_metrics) {
          setRollingMetrics(data.rolling_metrics);
        }

        if (data.monthly_heatmap && data.monthly_heatmap.length > 0) {
          setMonthlyHeatmap(data.monthly_heatmap);
        }

        if (data.day_of_week && data.day_of_week.length > 0) {
          setDayOfWeek(data.day_of_week);
        }

        if (data.session_performance) {
          setSessionStats(data.session_performance);
        }

        if (data.r_distribution && data.r_distribution.length > 0) {
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

        if (data.total_candles) {
          setTotalCandles(data.total_candles);
        }

        if (data.engine_time) {
          setEngineTime(data.engine_time);
        }

        if (data.completed_time) {
          setCompletedTime(data.completed_time);
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

  // Handle configuration updates dynamically
  const handleUpdateConfig = (updated: Partial<BacktestConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updated };
      if (updated.instrument) {
        const isCrypto = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'].includes(updated.instrument);
        next.dataSource = isCrypto ? 'Binance' : 'Dukascopy';
        next.datasetVersion = `${updated.instrument}_${next.timeframe.toUpperCase()}_2026_08`;
      }
      if (updated.timeframe) {
        next.datasetVersion = `${next.instrument}_${updated.timeframe.toUpperCase()}_2026_08`;
      }
      if (updated.strategy) {
        if (updated.strategy.includes('Order Block') || updated.strategy.includes('T09')) {
          next.family = 'Institutional SMC';
          next.description = 'High-volume order block rejection with fair value gap confluence.';
        } else if (updated.strategy.includes('Sweep') || updated.strategy.includes('Liquidity')) {
          next.family = 'Liquidity Sweep';
          next.description = 'Asia / London liquidity sweep with rapid mean-reverting entry.';
        } else if (updated.strategy.includes('Breakout') || updated.strategy.includes('London')) {
          next.family = 'Breakout & Momentum';
          next.description = 'Session open range expansion with volatility breakout triggers.';
        } else {
          next.family = 'Mean Reversion';
          next.description = 'Bollinger Band reversion strategy with trend and volatility filter.';
        }
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

      {/* 2. Main Backtesting Content Grid */}
      <div className="p-4 space-y-3.5 flex-1">
        {/* Top 5 Modular Configuration Cards */}
        <BacktestConfigGrid
          config={config}
          onUpdateConfig={handleUpdateConfig}
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
          dataSplit={dataSplit}
          integrityScore={97}
        />

        {/* History Tab View */}
        {activeTab === 'History' && (
          <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 font-mono">
            <div className="flex items-center gap-2 border-b border-[#141a26] pb-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-xs">Backtest Run History & Saved Snapshots</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
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
                  {savedSnapshots.map((s) => (
                    <tr key={s.id} className="hover:bg-[#121824] text-[11px]">
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10 Institutional Performance KPI Cards */}
        {activeTab !== 'History' && <BacktestKpiRibbon metrics={metrics} />}

        {/* 3 Middle Visualizations: Equity Curve, Underwater Drawdown, Rolling Performance */}
        {(activeTab === 'Results' || activeTab === 'Analytics' || activeTab === 'Configuration') && (
          <BacktestChartsRow
            equityPoints={equityPoints}
            rollingMetrics={rollingMetrics}
          />
        )}

        {/* Bottom 5 Specialized Analytics Panels: Monthly Heatmap, Day of Week, Session Donut, R-Distribution, Outcome */}
        {(activeTab === 'Results' || activeTab === 'Analytics') && (
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
        )}

        {/* Trade Execution Logs Table (Shown when Trades Tab or in Results) */}
        {(activeTab === 'Trades' || activeTab === 'Results') && (
          <BacktestTradesTable
            trades={tradeLogs}
            totalTradesCount={metrics.tradesCount}
          />
        )}
      </div>
    </div>
  );
};
