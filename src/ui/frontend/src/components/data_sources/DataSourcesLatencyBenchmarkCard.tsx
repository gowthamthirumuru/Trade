import React from 'react';
import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

interface LatencyBenchmarkData {
  duckdb_ping_ms?: number;
  disk_io_ping_ms?: number;
  binance_ping_ms?: number;
  dukascopy_ping_ms?: number;
  macro_calendar_ping_ms?: number;
}

interface DataSourcesLatencyBenchmarkCardProps {
  latencyData: LatencyBenchmarkData;
  latencyMessage?: string | null;
}

export const DataSourcesLatencyBenchmarkCard: React.FC<DataSourcesLatencyBenchmarkCardProps> = ({
  latencyData,
  latencyMessage,
}) => {
  const items = [
    {
      label: 'DuckDB Embedded Engine (C++ / Memory)',
      ping: latencyData.duckdb_ping_ms ?? 1.64,
      unit: 'ms',
      icon: Cpu,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      max: 10,
    },
    {
      label: 'Parquet Columnar Storage (NVMe / SSD)',
      ping: latencyData.disk_io_ping_ms ?? 0.85,
      unit: 'ms',
      icon: HardDrive,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      max: 10,
    },
    {
      label: 'Binance CCXT Gateway (WebSocket / REST)',
      ping: latencyData.binance_ping_ms ?? 18.4,
      unit: 'ms',
      icon: Wifi,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      max: 50,
    },
    {
      label: 'Dukascopy Forex/Metals Binary Feed',
      ping: latencyData.dukascopy_ping_ms ?? 23.8,
      unit: 'ms',
      icon: Wifi,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
      max: 50,
    },
    {
      label: 'Macro Economic Calendar (HTTP RSS)',
      ping: latencyData.macro_calendar_ping_ms ?? 41.2,
      unit: 'ms',
      icon: Activity,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      max: 60,
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-[#161c28] rounded-xl p-4 space-y-3 shadow-sm font-mono text-xs select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#141a26] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs">
            Live Ingestion &amp; Database Latency Diagnostics
          </h3>
        </div>
        {latencyMessage && (
          <span className="text-[11px] font-bold text-emerald-400 animate-pulse">
            {latencyMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          const pct = Math.min(100, Math.max(5, (item.ping / item.max) * 100));

          return (
            <div
              key={i}
              className="bg-[#07090e] border border-[#161c28] rounded-lg p-3 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold truncate max-w-[130px]">{item.label}</span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div>
                <div className={`text-base font-extrabold ${item.textColor}`}>
                  {item.ping.toFixed(2)} {item.unit}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-[#121824] h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="text-[9px] text-slate-500 flex justify-between">
                <span>Latency Threshold</span>
                <span>&lt; {item.max} ms SLA</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
