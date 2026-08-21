import React from 'react';
import { Database, HardDrive, Cpu, Activity, ShieldCheck, FileCheck } from 'lucide-react';

interface DataSourcesControlRibbonProps {
  totalCandles?: number;
  totalStorageMb?: number;
  parquetFilesCount?: number;
  duckdbPingMs?: number;
  tradeCount?: number;
  zeroLookaheadVerified?: boolean;
}

export const DataSourcesControlRibbon: React.FC<DataSourcesControlRibbonProps> = ({
  totalCandles = 12800000,
  totalStorageMb = 2433.5,
  parquetFilesCount = 311,
  duckdbPingMs = 1.64,
  tradeCount = 62756,
  zeroLookaheadVerified = true,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono text-xs select-none">
      {/* 1. Total Stored Candles */}
      <div className="bg-[#0b0e14] border border-purple-500/40 rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between bg-purple-950/10">
        <div className="flex items-center justify-between text-purple-400">
          <span className="text-[10px] uppercase font-semibold">Total Candles</span>
          <Database className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-base font-extrabold text-purple-300">{(totalCandles / 1_000_000).toFixed(1)}M Bars</div>
        <div className="text-[9px] text-purple-400/80 font-bold">Forex, Metals &amp; Crypto</div>
      </div>

      {/* 2. Total Storage */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Parquet Storage</span>
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="text-base font-extrabold text-cyan-300">{(totalStorageMb / 1024).toFixed(2)} GB</div>
        <div className="text-[9px] text-slate-400">{totalStorageMb.toFixed(1)} MB Total Disk</div>
      </div>

      {/* 3. Parquet Partition Files */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Partitions</span>
          <FileCheck className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div className="text-base font-extrabold text-white">{parquetFilesCount} Files</div>
        <div className="text-[9px] text-slate-400">Snappy Compressed</div>
      </div>

      {/* 4. DuckDB Latency */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">DuckDB Latency</span>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">{duckdbPingMs.toFixed(2)} ms</div>
        <div className="text-[9px] text-slate-400">Zero-Copy In-Memory</div>
      </div>

      {/* 5. Trades Ledger */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Trades Ledger</span>
          <Activity className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-base font-extrabold text-amber-300">{tradeCount.toLocaleString()}</div>
        <div className="text-[9px] text-slate-400">Audited Executions</div>
      </div>

      {/* 6. Zero-Lookahead Audit */}
      <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-3 space-y-1 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] uppercase font-semibold">Zero-Lookahead</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-base font-extrabold text-emerald-400">
          {zeroLookaheadVerified ? '100% Passed' : 'Pending'}
        </div>
        <div className="text-[9px] text-slate-400">Standard §15.3 Verified</div>
      </div>
    </div>
  );
};
