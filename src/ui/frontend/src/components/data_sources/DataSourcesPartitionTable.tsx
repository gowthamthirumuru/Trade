import React from 'react';
import { HardDrive, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export interface PartitionItem {
  symbol: string;
  asset_class: string;
  timeframe: string;
  partition_count: number;
  rows: string;
  size_mb: string;
  date_range: string;
  checksum: string;
  status: string;
}

interface DataSourcesPartitionTableProps {
  partitions: PartitionItem[];
}

export const DataSourcesPartitionTable: React.FC<DataSourcesPartitionTableProps> = ({ partitions }) => {
  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex items-center justify-between border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-purple-400" />
          <h3 className="font-bold text-white text-xs">
            Parquet Columnar Partition Ledger &amp; Storage Footprint
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">Zero-Lookahead Point-in-Time Partitions</span>
      </div>

      <div className="overflow-x-auto text-xs font-mono">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#141a26] text-slate-400 text-[10px] bg-[#07090e]">
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Asset Class</th>
              <th className="py-2.5 px-3">Timeframe</th>
              <th className="py-2.5 px-3">Partitions</th>
              <th className="py-2.5 px-3">Row Count</th>
              <th className="py-2.5 px-3">Disk Size</th>
              <th className="py-2.5 px-3">Historical Coverage</th>
              <th className="py-2.5 px-3">Integrity Checksum</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#141a26] text-slate-200 text-[11px]">
            {partitions.map((p) => (
              <tr key={p.symbol} className="hover:bg-[#121824] transition">
                <td className="py-2.5 px-3 font-bold text-white">{p.symbol}</td>
                <td className="py-2.5 px-3 text-purple-300 font-bold">{p.asset_class}</td>
                <td className="py-2.5 px-3 text-cyan-400 font-bold">{p.timeframe}</td>
                <td className="py-2.5 px-3 text-slate-300">{p.partition_count} files</td>
                <td className="py-2.5 px-3 text-white font-bold">{p.rows}</td>
                <td className="py-2.5 px-3 text-slate-300">{p.size_mb}</td>
                <td className="py-2.5 px-3 text-slate-400">{p.date_range}</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">{p.checksum}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded border bg-emerald-950 text-emerald-300 border-emerald-700">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
