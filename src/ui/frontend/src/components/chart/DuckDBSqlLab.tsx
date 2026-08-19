import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';

interface ColumnMeta {
  name: string;
  type: string;
}

interface DuckDBSqlLabProps {
  activePair?: string;
  activeTimeframe?: string;
}

export const DuckDBSqlLab: React.FC<DuckDBSqlLabProps> = ({
  activePair = 'BTCUSDT',
  activeTimeframe = '15m',
}) => {
  const quantPresets = [
    {
      id: 'hourly-edge',
      name: 'Hourly Directional Edge & Win Rate',
      desc: 'Average returns & long win-rate by UTC hour across 8 years of data',
      sql: `SELECT 
    strftime(open_time, '%H') as hour_utc,
    count(*) as total_bars,
    round(avg((close - open) / open * 100), 3) as avg_return_pct,
    round(sum(case when close > open then 1 else 0 end) * 100.0 / count(*), 1) as win_rate_pct,
    round(avg(high - low), 2) as avg_range_usd
FROM read_parquet('data/raw/binance/${activePair}/${activeTimeframe}.parquet')
GROUP BY hour_utc
ORDER BY hour_utc ASC`,
    },
    {
      id: 'day-of-week-vol',
      name: 'Day-of-Week Volatility & Expansion',
      desc: 'Price expansion and daily ATR distribution by weekday (Mon–Sun)',
      sql: `SELECT 
    dayname(open_time) as weekday,
    count(*) as total_days,
    round(avg(high - low), 2) as avg_range_usd,
    round(avg((high - low) / open * 100), 2) as avg_volatility_pct,
    round(avg(volume), 2) as avg_daily_volume_btc
FROM read_parquet('data/raw/binance/${activePair}/1d.parquet')
GROUP BY weekday, dayofweek(open_time)
ORDER BY dayofweek(open_time) ASC`,
    },
    {
      id: 'top-expansion-candles',
      name: 'Top 15 Largest Expansion Candles',
      desc: 'Outlier volatility shock events in Bitcoin historical record',
      sql: `SELECT 
    strftime(open_time, '%Y-%m-%d %H:%M') as candle_time_utc,
    round(open, 2) as open,
    round(high, 2) as high,
    round(low, 2) as low,
    round(close, 2) as close,
    round(high - low, 2) as range_usd,
    round((high - low) / open * 100, 2) as range_pct,
    round(volume, 2) as volume_btc
FROM read_parquet('data/raw/binance/${activePair}/1h.parquet')
ORDER BY range_usd DESC
LIMIT 15`,
    },
    {
      id: 'macro-yearly-regime',
      name: 'Macro Yearly Performance (2017–2025)',
      desc: 'Annualized price boundaries, returns, and turnover volume',
      sql: `SELECT 
    strftime(open_time, '%Y') as year,
    count(*) as total_days,
    round(min(low), 2) as annual_low_usd,
    round(max(high), 2) as annual_high_usd,
    round((last(close) - first(open)) / first(open) * 100, 2) as net_return_pct,
    round(sum(volume), 2) as total_volume_btc
FROM read_parquet('data/raw/binance/${activePair}/1d.parquet')
GROUP BY year
ORDER BY year ASC`,
    },
    {
      id: 'continuity-check',
      name: 'Zero-Discontinuity Gap Verification',
      desc: 'DuckDB vectorized scan validating timestamp continuity',
      sql: `WITH ranked AS (
    SELECT 
        open_time,
        LAG(open_time) OVER (ORDER BY open_time) as prev_time
    FROM read_parquet('data/raw/binance/${activePair}/${activeTimeframe}.parquet')
)
SELECT 
    open_time as current_bar_time,
    prev_time as previous_bar_time,
    epoch(open_time) - epoch(prev_time) as diff_seconds,
    round((epoch(open_time) - epoch(prev_time)) / 60, 1) as missing_duration_min
FROM ranked
WHERE epoch(open_time) - epoch(prev_time) > 1350
ORDER BY diff_seconds DESC
LIMIT 10`,
    },
  ];

  const [query, setQuery] = useState(quantPresets[0].sql);
  const [activePreset, setActivePreset] = useState<string>(quantPresets[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    columns: ColumnMeta[];
    rows: any[];
    row_count: number;
    execution_ms: number;
    error?: string;
  }>({
    status: 'IDLE',
    columns: [],
    rows: [],
    row_count: 0,
    execution_ms: 0,
  });

  const [copied, setCopied] = useState(false);

  const handleRunQuery = async (queryToRun?: string) => {
    const sql = queryToRun || query;
    if (!sql.trim()) return;
    setIsRunning(true);

    try {
      const res = await fetch('/api/v1/research/datalab/sql-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const data = await res.json();
      if (data && data.status === 'SUCCESS') {
        setResult({
          status: 'SUCCESS',
          columns: data.columns || [],
          rows: data.rows || [],
          row_count: data.row_count || 0,
          execution_ms: data.execution_ms || 0,
        });
      } else {
        setResult({
          status: 'ERROR',
          columns: [],
          rows: [],
          row_count: 0,
          execution_ms: data?.execution_ms || 0,
          error: data?.error || 'SQL execution failed.',
        });
      }
    } catch (err: any) {
      setResult({
        status: 'ERROR',
        columns: [],
        rows: [],
        row_count: 0,
        execution_ms: 0,
        error: err?.message || 'Network error executing SQL query.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectPreset = (preset: (typeof quantPresets)[0]) => {
    setActivePreset(preset.id);
    setQuery(preset.sql);
    handleRunQuery(preset.sql);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!result.rows || result.rows.length === 0) return;
    const headers = result.columns.map((c) => c.name).join(',');
    const rows = result.rows.map((row) =>
      result.columns.map((col) => {
        const val = row[col.name];
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val ?? '';
      }).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `APEX_SQL_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (!result.rows || result.rows.length === 0) return;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result.rows, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `APEX_SQL_Export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="quant-card p-5 space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Embedded DuckDB SQL Lab & Parquet Analytics Sandbox
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-sans font-semibold">
                Zero-Copy OLAP
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Direct vector queries on raw Snappy Parquet partitions with sub-millisecond execution
            </p>
          </div>
        </div>

        {result.status === 'SUCCESS' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">{result.row_count.toLocaleString()}</span> rows in{' '}
              <span className="text-purple-400 font-bold">{result.execution_ms}ms</span>
            </span>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#222] border border-neutral-700 text-slate-200 rounded-lg text-xs font-bold transition shadow"
              title="Download results as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#222] border border-neutral-700 text-slate-200 rounded-lg text-xs font-bold transition shadow"
              title="Download results as JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>JSON</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Quant Templates */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Institutional Quant Presets:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {quantPresets.map((p) => {
            const isActive = activePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`text-left p-2.5 rounded-xl border transition ${
                  isActive
                    ? 'bg-purple-950/50 border-purple-600 text-white shadow-lg'
                    : 'bg-[#0e0e0e] border-neutral-850 hover:border-neutral-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500 font-sans line-clamp-1 mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SQL Editor Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-medium">SQL Editor (DuckDB Dialect):</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition px-2 py-0.5 rounded bg-neutral-900"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => handleRunQuery()}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-900/30 transition"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Executing...' : 'Run Query (Ctrl+Enter)'}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRunQuery();
              }
            }}
            rows={5}
            className="w-full bg-[#080808] border border-neutral-800 rounded-xl p-3.5 text-xs text-purple-200 font-mono focus:border-purple-500 focus:outline-none shadow-inner leading-relaxed resize-y selection:bg-purple-900"
            placeholder="SELECT * FROM read_parquet('data/raw/binance/BTCUSDT/15m.parquet') LIMIT 50..."
          />
        </div>
      </div>

      {/* Results View */}
      {result.status === 'ERROR' && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5">
            <div className="font-bold">SQL Execution Error</div>
            <div className="text-[11px] font-sans text-rose-200">{result.error}</div>
          </div>
        </div>
      )}

      {result.status === 'SUCCESS' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Query Results:</span>
            <span className="text-slate-500">Showing top {Math.min(500, result.rows.length)} rows</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 max-h-72 overflow-y-auto scrollbar-thin bg-[#070707]">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-[#111] text-slate-400 sticky top-0 border-b border-neutral-800">
                <tr>
                  <th className="p-2.5 text-slate-600 font-normal w-10 text-center">#</th>
                  {result.columns.map((col) => (
                    <th key={col.name} className="p-2.5 font-bold text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span>{col.name}</span>
                        <span className="text-[9px] text-slate-600 font-normal lowercase font-sans">
                          {col.type.replace('int64', 'int').replace('float64', 'num')}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-slate-300">
                {result.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#121212] transition">
                    <td className="p-2.5 text-center text-slate-600 text-[10px]">{idx + 1}</td>
                    {result.columns.map((col) => {
                      const val = row[col.name];
                      const isNum = typeof val === 'number';
                      return (
                        <td
                          key={col.name}
                          className={`p-2.5 truncate max-w-[220px] ${
                            isNum ? 'text-emerald-400 font-semibold' : 'text-slate-200'
                          }`}
                        >
                          {val !== null && val !== undefined ? (isNum ? val.toLocaleString() : String(val)) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
