import React from 'react';
import { FileText, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export interface ResearchReportItem {
  id: string;
  title: string;
  date: string;
  type: string;
  badge: string;
  badge_color?: string;
  strategy: string;
  pair: string;
  timeframe: string;
  summary: string;
  status: string;
  content: string;
}

interface ResearchReportsListProps {
  reports: ResearchReportItem[];
  selectedReportId: string | null;
  onSelectReport: (report: ResearchReportItem) => void;
}

export const ResearchReportsList: React.FC<ResearchReportsListProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
}) => {
  return (
    <div className="space-y-3 font-mono text-xs select-none">
      {reports.map((r) => {
        const isSelected = selectedReportId === r.id;

        return (
          <div
            key={r.id}
            onClick={() => onSelectReport(r)}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
              isSelected
                ? 'bg-[#121824] border-cyan-500/80 shadow-md shadow-cyan-500/10'
                : 'bg-[#0b0e14] border-[#161c28] hover:border-cyan-500/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">#{r.id}</span>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                    r.badge_color || 'text-cyan-400 border-cyan-800 bg-cyan-950/20'
                  }`}
                >
                  {r.badge}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{r.date}</span>
            </div>

            <h3 className="font-bold text-white text-xs leading-snug">
              {r.title}
            </h3>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              {r.summary}
            </p>

            <div className="pt-2 border-t border-[#141a26] flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-[#07090e] border border-[#1a2232] rounded text-slate-300">
                  {r.strategy}
                </span>
                <span className="px-1.5 py-0.5 bg-[#07090e] border border-[#1a2232] rounded text-cyan-400 font-bold">
                  {r.pair} • {r.timeframe}
                </span>
              </div>

              <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:underline">
                <span>View Tearsheet</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
