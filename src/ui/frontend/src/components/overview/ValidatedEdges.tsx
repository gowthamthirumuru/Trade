import React from 'react';
import { Star } from 'lucide-react';
import { ValidatedEdge } from '../../types';

interface ValidatedEdgesProps {
  edges: ValidatedEdge[];
  onViewAll?: () => void;
  onSelectEdge?: (edge: ValidatedEdge) => void;
}

export const ValidatedEdges: React.FC<ValidatedEdgesProps> = ({
  edges,
  onViewAll,
  onSelectEdge,
}) => {
  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i <= count ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="quant-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#161F38] flex items-center justify-between">
        <h2 className="text-sm font-bold text-white tracking-tight">Top Validated Edges</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
        >
          View all
        </button>
      </div>

      {/* Edge Card List */}
      <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
        {edges.map((edge, idx) => (
          <div
            key={edge.id}
            onClick={() => onSelectEdge && onSelectEdge(edge)}
            className="p-3 rounded-lg bg-[#0B0E17]/80 border border-[#161F38] hover:border-emerald-500/40 hover:bg-[#101426] cursor-pointer transition flex flex-col gap-2 group"
          >
            {/* Title & Badge Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#161F38] text-slate-300 text-[11px] font-bold flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                  {edge.pair} • {edge.strategy_name}
                </span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                {edge.status}
              </span>
            </div>

            {/* Condition Filters */}
            <div className="text-[11px] text-slate-400 truncate">
              {edge.filters_desc}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-5 gap-1 pt-1.5 border-t border-[#161F38]/60 text-[10px] items-center">
              <div>
                <span className="text-slate-500 block">Expectancy</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{edge.expectancy_r.toFixed(2)}R
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Trades</span>
                <span className="font-mono text-slate-300 font-medium">
                  {edge.trades_count}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">OOS</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{edge.oos_expectancy_r.toFixed(2)}R
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Profit Factor</span>
                <span className="font-mono text-slate-300 font-medium">
                  {edge.profit_factor.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Confidence</span>
                {renderStars(edge.confidence_stars)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
