import React, { useState } from 'react';
import { KpiRibbon } from '../components/overview/KpiRibbon';
import { StrategyTable } from '../components/overview/StrategyTable';
import { ValidatedEdges } from '../components/overview/ValidatedEdges';
import { ActiveExperiments } from '../components/overview/ActiveExperiments';
import { ExpectancyChart } from '../components/overview/ExpectancyChart';
import { RobustnessDonut } from '../components/overview/RobustnessDonut';
import { ResearchWarnings } from '../components/overview/ResearchWarnings';
import { DataHealth } from '../components/overview/DataHealth';
import { TraderDevelopment } from '../components/overview/TraderDevelopment';
import { RecentActivity } from '../components/overview/RecentActivity';
import { StrategyModal, EdgeModal, ExperimentModal } from '../components/overview/Modals';
import { DashboardData, StrategyItem, ValidatedEdge, ActiveExperiment, ResearchWarning } from '../types';

interface DashboardProps {
  data: DashboardData;
  onNavigate: (pageId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onNavigate }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyItem | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ValidatedEdge | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<ActiveExperiment | null>(null);

  const [experimentsList, setExperimentsList] = useState<ActiveExperiment[]>(data.active_experiments);

  const handleUpdateExperimentStage = (stage: string, progress: number) => {
    if (!selectedExperiment) return;
    setExperimentsList((prev) =>
      prev.map((e) =>
        e.id === selectedExperiment.id ? { ...e, stage, progress_pct: progress } : e
      )
    );
  };

  return (
    <div className="space-y-4 p-5 pb-12 max-w-[1780px] mx-auto animate-in fade-in duration-200">
      {/* 1. Top Ribbon KPI Cards */}
      <KpiRibbon kpis={data.kpis} />

      {/* 2. Top-Mid Grid: Strategy Table (Wide), Validated Edges, Active Experiments */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 h-[390px]">
          <StrategyTable
            strategies={data.strategies}
            onViewAll={() => onNavigate('strategy_lab')}
            onSelectStrategy={(strat) => setSelectedStrategy(strat)}
          />
        </div>
        <div className="xl:col-span-4 h-[390px]">
          <ValidatedEdges
            edges={data.validated_edges}
            onViewAll={() => onNavigate('edge_explorer')}
            onSelectEdge={(edge) => setSelectedEdge(edge)}
          />
        </div>
        <div className="xl:col-span-3 h-[390px]">
          <ActiveExperiments
            experiments={experimentsList}
            onViewAll={() => onNavigate('experiments')}
            onSelectExperiment={(exp) => setSelectedExperiment(exp)}
          />
        </div>
      </div>

      {/* 3. Mid-Bottom Grid: Expectancy Over Time, Robustness Donut, Research Warnings, Data Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 h-[270px]">
          <ExpectancyChart data={data.expectancy_history} />
        </div>
        <div className="xl:col-span-3 h-[270px]">
          <RobustnessDonut data={data.robustness_distribution} />
        </div>
        <div className="xl:col-span-3 h-[270px]">
          <ResearchWarnings
            warnings={data.warnings}
            onViewAll={() => onNavigate('overfitting_detector')}
          />
        </div>
        <div className="xl:col-span-2 h-[270px]">
          <DataHealth data={data.data_health} />
        </div>
      </div>

      {/* 4. Bottom Grid: Trader Development, Journal Summary, Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 h-[190px]">
          <TraderDevelopment
            traderDev={data.trader_development}
            journal={data.journal_summary}
          />
        </div>
        <div className="xl:col-span-4 h-[190px]">
          <RecentActivity items={data.recent_activity} />
        </div>
      </div>

      {/* Interactive Modal Dialogs */}
      <StrategyModal
        strategy={selectedStrategy}
        onClose={() => setSelectedStrategy(null)}
        onGoToLab={() => onNavigate('strategy_lab')}
      />

      <EdgeModal
        edge={selectedEdge}
        onClose={() => setSelectedEdge(null)}
        onExplore={() => onNavigate('edge_explorer')}
      />

      <ExperimentModal
        experiment={selectedExperiment}
        onClose={() => setSelectedExperiment(null)}
        onUpdateStage={handleUpdateExperimentStage}
      />
    </div>
  );
};
