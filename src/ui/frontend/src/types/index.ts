export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  subtext: string;
  badge_type: 'positive' | 'neutral' | 'warning' | 'highlight';
  sparkline: number[];
}

export interface StrategyItem {
  rank: number;
  name: string;
  expectancy_r: number;
  oos_expectancy_r: number;
  profit_factor: number;
  max_dd_pct: number;
  robustness_score: number;
  trades_count: number;
  sparkline: number[];
  trend: 'up' | 'down' | 'flat';
}

export interface ValidatedEdge {
  id: number;
  pair: string;
  strategy_name: string;
  filters_desc: string;
  expectancy_r: number;
  trades_count: number;
  oos_expectancy_r: number;
  profit_factor: number;
  confidence_stars: number;
  status: string;
}

export interface ActiveExperiment {
  id: string;
  title: string;
  strategy: string;
  stage: string;
  progress_pct: number;
  status_color: string;
}

export interface ExpectancyPoint {
  date: string;
  expectancy: number;
  strategy: string;
}

export interface RobustnessDistribution {
  total_strategies: number;
  average_robustness: number;
  high_count: number;
  high_pct: number;
  medium_count: number;
  medium_pct: number;
  low_count: number;
  low_pct: number;
}

export interface ResearchWarning {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  created_at: string;
}

export interface DataHealthItem {
  instrument: string;
  quality_pct: number;
  time_range: string;
  candles_count: string;
}

export interface DataHealthSummary {
  overall_quality_pct: number;
  items: DataHealthItem[];
}

export interface TraderSkill {
  name: string;
  score: number;
  color: string;
}

export interface TraderDevelopmentSummary {
  overall_score: number;
  skills: TraderSkill[];
}

export interface JournalSummary {
  total_trades_logged: number;
  rules_broken: number;
  rules_broken_pct: number;
  best_performing_day: string;
  avg_r_per_trade: number;
  most_common_mistake: string;
  review_consistency_pct: number;
}

export interface RecentActivityItem {
  id: string;
  text: string;
  time_ago: string;
  category: string;
}

export interface DashboardData {
  kpis: KpiMetric[];
  strategies: StrategyItem[];
  validated_edges: ValidatedEdge[];
  active_experiments: ActiveExperiment[];
  expectancy_history: ExpectancyPoint[];
  robustness_distribution: RobustnessDistribution;
  warnings: ResearchWarning[];
  data_health: DataHealthSummary;
  trader_development: TraderDevelopmentSummary;
  journal_summary: JournalSummary;
  recent_activity: RecentActivityItem[];
}
