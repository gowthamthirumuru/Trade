import React from 'react';
import { Layers, Activity, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

export interface FeatureCondition {
  id?: string;
  name: string;
  category?: string;
  lift_pct: string;
  win_rate_before?: number;
  win_rate_after: number;
  expectancy_before?: number;
  expectancy_after: number;
  importance_score: number;
  p_value: number;
  trades_count?: number;
  rule?: string;
}

interface ConditionAttributionCardProps {
  strategyName?: string;
  pairName?: string;
  conditions?: FeatureCondition[];
}

export const ConditionAttributionCard: React.FC<ConditionAttributionCardProps> = ({
  strategyName = 'BB Reversion v4',
  pairName = 'XAUUSD',
  conditions = [],
}) => {
  const safeConditions = conditions.length > 0 ? conditions : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-mono text-xs select-none">
      {/* Left: Feature Lift Ranking Table */}
      <div className="lg:col-span-7 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-xs">
              Condition Lift Ranking ({strategyName} • {pairName})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Shapley Permutation Decomposition</span>
        </div>

        {safeConditions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            Calculating point-in-time condition attribution...
          </div>
        ) : (
          <div className="space-y-2.5">
            {safeConditions.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-xl bg-[#07090e] border border-[#161c28] space-y-2 hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{item.name}</span>
                    {item.category && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#121824] text-slate-400 border border-[#1a2232]">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 rounded font-extrabold font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 text-xs">
                    {item.lift_pct}
                  </span>
                </div>

                {item.rule && <p className="text-[10px] text-slate-400 font-sans">{item.rule}</p>}

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1.5 text-slate-400 border-t border-[#141a26]">
                  <div>
                    Win-Rate: <span className="text-emerald-400 font-bold">{item.win_rate_after}%</span>
                  </div>
                  <div>
                    Expectancy: <span className="text-emerald-400 font-bold">+{item.expectancy_after}R</span>
                  </div>
                  <div>
                    Significance: <span className="text-cyan-300 font-bold">p = {item.p_value.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Permutation Importance Chart */}
      <div className="lg:col-span-5 bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
          <h3 className="font-bold text-white text-xs">Permutation Feature Importance</h3>
          <span className="text-[10px] text-cyan-400 font-bold">Shapley Impact %</span>
        </div>

        {safeConditions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            Evaluating Shapley feature attributions...
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {safeConditions.map((c, i) => {
              const pct = Math.round(c.importance_score * 100);
              return (
                <div key={c.id || i} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-bold truncate max-w-[200px]">
                      {c.name.split('(')[0]}
                    </span>
                    <span className="text-cyan-300 font-extrabold font-mono">{pct}% Contribution</span>
                  </div>
                  <div className="w-full h-2 bg-[#07090e] border border-[#161c28] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-3 bg-[#07090e] border border-[#161c28] rounded-xl text-[10px] text-slate-400 space-y-1">
          <div className="font-bold text-white flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Multicollinearity Guarantee</span>
          </div>
          <p>
            Feature importance computed via permutation shuffling of validation trades preserving market structure dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};
