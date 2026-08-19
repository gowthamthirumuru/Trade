import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { TraderDevelopmentSummary, JournalSummary } from '../../types';

interface TraderDevelopmentProps {
  traderDev: TraderDevelopmentSummary;
  journal: JournalSummary;
}

export const TraderDevelopment: React.FC<TraderDevelopmentProps> = ({
  traderDev,
  journal,
}) => {
  const getSkillBarColor = (color: string) => {
    switch (color) {
      case 'teal':
        return 'bg-teal-400';
      case 'cyan':
        return 'bg-cyan-400';
      case 'purple':
        return 'bg-purple-500';
      case 'amber':
        return 'bg-amber-400';
      case 'emerald':
      default:
        return 'bg-emerald-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 h-full">
      {/* Left: Trader Development Skills */}
      <div className="quant-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-white tracking-tight">Trader Development</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Overall Score Circle */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1a1a1a]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-400"
                strokeDasharray={`${traderDev.overall_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-extrabold font-mono text-white leading-none">
                {traderDev.overall_score}<span className="text-[9px] text-slate-400">/100</span>
              </span>
              <span className="text-[8px] text-slate-400 font-medium mt-0.5">Overall Score</span>
            </div>
          </div>

          {/* Skill Bars */}
          <div className="flex-1 space-y-1.5 text-xs">
            {traderDev.skills.map((skill) => (
              <div key={skill.name} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{skill.name}</span>
                  <span className="font-mono text-slate-300 font-semibold">{skill.score}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">

                  <div
                    className={`h-full rounded-full ${getSkillBarColor(skill.color)}`}
                    style={{ width: `${skill.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Journal Summary */}
      <div className="quant-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-white tracking-tight">Journal Summary</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs flex-1 items-center">
          {/* Metric 1 */}
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-500" />
              Total Trades Logged
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {journal.total_trades_logged}
            </div>
          </div>

          {/* Metric 2 */}
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400">Rules Broken</div>
            <div className="text-lg font-bold font-mono text-rose-400">
              {journal.rules_broken} <span className="text-xs font-normal text-rose-400/80">({journal.rules_broken_pct}%)</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400">Best Performing Day</div>
            <div className="text-sm font-bold text-white">
              {journal.best_performing_day}
            </div>
          </div>

          {/* Metric 4 */}
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-purple-400" />
              Most Common Mistake
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded">
                {journal.most_common_mistake}
              </span>
            </div>
          </div>

          {/* Metric 5 */}
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400">Review Consistency</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {journal.review_consistency_pct}%
            </div>
          </div>

          {/* Metric 6 */}
          <div className="space-y-0.5">
            <div className="text-[11px] text-slate-400">Avg R per Trade</div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              +{journal.avg_r_per_trade.toFixed(2)}R
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
