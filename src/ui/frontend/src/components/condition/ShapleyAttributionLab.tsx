import React from 'react';
import { ShieldCheck, BarChart3 } from 'lucide-react';
import { ConditionFeature } from './ConditionLiftRanking';

interface ShapleyAttributionLabProps {
  conditions: ConditionFeature[];
}

export const ShapleyAttributionLab: React.FC<ShapleyAttributionLabProps> = ({ conditions }) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs">Shapley Value Marginal Feature Importance</h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold">Variance Explained %</span>
      </div>

      <div className="space-y-3.5 py-1">
        {conditions.map((item) => {
          const pct = Math.round(item.importance_score * 100);
          return (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 font-bold truncate max-w-[240px]">{item.name}</span>
                <span className="text-cyan-300 font-extrabold font-mono">{pct}% Attribution</span>
              </div>
              <div className="w-full h-2 bg-[#07090e] border border-[#161c28] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-[#07090e] border border-[#161c28] rounded-xl text-[10px] text-slate-400 space-y-1 mt-2">
        <div className="font-bold text-white flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Shapley Axiomatic Fairness Guarantee</span>
        </div>
        <p>
          Marginal contributions $\phi_i$ sum exactly to 100% of excess strategy alpha, isolating interaction synergy from indicator overlap.
        </p>
      </div>
    </div>
  );
};
