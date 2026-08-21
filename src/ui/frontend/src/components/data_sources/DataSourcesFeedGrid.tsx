import React from 'react';
import { Server, HardDrive, Database, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';

export interface DataSourceFeedItem {
  id: string;
  name: string;
  type: string;
  status: string;
  candles: string;
  storage_mb: string;
  ping: string;
  last_sync: string;
  protocol: string;
  instruments_count: number;
  sla_uptime: string;
}

interface DataSourcesFeedGridProps {
  feeds: DataSourceFeedItem[];
}

export const DataSourcesFeedGrid: React.FC<DataSourcesFeedGridProps> = ({ feeds }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs select-none">
      {feeds.map((f) => {
        const isActive = f.status === 'ACTIVE' || f.status === 'MOUNTED' || f.status === 'HEALTHY';

        return (
          <div
            key={f.id}
            className="bg-[#0b0e14] rounded-xl p-4.5 border border-[#161c28] hover:border-purple-500/40 transition shadow-sm flex flex-col justify-between space-y-3"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-400 text-xs">#{f.id}</span>
                <span className="text-[10px] text-slate-400 font-bold">{f.type}</span>
              </div>
              <span
                className={`px-2 py-0.5 text-[9px] font-extrabold rounded border ${
                  isActive
                    ? 'text-emerald-400 border-emerald-800 bg-emerald-950/20'
                    : 'text-amber-400 border-amber-800 bg-amber-950/20'
                }`}
              >
                {f.status}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-bold text-white text-xs leading-snug">{f.name}</h3>

            {/* Metrics Breakdown */}
            <div className="space-y-1.5 text-[11px] pt-2 border-t border-[#141a26]">
              <div className="flex justify-between text-slate-400">
                <span>Total Data Rows:</span>
                <span className="text-white font-bold">{f.candles}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Disk Storage:</span>
                <span className="text-cyan-300 font-bold">{f.storage_mb}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Network / I/O Ping:</span>
                <span className="text-emerald-400 font-bold">{f.ping}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ingestion Protocol:</span>
                <span className="text-slate-300">{f.protocol}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SLA Availability:</span>
                <span className="text-purple-300 font-bold">{f.sla_uptime}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[#141a26] flex justify-between items-center text-[10px] text-slate-400">
              <span>Last Sync: {f.last_sync}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
