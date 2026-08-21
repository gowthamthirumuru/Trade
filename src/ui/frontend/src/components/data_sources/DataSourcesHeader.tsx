import React from 'react';
import { Server, RotateCcw, Filter, Activity, HardDrive } from 'lucide-react';

interface DataSourcesHeaderProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onTestLatency: () => void;
  onSyncLake: () => void;
  isTestingLatency: boolean;
  isSyncing: boolean;
}

export const DataSourcesHeader: React.FC<DataSourcesHeaderProps> = ({
  selectedCategory,
  onCategoryChange,
  onTestLatency,
  onSyncLake,
  isTestingLatency,
  isSyncing,
}) => {
  const categories = [
    { label: 'All Feeds', val: 'ALL' },
    { label: 'Market Archives', val: 'ARCHIVE' },
    { label: 'Database Storage', val: 'STORAGE' },
    { label: 'Macro Feeds', val: 'MACRO' },
  ];

  return (
    <div className="bg-[#0b0e14] border-b border-[#161c28] px-4 py-2.5 select-none font-mono flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-slate-500 text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-purple-400" />
          <span>Category</span>
        </span>
        {categories.map((c) => {
          const isActive = selectedCategory === c.val;
          return (
            <button
              key={c.val}
              onClick={() => onCategoryChange(c.val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white bg-[#07090e] border border-[#1a2232]'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onTestLatency}
          disabled={isTestingLatency}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07090e] hover:bg-[#121824] border border-[#1a2232] rounded-lg text-slate-200 hover:text-white font-bold text-xs transition active:scale-95 whitespace-nowrap"
        >
          <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isTestingLatency ? 'animate-spin' : ''}`} />
          <span>{isTestingLatency ? 'Benchmarking...' : 'Test Feed Latency'}</span>
        </button>

        <button
          onClick={onSyncLake}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold rounded-lg text-xs shadow-lg shadow-purple-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Synchronize Lake'}</span>
        </button>
      </div>
    </div>
  );
};
