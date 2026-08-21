import React from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface MarketInsightItem {
  id: string;
  category: string;
  severity: string;
  severity_badge: string;
  severity_color?: string;
  title: string;
  symbol: string;
  strategy: string;
  metrics: string;
  description: string;
  action_directive: string;
  timestamp: string;
}

interface InsightsCardGridProps {
  insights: MarketInsightItem[];
}

export const InsightsCardGrid: React.FC<InsightsCardGridProps> = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs select-none">
      {insights.map((ins) => {
        const isCritical = ins.severity === 'CRITICAL' || ins.severity === 'WARNING';
        const isOpportunity = ins.severity === 'OPPORTUNITY';
        const isVerified = ins.severity === 'VERIFIED';

        return (
          <div
            key={ins.id}
            className={`bg-[#0b0e14] rounded-xl p-4.5 border flex flex-col justify-between space-y-3 transition hover:shadow-lg ${
              isCritical
                ? 'border-rose-500/40 hover:border-rose-500/70 bg-rose-950/5'
                : isOpportunity
                ? 'border-amber-500/40 hover:border-amber-500/70 bg-amber-950/5'
                : isVerified
                ? 'border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-950/5'
                : 'border-[#161c28] hover:border-cyan-500/40'
            }`}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[9px] font-extrabold rounded border ${
                    ins.severity_color || 'text-cyan-400 border-cyan-800 bg-cyan-950/20'
                  }`}
                >
                  {ins.severity_badge}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{ins.id}</span>
              </div>
              <span className="text-[10px] text-slate-500">{ins.timestamp}</span>
            </div>

            {/* Title & Tags */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="px-1.5 py-0.5 bg-[#07090e] border border-[#1a2232] rounded text-slate-300">
                  {ins.symbol}
                </span>
                <span className="px-1.5 py-0.5 bg-[#07090e] border border-[#1a2232] rounded text-amber-400 font-bold">
                  {ins.strategy}
                </span>
              </div>
              <h3 className="font-bold text-white text-xs leading-snug">{ins.title}</h3>
            </div>

            {/* Quantitative Proof Metrics */}
            <div className="p-2 bg-[#07090e] rounded-lg border border-[#161c28] text-[10px] text-slate-300">
              <strong className="text-slate-400 font-sans">Quant Evidence:</strong> {ins.metrics}
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              {ins.description}
            </p>

            {/* Action Directive */}
            <div className="p-2.5 bg-[#07090e] border border-[#161c28] rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Actionable Quant Directive</span>
              </div>
              <p className="text-[11px] text-slate-200 font-sans leading-snug">
                {ins.action_directive}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
