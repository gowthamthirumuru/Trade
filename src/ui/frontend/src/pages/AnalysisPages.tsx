import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Calculator,
  GitCompare,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

import { PerformancePage } from '../components/performance/PerformancePage';
export { PerformancePage };

import { TradeAnalyticsPage } from '../components/trade_analytics/TradeAnalyticsPage';
export { TradeAnalyticsPage };

import { StatsLabPage } from '../components/stats_lab/StatsLabPage';
export { StatsLabPage };

import { StrategyComparisonPage } from '../components/strategy_comparison/StrategyComparisonPage';
export { StrategyComparisonPage };
export const ComparisonPage = StrategyComparisonPage;
export const StatisticalLabPage = StatsLabPage;

