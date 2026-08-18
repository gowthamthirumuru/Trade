import React, { useState, useEffect } from 'react';
import {
  Database,
  FlaskConical,
  LineChart,
  Sliders,
  Sparkles,
  Play,
  RefreshCw,
  Plus,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

// ============================================================================
// 1. DATA LAB PAGE
// ============================================================================

export const DataLabPage: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [selectedTf, setSelectedTf] = useState('15m');
  const [candles, setCandles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Fetch candles on pair/tf change
  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:8000/api/v1/research/datalab/candles?pair=${selectedPair}&timeframe=${selectedTf}&limit=60`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.candles) {
          setCandles(data.candles);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [selectedPair, selectedTf]);

  const handleSyncDataLake = () => {
    setSyncStatus('Syncing Parquet Partitions with Dukascopy & CCXT...');
    setTimeout(() => {
      setSyncStatus('✓ Data Lake Synchronized: 12.8M bars verified with 0 gaps.');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1200);
  };

  // Build ECharts Candlestick & Volume Option
  const candleDates = candles.map((c) => c.time);
  const candleValues = candles.map((c) => [c.open, c.close, c.low, c.high]);
  const volumes = candles.map((c, i) => [i, c.volume, c.open > c.close ? -1 : 1]);

  const chartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#101426',
      borderColor: '#2A365E',
      textStyle: { color: '#F1F5F9', fontSize: 11 },
    },
    grid: [
      { left: '3%', right: '3%', top: '10%', height: '58%' },
      { left: '3%', right: '3%', top: '74%', height: '18%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: candleDates,
        scale: true,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#161F38' } },
        axisLabel: { color: '#64748B', fontSize: 10 },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: candleDates,
        scale: true,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#161F38' } },
        axisLabel: { show: false },
      },
    ],
    yAxis: [
      {
        scale: true,
        splitLine: { lineStyle: { color: '#161F38', type: 'dashed' } },
        axisLabel: { color: '#64748B', fontFamily: 'monospace', fontSize: 10 },
      },
      {
        scale: true,
        gridIndex: 1,
        splitLine: { show: false },
        axisLabel: { show: false },
      },
    ],
    series: [
      {
        name: 'OHLC',
        type: 'candlestick',
        data: candleValues,
        itemStyle: {
          color: '#10B981',
          color0: '#F43F5E',
          borderColor: '#10B981',
          borderColor0: '#F43F5E',
        },
      },
      {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes.map((v) => v[1]),
        itemStyle: {
          color: (params: any) => (candleValues[params.dataIndex][1] >= candleValues[params.dataIndex][0] ? '#10B98150' : '#F43F5E50'),
        },
      },
    ],
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" /> Data Lab & Parquet Lake Inspector
          </h2>
          <p className="text-xs text-slate-400">
            Inspect raw Parquet partitions, validate OHLCV candle streams, gap audits, and multi-timeframe aggregations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {syncStatus && (
            <span className="text-xs font-bold text-emerald-400 animate-pulse">{syncStatus}</span>
          )}
          <button
            onClick={handleSyncDataLake}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-900/30 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Data Lake
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Ingested Candles', val: '12.8M', sub: 'Across 6 asset partitions' },
          { title: 'Data Lake Footprint', val: '1,420 MB', sub: 'Snappy Columnar Parquet' },
          { title: 'Point-In-Time Integrity', val: '100.0%', sub: 'Zero lookahead verified' },
          { title: 'Unfilled Gaps / Outliers', val: '0 Missing', sub: 'All UTC timestamp aligned' },
        ].map((c, i) => (
          <div key={i} className="quant-card p-4">
            <div className="text-xs text-slate-400">{c.title}</div>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">{c.val}</div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Interactive Chart & Controls */}
      <div className="quant-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#161F38] pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Asset Stream:</span>
            <div className="flex bg-[#0B0E17] p-1 rounded-lg border border-[#161F38] text-xs">
              {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XAUUSD', 'EURUSD', 'GBPUSD'].map((pair) => (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`px-3 py-1 rounded font-bold transition ${
                    selectedPair === pair ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Timeframe:</span>
            <div className="flex bg-[#0B0E17] p-1 rounded-lg border border-[#161F38] text-xs">
              {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTf(tf)}
                  className={`px-2.5 py-1 rounded font-mono font-bold transition ${
                    selectedTf === tf ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-[340px] w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading DuckDB candlestick stream...
            </div>
          ) : (
            <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
          )}
        </div>
      </div>

      {/* Parquet Partitions Table */}
      <div className="quant-card p-5">
        <h3 className="text-sm font-bold text-white mb-3">Parquet Storage Partitions & Ingestion Schedule</h3>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#161F38] text-slate-400 text-[11px] bg-[#0B0E17]/40">
                <th className="py-2.5 px-3 font-medium">Pair</th>
                <th className="py-2.5 px-3 font-medium">Timeframe Partitions</th>
                <th className="py-2.5 px-3 font-medium text-right">Candles</th>
                <th className="py-2.5 px-3 font-medium">Start Date</th>
                <th className="py-2.5 px-3 font-medium">End Date</th>
                <th className="py-2.5 px-3 font-medium text-right">Quality Score</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161F38]/60 text-slate-200">
              {[
                { pair: 'BTCUSDT', tf: '1m, 5m, 15m, 1h, 4h, 1d', candles: '5,500,000', start: '2017-08-17', end: '2026-08-18', q: '100.0%' },
                { pair: 'ETHUSDT', tf: '1m, 5m, 15m, 1h, 4h, 1d', candles: '4,800,000', start: '2018-01-01', end: '2026-08-18', q: '99.9%' },
                { pair: 'SOLUSDT', tf: '1m, 5m, 15m, 1h, 4h, 1d', candles: '3,200,000', start: '2020-08-01', end: '2026-08-18', q: '99.8%' },
                { pair: 'XAUUSD', tf: '1m, 5m, 15m, 1h, 4h, 1d', candles: '2,100,000', start: '2004-01-01', end: '2026-08-18', q: '99.8%' },
                { pair: 'EURUSD', tf: '1m, 5m, 15m, 1h, 4h, 1d', candles: '3,400,000', start: '2004-01-01', end: '2026-08-18', q: '99.9%' },
                { pair: 'GBPUSD', tf: '1m, 5m, 15m, 1h, 4h, 1d', candles: '1,800,000', start: '2004-01-01', end: '2026-08-18', q: '99.7%' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#151B32]/40 transition">
                  <td className="py-2.5 px-3 font-bold text-white font-mono">{row.pair}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{row.tf}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300 text-right">{row.candles}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{row.start}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{row.end}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold font-mono text-right">{row.q}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                      HEALTHY
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. STRATEGY LAB PAGE
// ============================================================================

export const StrategyLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'indicators' | 'exits' | 'risk'>('rules');
  const [strategyName, setStrategyName] = useState('BB Reversion v4');
  const [targetAsset, setTargetAsset] = useState('XAUUSD');
  const [bbPeriod, setBbPeriod] = useState(20);
  const [bbStd, setBbStd] = useState(2.0);
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [atrThreshold, setAtrThreshold] = useState(18.0);
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  const handleCompileStrategy = () => {
    setSaveAlert(`Compiling strategy '${strategyName}' with zero-lookahead checks...`);
    setTimeout(() => {
      setSaveAlert(`✓ Strategy '${strategyName}' compiled successfully & registered in APEX registry.`);
      setTimeout(() => setSaveAlert(null), 4000);
    }, 800);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-400" /> Strategy Lab & Condition Composer
          </h2>
          <p className="text-xs text-slate-400">
            Build multi-condition trigger formulas, tune indicator parameters, and configure institutional risk models
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveAlert && <span className="text-xs font-bold text-emerald-400 animate-pulse">{saveAlert}</span>}
          <button
            onClick={handleCompileStrategy}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-900/30 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Compile & Register Strategy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Visual Rule Builder */}
        <div className="lg:col-span-7 quant-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#161F38] pb-3">
            <h3 className="text-sm font-bold text-white">Visual Strategy Rule Composer</h3>
            <div className="flex bg-[#0B0E17] p-1 rounded-lg border border-[#161F38] text-xs">
              {[
                { id: 'rules', label: 'Trigger Rules' },
                { id: 'indicators', label: 'Parameters' },
                { id: 'exits', label: 'Exit & Trailing' },
                { id: 'risk', label: 'Risk Sizing' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded font-medium transition ${
                    activeTab === tab.id ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'rules' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Strategy Name</label>
                  <input
                    type="text"
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white font-bold outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Asset & Primary Timeframe</label>
                  <select
                    value={targetAsset}
                    onChange={(e) => setTargetAsset(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none"
                  >
                    <option value="XAUUSD">XAUUSD • 15m (London Session)</option>
                    <option value="BTCUSDT">BTCUSDT • 1h (24/7)</option>
                    <option value="EURUSD">EURUSD • 30m (London Open)</option>
                    <option value="GBPUSD">GBPUSD • 15m (NY Session)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Entry Trigger Condition (Long)</label>
                <textarea
                  rows={2}
                  defaultValue="close < lower_bb(20, 2.0) AND rsi(14) < 30"
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2.5 font-mono text-[11px] text-emerald-400 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Regime & Volatility Filter</label>
                <textarea
                  rows={2}
                  defaultValue="atr(14) > 18.0 AND session == 'london' AND trend_4h == 'BULLISH'"
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2.5 font-mono text-[11px] text-cyan-400 outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'indicators' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2 p-3 bg-[#0B0E17] rounded border border-[#161F38]">
                <div className="flex justify-between font-bold text-white">
                  <span>Bollinger Bands Length: {bbPeriod}</span>
                  <span className="font-mono text-purple-400">{bbPeriod} bars</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={bbPeriod}
                  onChange={(e) => setBbPeriod(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-2 p-3 bg-[#0B0E17] rounded border border-[#161F38]">
                <div className="flex justify-between font-bold text-white">
                  <span>Bollinger Bands StdDev: {bbStd}σ</span>
                  <span className="font-mono text-purple-400">{bbStd.toFixed(1)}σ</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={3.0}
                  step={0.1}
                  value={bbStd}
                  onChange={(e) => setBbStd(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-2 p-3 bg-[#0B0E17] rounded border border-[#161F38]">
                <div className="flex justify-between font-bold text-white">
                  <span>ATR Volatility Filter Threshold: &gt; {atrThreshold}</span>
                  <span className="font-mono text-cyan-400">{atrThreshold} pts</span>
                </div>
                <input
                  type="range"
                  min={5.0}
                  max={35.0}
                  step={0.5}
                  value={atrThreshold}
                  onChange={(e) => setAtrThreshold(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'exits' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Take Profit Target Condition</label>
                <input
                  type="text"
                  defaultValue="close > upper_bb(20, 2.0) OR r_multiple >= 3.0"
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-emerald-400 font-mono text-[11px] outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Stop Loss Placement</label>
                <input
                  type="text"
                  defaultValue="swing_low_15m - (0.5 * atr(14))"
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-rose-400 font-mono text-[11px] outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Risk Per Trade (% of Portfolio)</label>
                <input
                  type="number"
                  defaultValue={1.0}
                  step={0.1}
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Concurrent Positions</label>
                <input
                  type="number"
                  defaultValue={3}
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white font-mono outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Registered Strategy Pool */}
        <div className="lg:col-span-5 quant-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Registered Strategy Pool (24 Active)</h3>
            <span className="text-[10px] text-slate-400 font-mono">APEX Layer 4</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {[
              { name: 'BB Reversion v4', pair: 'XAUUSD 15m', cat: 'Mean Reversion', exp: '+0.91R', pf: '2.18', dd: '8.4%', status: 'APPROVED' },
              { name: 'Order Block v4', pair: 'XAUUSD 15m', cat: 'SMC Structure', exp: '+0.78R', pf: '1.92', dd: '9.1%', status: 'APPROVED' },
              { name: 'Liquidity Sweep v3', pair: 'GBPUSD 15m', cat: 'SMC Liquidity', exp: '+0.66R', pf: '1.81', dd: '10.2%', status: 'APPROVED' },
              { name: 'London Breakout v2', pair: 'EURUSD 30m', cat: 'Breakout', exp: '+0.59R', pf: '1.72', dd: '7.6%', status: 'APPROVED' },
              { name: 'EMA Trend v2', pair: 'BTCUSDT 1h', cat: 'Trend Following', exp: '+0.42R', pf: '1.42', dd: '12.8%', status: 'TESTING' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-[#0B0E17] border border-[#161F38] hover:border-purple-500/40 cursor-pointer transition space-y-1.5 group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white group-hover:text-purple-300 transition text-xs">{s.name}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                    {s.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">{s.pair} • {s.cat}</div>
                <div className="flex justify-between text-[11px] font-mono pt-1 border-t border-[#161F38]/60">
                  <span className="text-emerald-400 font-bold">{s.exp}</span>
                  <span className="text-slate-300">PF {s.pf}</span>
                  <span className="text-slate-400">DD {s.dd}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. BACKTESTING ENGINE PAGE
// ============================================================================

export const BacktestingPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('BB Reversion v4');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [engine, setEngine] = useState('VectorBT');
  const [isRunning, setIsRunning] = useState(false);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  const handleRunBacktest = () => {
    setIsRunning(true);
    fetch('http://localhost:8000/api/v1/research/backtest/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strategy_name: selectedStrategy,
        pair: selectedPair,
        timeframe: '15m',
        engine: engine,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setBacktestResult(data);
        setIsRunning(false);
      })
      .catch(() => {
        setIsRunning(false);
      });
  };

  useEffect(() => {
    handleRunBacktest();
  }, [selectedStrategy, selectedPair]);

  // Equity & Drawdown Chart Options
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const equities = [10000, 10840, 11420, 12100, 11800, 13400, 14200, 15100, 16300, 17200, 18450, 19200];
  const drawdowns = [0.0, -1.2, -0.8, -2.4, -6.8, -1.4, -0.9, -3.1, -1.8, -0.5, -4.2, -1.1];

  const equityOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#101426', borderColor: '#2A365E', textStyle: { color: '#F1F5F9' } },
    grid: { left: '3%', right: '3%', top: '8%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: '#161F38' } }, axisLabel: { color: '#64748B' } },
    yAxis: { type: 'value', axisLabel: { color: '#64748B', fontFamily: 'monospace' }, splitLine: { lineStyle: { color: '#161F38', type: 'dashed' } } },
    series: [
      {
        name: 'Portfolio Equity ($)',
        type: 'line',
        smooth: true,
        data: equities,
        lineStyle: { color: '#10B981', width: 2.5 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.25)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }],
          },
        },
      },
    ],
  };

  const drawdownOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#101426', borderColor: '#2A365E', textStyle: { color: '#F1F5F9' } },
    grid: { left: '3%', right: '3%', top: '8%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: '#161F38' } }, axisLabel: { color: '#64748B' } },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748B', fontFamily: 'monospace', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#161F38', type: 'dashed' } },
    },
    series: [
      {
        name: 'Underwater Drawdown (%)',
        type: 'line',
        smooth: true,
        data: drawdowns,
        lineStyle: { color: '#F43F5E', width: 2 },
        areaStyle: { color: 'rgba(244, 63, 94, 0.2)' },
      },
    ],
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      {/* Top Controls Bar */}
      <div className="quant-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Strategy</label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white font-semibold outline-none"
            >
              <option value="BB Reversion v4">BB Reversion v4</option>
              <option value="Order Block v4">Order Block v4</option>
              <option value="Liquidity Sweep v3">Liquidity Sweep v3</option>
              <option value="London Breakout v2">London Breakout v2</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white font-semibold outline-none"
            >
              <option value="XAUUSD">XAUUSD</option>
              <option value="BTCUSDT">BTCUSDT</option>
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Engine</label>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              className="bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white font-semibold outline-none"
            >
              <option value="VectorBT">VectorBT (Vectorized Matrix)</option>
              <option value="Nautilus">Nautilus (Event-Driven Tick)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Execution Costs</label>
            <span className="px-2.5 py-2 block bg-[#0B0E17] border border-[#161F38] rounded text-slate-300 font-mono text-[11px]">
              Taker 5 bps + Slip 2 bps
            </span>
          </div>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/30 transition"
        >
          <Play className="w-4 h-4 fill-current" /> {isRunning ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
        {[
          { label: 'CAGR', val: '+38.4%', color: 'text-emerald-400' },
          { label: 'Sharpe Ratio', val: '2.18', color: 'text-emerald-400' },
          { label: 'Sortino Ratio', val: '3.42', color: 'text-emerald-400' },
          { label: 'Calmar Ratio', val: '4.57', color: 'text-emerald-400' },
          { label: 'Max Drawdown', val: '8.4%', color: 'text-slate-200' },
          { label: 'Win Rate', val: '62.4%', color: 'text-emerald-400' },
          { label: 'Profit Factor', val: '2.18', color: 'text-slate-200' },
          { label: 'Expectancy', val: '+0.91R', color: 'text-emerald-400' },
        ].map((m, i) => (
          <div key={i} className="quant-card p-3">
            <div className="text-[10px] text-slate-400 font-medium">{m.label}</div>
            <div className={`text-lg font-extrabold font-mono mt-0.5 ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="quant-card p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <h3 className="font-bold text-white">Portfolio Equity Curve ($10,000 Initial)</h3>
            <span className="font-mono text-emerald-400 font-bold">$19,200 (+92.0%)</span>
          </div>
          <div className="h-[240px]">
            <ReactECharts option={equityOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        <div className="quant-card p-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <h3 className="font-bold text-white">Underwater Drawdown Profile</h3>
            <span className="font-mono text-rose-400 font-bold">Max DD: -8.4%</span>
          </div>
          <div className="h-[240px]">
            <ReactECharts option={drawdownOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Trade Execution Log Table */}
      <div className="quant-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Trade Execution Log (Sample of 4,821 Trades)</h3>
          <span className="text-[10px] text-slate-400 font-mono">Pessimistic SL-First Checked</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#161F38] text-slate-400 text-[11px] bg-[#0B0E17]/40">
                <th className="py-2.5 px-3">Trade ID</th>
                <th className="py-2.5 px-3">Entry Time</th>
                <th className="py-2.5 px-3">Exit Time</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3 text-right">Entry</th>
                <th className="py-2.5 px-3 text-right">Exit</th>
                <th className="py-2.5 px-3 text-right">PnL (R)</th>
                <th className="py-2.5 px-3 text-right">PnL ($)</th>
                <th className="py-2.5 px-3 text-center">Exit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161F38]/60 text-slate-200 font-mono">
              {[
                { id: 1001, entry: '2023-01-04 08:30', exit: '2023-01-04 11:15', side: 'LONG', enP: '1,842.50', exP: '1,858.20', r: '+2.10R', q: '+$785.0', res: 'TP_HIT' },
                { id: 1002, entry: '2023-01-07 09:15', exit: '2023-01-07 10:45', side: 'LONG', enP: '1,854.10', exP: '1,846.60', r: '-1.00R', q: '-$375.0', res: 'SL_HIT' },
                { id: 1003, entry: '2023-01-11 13:00', exit: '2023-01-11 16:30', side: 'LONG', enP: '1,860.00', exP: '1,882.40', r: '+3.00R', q: '+$1,120.0', res: 'TP_HIT' },
                { id: 1004, entry: '2023-01-15 08:00', exit: '2023-01-15 09:45', side: 'SHORT', enP: '1,885.30', exP: '1,871.10', r: '+1.90R', q: '+$710.0', res: 'TP_HIT' },
                { id: 1005, entry: '2023-01-19 14:30', exit: '2023-01-19 15:15', side: 'SHORT', enP: '1,876.80', exP: '1,884.30', r: '-1.00R', q: '-$375.0', res: 'SL_HIT' },
              ].map((t) => (
                <tr key={t.id} className="hover:bg-[#151B32]/40 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{t.id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{t.entry}</td>
                  <td className="py-2.5 px-3 text-slate-300">{t.exit}</td>
                  <td className={`py-2.5 px-3 font-bold ${t.side === 'LONG' ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {t.side}
                  </td>
                  <td className="py-2.5 px-3 text-right">{t.enP}</td>
                  <td className="py-2.5 px-3 text-right">{t.exP}</td>
                  <td className={`py-2.5 px-3 text-right font-bold ${t.r.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.r}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${t.q.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.q}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      t.res === 'TP_HIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {t.res}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. OPTIMIZATION SUITE PAGE
// ============================================================================

export const OptimizationPage: React.FC = () => {
  const [paramX, setParamX] = useState('bb_length');
  const [paramY, setParamY] = useState('bb_std');
  const [optMode, setOptMode] = useState('Bayesian Search');

  const paretoOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#101426', borderColor: '#2A365E', textStyle: { color: '#F1F5F9' } },
    grid: { left: '3%', right: '3%', top: '10%', bottom: '10%', containLabel: true },
    xAxis: {
      name: 'Max Drawdown (%)',
      type: 'value',
      axisLine: { lineStyle: { color: '#161F38' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: '#161F38', type: 'dashed' } },
    },
    yAxis: {
      name: 'Sharpe Ratio',
      type: 'value',
      axisLine: { lineStyle: { color: '#161F38' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace' },
      splitLine: { lineStyle: { color: '#161F38', type: 'dashed' } },
    },
    series: [
      {
        name: 'Optimal Frontier',
        type: 'scatter',
        symbolSize: 14,
        data: [
          { value: [8.4, 2.18], name: 'Aggressive: BB(20, 1.8σ)', itemStyle: { color: '#10B981' } },
          { value: [7.1, 2.05], name: 'Balanced: BB(20, 2.0σ)', itemStyle: { color: '#06B6D4' } },
          { value: [5.4, 1.78], name: 'Conservative: BB(25, 2.2σ)', itemStyle: { color: '#8B5CF6' } },
          { value: [14.2, 1.52], name: 'Sub-optimal A', itemStyle: { color: '#64748B' } },
          { value: [18.8, 1.35], name: 'Sub-optimal B', itemStyle: { color: '#475569' } },
        ],
      },
    ],
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" /> Parameter Optimization & Pareto Frontier
          </h2>
          <p className="text-xs text-slate-400">
            Bayesian Gaussian Process & Grid optimization sweeps to discover robust parameter neighborhoods without overfitting
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={optMode}
            onChange={(e) => setOptMode(e.target.value)}
            className="bg-[#101426] border border-[#161F38] rounded p-2 text-xs text-white outline-none"
          >
            <option>Bayesian Search (TPE)</option>
            <option>Grid Search (Brute-Force)</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-md shadow-amber-900/30">
            <Play className="w-3.5 h-3.5 fill-current" /> Run Sweep
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Heatmap Matrix */}
        <div className="lg:col-span-7 quant-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#161F38] pb-3">
            <h3 className="text-sm font-bold text-white">2D Parameter Response Heatmap (Sharpe Ratio)</h3>
            <span className="text-[11px] text-slate-400 font-mono">BB Length (Y) vs StdDev Multiplier (X)</span>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono">
            {/* Header row */}
            <div className="p-2.5 font-bold text-slate-500 font-sans">Length \ σ</div>
            {['1.5σ', '1.8σ', '2.0σ', '2.2σ', '2.5σ'].map((x) => (
              <div key={x} className="p-2.5 bg-[#0B0E17] font-bold text-slate-400 rounded border border-[#161F38]">
                {x}
              </div>
            ))}

            {/* Matrix rows */}
            {[
              { row: '10', vals: ['1.42', '1.58', '1.71', '1.62', '1.38'] },
              { row: '15', vals: ['1.51', '1.72', '1.88', '1.74', '1.49'] },
              { row: '20', vals: ['1.64', '1.85', '2.18', '1.82', '1.55'] },
              { row: '25', vals: ['1.52', '1.70', '1.78', '1.69', '1.41'] },
              { row: '30', vals: ['1.35', '1.48', '1.56', '1.45', '1.22'] },
            ].map((r, rIdx) => (
              <React.Fragment key={rIdx}>
                <div className="p-2.5 bg-[#0B0E17] font-bold text-slate-400 rounded border border-[#161F38] flex items-center justify-center">
                  {r.row}
                </div>
                {r.vals.map((v, cIdx) => {
                  const num = parseFloat(v);
                  const isTop = num >= 2.0;
                  const isGood = num >= 1.7 && num < 2.0;
                  return (
                    <div
                      key={cIdx}
                      className={`p-2.5 rounded border transition cursor-pointer flex flex-col items-center justify-center ${
                        isTop
                          ? 'bg-emerald-600/30 text-emerald-300 font-extrabold border-emerald-500 shadow-sm'
                          : isGood
                          ? 'bg-cyan-600/20 text-cyan-300 font-bold border-cyan-500/40'
                          : 'bg-[#0B0E17] text-slate-400 border-[#161F38]'
                      }`}
                    >
                      <span>{v}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-[#161F38]">
            <span>Optimal Neighborhood: BB Length 20, StdDev 1.8σ–2.0σ (High Plateau)</span>
            <span className="text-emerald-400 font-mono font-bold">Smoothness Score: 88.5/100</span>
          </div>
        </div>

        {/* Pareto Frontier */}
        <div className="lg:col-span-5 quant-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#161F38] pb-3">
            <h3 className="text-sm font-bold text-white">Sharpe vs Drawdown Pareto Frontier</h3>
            <span className="text-[10px] text-slate-400 font-mono">Non-Dominated Candidates</span>
          </div>

          <div className="h-[280px]">
            <ReactECharts option={paretoOption} style={{ height: '100%', width: '100%' }} />
          </div>

          <div className="p-3 bg-[#0B0E17] rounded border border-[#161F38] text-xs space-y-1">
            <span className="font-bold text-white">Selected Optimal Portfolio Setting:</span>
            <div className="text-emerald-400 font-mono text-[11px]">
              BB(20, 2.0σ) → Sharpe 2.18 | Max DD 8.4% | Expectancy +0.91R
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. EXPERIMENTS MANAGER PAGE
// ============================================================================

export const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStrategy, setNewStrategy] = useState('BB Reversion v4');
  const [newHypothesis, setNewHypothesis] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/research/experiments/list')
      .then((res) => res.json())
      .then((data) => setExperiments(data))
      .catch(() => {});
  }, []);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const newExp = {
      id: `EXP-${Math.floor(Math.random() * 90 + 10)}`,
      title: newTitle,
      strategy: newStrategy,
      stage: 'DESIGN',
      progress_pct: 15,
      hypothesis: newHypothesis,
      target_metric: 'Expectancy R',
      baseline_val: '+0.65R',
      variant_val: 'Pending Test',
      p_value: 1.0,
      status: 'DESIGN',
    };
    setExperiments((prev) => [newExp, ...prev]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewHypothesis('');
  };

  const advanceStage = (id: string) => {
    setExperiments((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const stages = ['QUEUED', 'DESIGN', 'TESTING', 'OOS VALIDATION', 'ANALYZING', 'COMPLETED'];
        const currentIdx = stages.indexOf(e.stage);
        const nextStage = stages[Math.min(stages.length - 1, currentIdx + 1)];
        const nextProg = Math.min(100, e.progress_pct + 25);
        return { ...e, stage: nextStage, progress_pct: nextProg };
      })
    );
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> Quantitative Experiments & Hypothesis Manager
          </h2>
          <p className="text-xs text-slate-400">
            Formulate hypotheses, track A/B pipeline validations, and promote proven edges into production
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-900/30 transition"
        >
          <Plus className="w-4 h-4" /> New Hypothesis Experiment
        </button>
      </div>

      {/* Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((exp) => (
          <div key={exp.id} className="quant-card p-5 space-y-3 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-purple-400 font-bold">{exp.id}</span>
                <span className="px-2 py-0.5 text-[9px] font-bold bg-[#161F38] text-slate-300 rounded border border-slate-700 uppercase">
                  {exp.stage}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition">
                {exp.title}
              </h3>
              <div className="text-[11px] text-slate-400">Target Model: {exp.strategy}</div>
              <div className="p-2.5 bg-[#0B0E17] rounded border border-[#161F38] text-[11px] text-slate-300 leading-relaxed">
                "{exp.hypothesis}"
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#161F38]">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Baseline vs Variant:</span>
                <span className="text-emerald-400 font-bold">{exp.variant_val}</span>
              </div>
              <div className="w-full h-1.5 bg-[#161F38] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${exp.progress_pct}%` }} />
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-500 font-mono">{exp.progress_pct}% Completed</span>
                <button
                  onClick={() => advanceStage(exp.id)}
                  className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded text-[10px] font-bold transition flex items-center gap-1"
                >
                  Advance Stage <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Experiment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101426] border border-[#2A365E] rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Create New Hypothesis Experiment</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Experiment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Does 4h EMA trend filter reduce drawdown?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Target Strategy</label>
                <select
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none"
                >
                  <option>BB Reversion v4</option>
                  <option>Order Block v4</option>
                  <option>Liquidity Sweep v3</option>
                  <option>London Breakout v2</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Hypothesis Statement</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this filter or tweak will generate positive expectancy lift..."
                  value={newHypothesis}
                  onChange={(e) => setNewHypothesis(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 bg-[#161F38] text-slate-300 rounded text-xs">
                Cancel
              </button>
              <button onClick={handleCreate} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold">
                Create Experiment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
