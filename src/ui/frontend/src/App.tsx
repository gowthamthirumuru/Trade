import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { Dashboard } from './pages/Dashboard';
import {
  DataLabPage,
  StrategyLabPage,
  BacktestingPage,
  OptimizationPage,
  ExperimentsPage,
} from './pages/ResearchPages';
import {
  EdgeExplorerPage,
  ConditionAnalysisPage,
  RegimeAnalysisPage,
  PatternMiningPage,
  CorrelationPage,
} from './pages/EdgePages';
import {
  WalkForwardPage,
  OutOfSamplePage,
  MonteCarloPage,
  RobustnessPage,
  OverfittingDetectorPage,
} from './pages/ValidationPages';
import {
  PerformancePage,
  TradeAnalyticsPage,
  StatisticalLabPage,
  StrategyComparisonPage,
} from './pages/AnalysisPages';
import {
  JournalPage,
  PsychologyPage,
  MistakeAnalysisPage,
  ReplayPage,
} from './pages/TraderDevPages';
import {
  AIQuantAnalystPage,
  ResearchReportsPage,
  InsightsPage,
} from './pages/IntelligencePages';
import { DataSourcesPage, SettingsPage } from './pages/SystemPages';
import { DashboardData } from './types';

// Default initial data matching the reference image
const defaultDashboardData: DashboardData = {
  kpis: [
    { id: 'kpi-health', title: 'Research Health', value: '92/100', subtext: '● Excellent', badge_type: 'positive', sparkline: [82, 85, 84, 88, 89, 90, 92, 91, 92] },
    { id: 'kpi-backtests', title: 'Total Backtests', value: '184', subtext: '▲ 23 this month', badge_type: 'positive', sparkline: [120, 135, 142, 150, 161, 172, 184] },
    { id: 'kpi-strategies', title: 'Total Strategies', value: '24', subtext: '▲ 4 this month', badge_type: 'positive', sparkline: [14, 16, 17, 19, 20, 22, 24] },
    { id: 'kpi-experiments', title: 'Experiments', value: '37', subtext: '▲ 9 active', badge_type: 'warning', sparkline: [18, 22, 25, 29, 31, 35, 37] },
    { id: 'kpi-edges', title: 'Validated Edges', value: '11', subtext: '▲ 2 new this month', badge_type: 'positive', sparkline: [4, 6, 7, 8, 9, 10, 11] },
    { id: 'kpi-trades', title: 'Total Trades Analyzed', value: '12.8M', subtext: 'Across all backtests', badge_type: 'neutral', sparkline: [5.2, 6.8, 7.9, 9.1, 10.4, 11.6, 12.8] },
  ],
  strategies: [
    { rank: 1, name: 'BB Reversion v4', expectancy_r: 0.91, oos_expectancy_r: 0.74, profit_factor: 2.18, max_dd_pct: 8.4, robustness_score: 87, trades_count: 4821, sparkline: [0.2, 0.4, 0.5, 0.7, 0.85, 0.91], trend: 'up' },
    { rank: 2, name: 'Order Block v4', expectancy_r: 0.78, oos_expectancy_r: 0.63, profit_factor: 1.92, max_dd_pct: 9.1, robustness_score: 82, trades_count: 3614, sparkline: [0.3, 0.45, 0.6, 0.68, 0.78], trend: 'up' },
    { rank: 3, name: 'Liquidity Sweep v3', expectancy_r: 0.66, oos_expectancy_r: 0.51, profit_factor: 1.81, max_dd_pct: 10.2, robustness_score: 76, trades_count: 2947, sparkline: [0.1, 0.35, 0.52, 0.66], trend: 'up' },
    { rank: 4, name: 'London Breakout v2', expectancy_r: 0.59, oos_expectancy_r: 0.48, profit_factor: 1.72, max_dd_pct: 7.6, robustness_score: 74, trades_count: 2183, sparkline: [0.2, 0.38, 0.45, 0.59], trend: 'up' },
    { rank: 5, name: 'EMA Trend v2', expectancy_r: 0.42, oos_expectancy_r: 0.31, profit_factor: 1.42, max_dd_pct: 12.8, robustness_score: 61, trades_count: 3441, sparkline: [0.15, 0.28, 0.35, 0.42], trend: 'up' },
    { rank: 6, name: 'FVG Fade v1', expectancy_r: 0.39, oos_expectancy_r: 0.18, profit_factor: 1.28, max_dd_pct: 14.6, robustness_score: 48, trades_count: 1932, sparkline: [0.1, 0.22, 0.31, 0.39], trend: 'up' },
    { rank: 7, name: 'Mean Reversion v1', expectancy_r: 0.21, oos_expectancy_r: 0.05, profit_factor: 1.11, max_dd_pct: 16.9, robustness_score: 36, trades_count: 2221, sparkline: [0.05, 0.12, 0.18, 0.21], trend: 'up' },
    { rank: 8, name: 'Breakout Pro v1', expectancy_r: 0.18, oos_expectancy_r: -0.02, profit_factor: 0.98, max_dd_pct: 18.4, robustness_score: 28, trades_count: 1881, sparkline: [0.2, 0.25, 0.15, 0.18], trend: 'down' },
    { rank: 9, name: 'RSI Pullback v1', expectancy_r: 0.07, oos_expectancy_r: -0.15, profit_factor: 0.81, max_dd_pct: 20.3, robustness_score: 21, trades_count: 1244, sparkline: [0.15, 0.10, 0.05, 0.07], trend: 'down' },
    { rank: 10, name: 'Scalping Model v1', expectancy_r: -0.05, oos_expectancy_r: -0.28, profit_factor: 0.72, max_dd_pct: 22.1, robustness_score: 18, trades_count: 3148, sparkline: [0.0, -0.02, -0.04, -0.05], trend: 'down' },
  ],
  validated_edges: [
    { id: 1, pair: 'XAUUSD', strategy_name: 'BB Reversion', filters_desc: 'Tuesday • London + ATR 18-25 • HTF Bullish', expectancy_r: 1.24, trades_count: 382, oos_expectancy_r: 0.87, profit_factor: 2.84, confidence_stars: 5, status: 'VALIDATED' },
    { id: 2, pair: 'XAUUSD', strategy_name: 'Order Block v4', filters_desc: 'London • High Volatility • Sweep', expectancy_r: 1.08, trades_count: 296, oos_expectancy_r: 0.71, profit_factor: 2.31, confidence_stars: 5, status: 'VALIDATED' },
    { id: 3, pair: 'EURUSD', strategy_name: 'Breakout v2', filters_desc: 'London Open • 30m Momentum', expectancy_r: 0.82, trades_count: 241, oos_expectancy_r: 0.62, profit_factor: 1.98, confidence_stars: 4, status: 'VALIDATED' },
    { id: 4, pair: 'GBPUSD', strategy_name: 'Liquidity Sweep v3', filters_desc: 'New York Session • HTF Alignment', expectancy_r: 0.71, trades_count: 198, oos_expectancy_r: 0.53, profit_factor: 1.76, confidence_stars: 3, status: 'VALIDATED' },
  ],
  active_experiments: [
    { id: 'exp-1', title: 'Does ATR > 18 improve BB Reversion?', strategy: 'BB Reversion v4', stage: 'OOS VALIDATION', progress_pct: 67, status_color: 'cyan' },
    { id: 'exp-2', title: 'Does HTF trend filter improve OB?', strategy: 'Order Block v4', stage: 'TESTING', progress_pct: 45, status_color: 'purple' },
    { id: 'exp-3', title: 'Does Friday underperformance persist?', strategy: 'All strategies', stage: 'ANALYZING', progress_pct: 82, status_color: 'amber' },
    { id: 'exp-4', title: 'Does news filter improve breakout?', strategy: 'Breakout v2', stage: 'DESIGN', progress_pct: 12, status_color: 'rose' },
    { id: 'exp-5', title: 'Optimal SL placement for sweeps', strategy: 'Liquidity Sweep v3', stage: 'QUEUED', progress_pct: 0, status_color: 'slate' },
  ],
  expectancy_history: [
    { date: "Nov '24", expectancy: 0.15, strategy: 'All Strategies' },
    { date: "Dec '24", expectancy: 0.38, strategy: 'All Strategies' },
    { date: "Jan '25", expectancy: 0.58, strategy: 'All Strategies' },
    { date: "Feb '25", expectancy: 0.68, strategy: 'All Strategies' },
    { date: "Mar '25", expectancy: 0.82, strategy: 'All Strategies' },
    { date: "Apr '25", expectancy: 0.88, strategy: 'All Strategies' },
    { date: "May '25", expectancy: 0.92, strategy: 'All Strategies' },
  ],
  robustness_distribution: {
    total_strategies: 24,
    average_robustness: 68,
    high_count: 7,
    high_pct: 29.0,
    medium_count: 11,
    medium_pct: 46.0,
    low_count: 6,
    low_pct: 25.0,
  },
  warnings: [
    { id: 'w-1', title: 'BB Reversion v5', description: 'Sample size dropped 4,821 → 117 trades. High overfitting risk detected.', severity: 'High', created_at: '1h ago' },
    { id: 'w-2', title: 'Liquidity Sweep v3', description: 'OOS expectancy significantly lower than In-sample (0.51R vs 1.21R).', severity: 'Medium', created_at: '3h ago' },
    { id: 'w-3', title: 'Breakout Pro v1', description: 'High drawdown (22.1%) exceeds your threshold (20%).', severity: 'Medium', created_at: '5h ago' },
    { id: 'w-4', title: '3 strategies are highly correlated', description: 'Consider testing as a strategy family.', severity: 'Low', created_at: '1d ago' },
  ],
  data_health: {
    overall_quality_pct: 98,
    items: [
      { instrument: 'XAUUSD', quality_pct: 99.8, time_range: '2004 – 2026', candles_count: '2.1M' },
      { instrument: 'EURUSD', quality_pct: 99.9, time_range: '2004 – 2026', candles_count: '3.4M' },
      { instrument: 'GBPUSD', quality_pct: 99.7, time_range: '2004 – 2026', candles_count: '1.8M' },
      { instrument: 'BTCUSD', quality_pct: 100.0, time_range: '2013 – 2026', candles_count: '5.5M' },
    ],
  },
  trader_development: {
    overall_score: 82,
    skills: [
      { name: 'Discipline', score: 91, color: 'teal' },
      { name: 'Rule Following', score: 87, color: 'cyan' },
      { name: 'Execution', score: 82, color: 'purple' },
      { name: 'Emotional Control', score: 74, color: 'amber' },
      { name: 'Risk Management', score: 94, color: 'emerald' },
    ],
  },
  journal_summary: {
    total_trades_logged: 48,
    rules_broken: 7,
    rules_broken_pct: 14.8,
    best_performing_day: 'Tuesday',
    avg_r_per_trade: 0.38,
    most_common_mistake: 'Early Exit',
    review_consistency_pct: 78,
  },
  recent_activity: [
    { id: 'act-1', text: 'Backtest completed: BB Reversion v4 (OOS)', time_ago: '2h ago', category: 'backtest' },
    { id: 'act-2', text: 'Experiment updated: ATR filter analysis', time_ago: '4h ago', category: 'experiment' },
    { id: 'act-3', text: 'New edge validated: XAUUSD London + ATR', time_ago: '6h ago', category: 'edge' },
    { id: 'act-4', text: 'Journal entry added', time_ago: 'Yesterday', category: 'journal' },
    { id: 'act-5', text: 'Walk-forward analysis completed', time_ago: '2 days ago', category: 'validation' },
  ],
};

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardData);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Fetch live DuckDB data from FastAPI backend
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/overview/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.kpis) {
          setDashboardData(data);
        }
      })
      .catch(() => {
        // Use default seed data if server is connecting
      });
  }, []);

  const getPageInfo = (pageId: string) => {
    switch (pageId) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of your research, strategies, and edge development' };
      case 'data_lab':
        return { title: 'Data Lab', subtitle: 'Inspect Parquet candles, gap audits, and data lake ingestion pipelines' };
      case 'strategy_lab':
        return { title: 'Strategy Lab', subtitle: 'Visual rule builder, condition composer, and strategy registry' };
      case 'backtesting':
        return { title: 'Backtesting', subtitle: 'VectorBT & Nautilus institutional simulation engine with fee modeling' };
      case 'optimization':
        return { title: 'Optimization', subtitle: 'Multi-parameter Bayesian search and response surface heatmaps' };
      case 'experiments':
        return { title: 'Experiments', subtitle: 'A/B quantitative hypothesis tracking and lifecycle management' };
      case 'edge_explorer':
        return { title: 'Edge Explorer', subtitle: 'Multi-dimensional slice discovery and statistical significance scans' };
      case 'condition_analysis':
        return { title: 'Condition Analysis', subtitle: 'Feature lift ranking, Shapley value attribution, and rule weights' };
      case 'regime_analysis':
        return { title: 'Regime Analysis', subtitle: 'Market regime classification matrices and transition dynamics' };
      case 'pattern_mining':
        return { title: 'Pattern Mining', subtitle: 'Order blocks, FVG, liquidity sweep patterns, and genetic rule mining' };
      case 'correlation':
        return { title: 'Correlation', subtitle: 'Cross-strategy return correlations and portfolio diversification' };
      case 'walk_forward':
        return { title: 'Walk-Forward', subtitle: 'Anchored and rolling walk-forward efficiency analysis' };
      case 'out_of_sample':
        return { title: 'Out-of-Sample', subtitle: 'In-sample vs out-of-sample degradation and parameter stability' };
      case 'monte_carlo':
        return { title: 'Monte Carlo', subtitle: '10,000-path resampled equity curves and risk of ruin' };
      case 'robustness':
        return { title: 'Robustness', subtitle: 'Parameter perturbation testing and slippage sensitivity stress' };
      case 'overfitting_detector':
        return { title: 'Overfitting Detector', subtitle: 'Deflated Sharpe Ratio (DSR) and CSCV Probability of Overfitting (PBO)' };
      case 'performance':
        return { title: 'Performance', subtitle: 'Institutional QuantStats tearsheet and monthly returns heatmap' };
      case 'trade_analytics':
        return { title: 'Trade Analytics', subtitle: 'Maximum Adverse/Favorable Excursion and holding duration stats' };
      case 'statistical_lab':
        return { title: 'Statistical Lab', subtitle: 'Skewness, kurtosis, Jarque-Bera normality, and bootstrap tests' };
      case 'strategy_comparison':
        return { title: 'Strategy Comparison', subtitle: 'Multi-strategy tearsheet matrix and radar performance profiles' };
      case 'journal':
        return { title: 'Journal', subtitle: 'Interactive execution log, trade screenshot reviews, and discipline tags' };
      case 'psychology':
        return { title: 'Psychology', subtitle: 'Emotional discipline tracking, tilt risk detection, and FOMO indexes' };
      case 'mistake_analysis':
        return { title: 'Mistake Analysis', subtitle: 'Error classification and quantitative cost-of-mistake calculator' };
      case 'replay':
        return { title: 'Replay', subtitle: 'Interactive bar-by-bar candle player with SL/TP visualization' };
      case 'ai_quant_analyst':
        return { title: 'AI Quant Analyst', subtitle: 'LLM quant researcher connected to DuckDB and Project APEX' };
      case 'research_reports':
        return { title: 'Research Reports', subtitle: 'Automated strategy validation certificates and PDF research memos' };
      case 'insights':
        return { title: 'Insights', subtitle: 'Real-time alpha decay warnings and market regime notifications' };
      case 'data_sources':
        return { title: 'Data Sources', subtitle: 'Dukascopy & CCXT data feed connectivity and storage partitions' };
      case 'settings':
        return { title: 'Settings', subtitle: 'System-wide risk limits, taker fee defaults, and circuit breaker governance' };
      default:
        return { title: 'Dashboard', subtitle: 'Overview of your research, strategies, and edge development' };
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard data={dashboardData} onNavigate={(p) => setActivePage(p)} />;
      case 'data_lab':
        return <DataLabPage />;
      case 'strategy_lab':
        return <StrategyLabPage />;
      case 'backtesting':
        return <BacktestingPage />;
      case 'optimization':
        return <OptimizationPage />;
      case 'experiments':
        return <ExperimentsPage />;
      case 'edge_explorer':
        return <EdgeExplorerPage />;
      case 'condition_analysis':
        return <ConditionAnalysisPage />;
      case 'regime_analysis':
        return <RegimeAnalysisPage />;
      case 'pattern_mining':
        return <PatternMiningPage />;
      case 'correlation':
        return <CorrelationPage />;
      case 'walk_forward':
        return <WalkForwardPage />;
      case 'out_of_sample':
        return <OutOfSamplePage />;
      case 'monte_carlo':
        return <MonteCarloPage />;
      case 'robustness':
        return <RobustnessPage />;
      case 'overfitting_detector':
        return <OverfittingDetectorPage />;
      case 'performance':
        return <PerformancePage />;
      case 'trade_analytics':
        return <TradeAnalyticsPage />;
      case 'statistical_lab':
        return <StatisticalLabPage />;
      case 'strategy_comparison':
        return <StrategyComparisonPage />;
      case 'journal':
        return <JournalPage />;
      case 'psychology':
        return <PsychologyPage />;
      case 'mistake_analysis':
        return <MistakeAnalysisPage />;
      case 'replay':
        return <ReplayPage />;
      case 'ai_quant_analyst':
        return <AIQuantAnalystPage />;
      case 'research_reports':
        return <ResearchReportsPage />;
      case 'insights':
        return <InsightsPage />;
      case 'data_sources':
        return <DataSourcesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard data={dashboardData} onNavigate={(p) => setActivePage(p)} />;
    }
  };

  const { title, subtitle } = getPageInfo(activePage);

  return (
    <div className="flex h-screen w-screen bg-[#07090E] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      {isSidebarOpen && (
        <Sidebar activePage={activePage} onSelectPage={(p) => setActivePage(p)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto bg-[#07090E]">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(p) => setActivePage(p)}
      />
    </div>
  );
};
