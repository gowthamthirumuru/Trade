import React from 'react';
import {
  FileCheck2,
  Sparkles,
  ShieldCheck,
  BookOpen,
  FastForward,
} from 'lucide-react';
import { RecentActivityItem } from '../../types';

interface RecentActivityProps {
  items: RecentActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ items }) => {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'experiment':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'edge':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'journal':
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
      case 'validation':
        return <FastForward className="w-3.5 h-3.5 text-cyan-400" />;
      case 'backtest':
      default:
        return <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="quant-card p-4 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <h2 className="text-sm font-bold text-white tracking-tight mb-3">
        Recent Activity
      </h2>

      {/* List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs py-1 hover:text-white transition group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded bg-[#161F38]/60 shrink-0">
                {getIcon(item.category)}
              </div>
              <span className="text-slate-300 group-hover:text-white transition truncate">
                {item.text}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium shrink-0 ml-2 font-mono">
              {item.time_ago}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
