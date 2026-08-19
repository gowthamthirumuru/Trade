import React, { useState } from 'react';
import {
  Layers,
  Star,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export interface PoolStrategy {
  id: string;
  name: string;
  pair: string;
  timeframe: string;
  category: string;
  expectancy_r: number;
  profit_factor: number;
  max_dd_pct: number;
  status: 'APPROVED' | 'TESTING' | 'RESEARCH';
  isFavorite?: boolean;
}

interface StrategyPoolListProps {
  strategies: PoolStrategy[];
  selectedStrategyId: string;
  onSelectStrategy: (strat: PoolStrategy) => void;
  onToggleFavorite?: (id: string) => void;
}

export const StrategyPoolList: React.FC<StrategyPoolListProps> = ({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  onToggleFavorite,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'FAVORITES'>('ALL');

  const filteredStrategies = strategies.filter((s) => {
    if (filter === 'APPROVED') return s.status === 'APPROVED';
    if (filter === 'FAVORITES') return s.isFavorite;
    return true;
  });

  return (
    <div className="quant-card p-4 border border-[#161c28] bg-[#0b0e14] font-mono text-xs select-none space-y-3">
      {/* Pool Header */}
      <div className="flex items-center justify-between border-b border-[#151a24] pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Registered Strategy Pool ({strategies.length} Active)</h3>
        </div>

        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'ALL' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-2 py-0.5 rounded transition ${
              filter === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Strategies Card List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredStrategies.map((strat) => {
          const isSelected = strat.id === selectedStrategyId || strat.name === selectedStrategyId;
          return (
            <div
              key={strat.id}
              onClick={() => onSelectStrategy(strat)}
              className={`p-2.5 rounded-xl border transition cursor-pointer relative group ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                  : 'bg-[#0e121a] hover:bg-[#141b26] border-[#1a2232]'
              }`}
            >
              {/* Card Top Row: Name + Subtitle + Badge + Star */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition">
                      {strat.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    <span>{strat.pair}</span> • <span>{strat.timeframe}</span> •{' '}
                    <span className="text-slate-500">{strat.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                      strat.status === 'APPROVED'
                        ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                        : 'bg-amber-950/80 border-amber-800 text-amber-400'
                    }`}
                  >
                    {strat.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(strat.id);
                    }}
                    className={`p-1 transition ${
                      strat.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${strat.isFavorite ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Card Bottom Row: Metrics Grid */}
              <div className="flex items-center justify-between text-[11px] pt-2 mt-1.5 border-t border-[#151a24]">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[10px]">Exp:</span>
                  <span
                    className={`font-bold ${
                      strat.expectancy_r >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {strat.expectancy_r >= 0 ? '+' : ''}
                    {strat.expectancy_r.toFixed(2)}R
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[10px]">PF:</span>
                  <span className="text-slate-200 font-bold">{strat.profit_factor.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[10px]">DD:</span>
                  <span className="text-rose-400 font-bold">{strat.max_dd_pct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      <div className="pt-1 text-right">
        <a
          href="#strategy_comparison"
          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1 transition"
        >
          <span>View all strategies</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
