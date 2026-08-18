import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Brain,
  AlertOctagon,
  History,
  Plus,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  TrendingUp,
  Tag,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

// ============================================================================
// 1. TRADER JOURNAL PAGE
// ============================================================================

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPair, setNewPair] = useState('XAUUSD');
  const [newStrat, setNewStrat] = useState('BB Reversion v4');
  const [newDir, setNewDir] = useState('BUY');
  const [newR, setNewR] = useState(2.1);
  const [newEmotion, setNewEmotion] = useState('Calm / In-The-Zone');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/trader-dev/journal')
      .then((res) => res.json())
      .then((data) => setEntries(data))
      .catch(() => {});
  }, []);

  const handleAddEntry = () => {
    const entryObj = {
      id: `j-${Math.floor(Math.random() * 90 + 10)}`,
      date: new Date().toISOString().slice(0, 10),
      pair: newPair,
      strategy: newStrat,
      direction: newDir,
      result_r: Number(newR),
      rule_followed: true,
      emotional_state: newEmotion,
      mistake: null,
      notes: newNotes || 'Followed strategy execution checklist perfectly.',
    };
    setEntries([entryObj, ...entries]);
    setIsModalOpen(false);
    setNewNotes('');
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> Qualitative Trade Journal & Execution Log
          </h2>
          <p className="text-xs text-slate-400">
            Log trade setups, review trade setups with emotional state tags, mistake classification, and execution fidelity scores
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-900/30 transition"
        >
          <Plus className="w-4 h-4" /> New Journal Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry) => (
          <div key={entry.id} className="quant-card p-5 space-y-3 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-purple-400 font-bold">{entry.pair} • {entry.date}</span>
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                  entry.result_r >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono'
                }`}>
                  {entry.result_r >= 0 ? `+${entry.result_r}R WIN` : `${entry.result_r}R LOSS`}
                </span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition">
                {entry.strategy} ({entry.direction})
              </h3>

              <div className="p-2.5 bg-[#0B0E17] rounded border border-[#161F38] text-[11px] text-slate-300 leading-relaxed">
                "{entry.notes}"
              </div>
            </div>

            <div className="pt-2 border-t border-[#161F38] flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Tag className="w-3 h-3 text-purple-400" /> {entry.emotional_state || 'Calm'}
              </span>
              <span className={`font-bold ${entry.rule_followed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {entry.rule_followed ? '✓ Plan Followed' : '⚠ Rule Broken'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101426] border border-[#2A365E] rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">Log Qualitative Journal Entry</h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Asset Pair</label>
                  <select
                    value={newPair}
                    onChange={(e) => setNewPair(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none"
                  >
                    <option>XAUUSD</option>
                    <option>EURUSD</option>
                    <option>GBPUSD</option>
                    <option>BTCUSDT</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Strategy</label>
                  <select
                    value={newStrat}
                    onChange={(e) => setNewStrat(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none"
                  >
                    <option>BB Reversion v4</option>
                    <option>Order Block v4</option>
                    <option>Liquidity Sweep v3</option>
                    <option>London Breakout v2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Direction</label>
                  <select
                    value={newDir}
                    onChange={(e) => setNewDir(e.target.value)}
                    className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none"
                  >
                    <option>BUY</option>
                    <option>SELL</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Result (R-Multiple)</label>
                  <input
                    type="number"
                    step={0.1}
                    value={newR}
                    onChange={(e) => setNewR(Number(e.target.value))}
                    className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Emotional State</label>
                <select
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none"
                >
                  <option>Calm / In-The-Zone</option>
                  <option>FOMO / Impatient</option>
                  <option>Anxious / Hesitant</option>
                  <option>Overconfident</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Execution Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes on entry trigger, HTF context, and SL execution..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-[#161F38] rounded p-2 text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 bg-[#161F38] text-slate-300 rounded text-xs">
                Cancel
              </button>
              <button onClick={handleAddEntry} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold">
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. PSYCHOLOGY & TILT PREVENTION PAGE
// ============================================================================

export const PsychologyPage: React.FC = () => {
  const [psyData, setPsyData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/trader-dev/psychology')
      .then((res) => res.json())
      .then((data) => setPsyData(data))
      .catch(() => {});
  }, []);

  const states = psyData?.emotional_states || [
    { state: 'Calm / In-The-Zone', trades: 38, win_rate: 73.7, avg_r: 1.42, discipline_score: 98.0 },
    { state: 'FOMO / Impatient', trades: 8, win_rate: 37.5, avg_r: -0.65, discipline_score: 45.0 },
    { state: 'Anxious / Hesitant', trades: 6, win_rate: 50.0, avg_r: 0.12, discipline_score: 70.0 },
    { state: 'Overconfident', trades: 4, win_rate: 25.0, avg_r: -0.95, discipline_score: 30.0 },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" /> Psychology & Tilt Prevention Guardrails
        </h2>
        <p className="text-xs text-slate-400">
          Correlate emotional discipline with trade outcomes and monitor automated tilt circuit breakers
        </p>
      </div>

      {/* Tilt Alert Banner */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <div>
            <h3 className="font-bold text-white text-sm">EMOTIONAL STABILITY: GREEN</h3>
            <p className="text-xs text-slate-300">
              No tilt behavior or revenge trading patterns detected over the last 5 active trading sessions.
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/30">
          Discipline Index: 88.5%
        </span>
      </div>

      {/* State Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {states.map((s: any, i: number) => {
          const isCalm = s.state.includes('Calm');
          return (
            <div
              key={i}
              className={`quant-card p-5 space-y-3 border transition ${
                isCalm ? 'border-emerald-500/40' : s.avg_r < 0 ? 'border-rose-500/30' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">{s.state}</span>
                <span className="font-mono text-[10px] text-slate-400">{s.trades} Trades</span>
              </div>

              <div className="space-y-1 font-mono pt-1 border-t border-[#161F38]">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Avg Outcome:</span>
                  <span className={`font-bold ${s.avg_r >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.avg_r >= 0 ? `+${s.avg_r}R` : `${s.avg_r}R`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Win Rate:</span>
                  <span className="text-slate-200 font-bold">{s.win_rate}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-sans">Discipline:</span>
                  <span className="text-purple-300 font-bold">{s.discipline_score}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 3. MISTAKE ANALYSIS PAGE
// ============================================================================

export const MistakesPage: React.FC = () => {
  const [mistakesData, setMistakesData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/trader-dev/mistakes')
      .then((res) => res.json())
      .then((data) => setMistakesData(data))
      .catch(() => {});
  }, []);

  const mistakes = mistakesData?.mistakes || [
    { id: 'm-1', name: 'Chasing Entry / Bad Price', occurrences: 12, cost_usd: 4200.0, r_drag: -3.8, severity: 'HIGH' },
    { id: 'm-2', name: 'Moved Stop Loss Too Early', occurrences: 8, cost_usd: 2850.0, r_drag: -2.5, severity: 'MEDIUM' },
    { id: 'm-3', name: 'Trading During High-Impact News', occurrences: 6, cost_usd: 2100.0, r_drag: -2.1, severity: 'MEDIUM' },
    { id: 'm-4', name: 'Overleveraged / Sizing Error', occurrences: 4, cost_usd: 1900.0, r_drag: -1.9, severity: 'HIGH' },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" /> Execution Mistake Taxonomy & Cost Drag
        </h2>
        <p className="text-xs text-slate-400">
          Quantify dollar and R-multiple penalties inflicted by behavioral mistakes and execution drift
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="quant-card p-4">
          <span className="text-slate-400 block text-xs">Total Mistake Drag ($)</span>
          <span className="text-2xl font-extrabold font-mono text-rose-400 mt-1">-$11,050</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Recoverable PnL</span>
        </div>
        <div className="quant-card p-4">
          <span className="text-slate-400 block text-xs">Total R-Multiple Drag</span>
          <span className="text-2xl font-extrabold font-mono text-rose-400 mt-1">-10.3R</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Alpha Erosion</span>
        </div>
        <div className="quant-card p-4">
          <span className="text-slate-400 block text-xs">Mistake Frequency</span>
          <span className="text-2xl font-extrabold font-mono text-amber-400 mt-1">30 Events</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Across last 300 trades (10%)</span>
        </div>
      </div>

      {/* Mistakes Table */}
      <div className="quant-card p-5">
        <h3 className="text-sm font-bold text-white mb-3">Mistake Taxonomy Breakdown</h3>
        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#161F38] text-slate-400 text-[11px]">
                <th className="py-2.5 px-3 font-sans">Mistake Category</th>
                <th className="py-2.5 px-3 text-center">Occurrences</th>
                <th className="py-2.5 px-3 text-right">Dollar Cost</th>
                <th className="py-2.5 px-3 text-right">R Drag</th>
                <th className="py-2.5 px-3 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161F38]/60 text-slate-200">
              {mistakes.map((m: any) => (
                <tr key={m.id} className="hover:bg-[#151B32]/40 transition">
                  <td className="py-2.5 px-3 font-bold text-white font-sans">{m.name}</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{m.occurrences}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">-${m.cost_usd.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">{m.r_drag}R</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                      m.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {m.severity}
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
// 4. MARKET REPLAY SIMULATOR PAGE
// ============================================================================

export const ReplayPage: React.FC = () => {
  const [allCandles, setAllCandles] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [decisionLog, setDecisionLog] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/trader-dev/replay/session')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.candles) {
          setAllCandles(data.candles);
        }
      })
      .catch(() => {});
  }, []);

  // Automatic playback timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev >= allCandles.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, allCandles]);

  const visibleCandles = allCandles.slice(0, currentIdx + 1);
  const candleDates = visibleCandles.map((c) => c.time);
  const candleValues = visibleCandles.map((c) => [c.open, c.close, c.low, c.high]);

  const replayChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' }, backgroundColor: '#101426', borderColor: '#2A365E', textStyle: { color: '#F1F5F9' } },
    grid: { left: '3%', right: '3%', top: '10%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: candleDates,
      scale: true,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#161F38' } },
      axisLabel: { color: '#64748B', fontSize: 10 },
    },
    yAxis: {
      scale: true,
      splitLine: { lineStyle: { color: '#161F38', type: 'dashed' } },
      axisLabel: { color: '#64748B', fontFamily: 'monospace', fontSize: 10 },
    },
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
    ],
  };

  const handleDecision = (action: string) => {
    const lastBar = visibleCandles[visibleCandles.length - 1];
    const logItem = {
      bar_idx: currentIdx,
      time: lastBar?.time,
      action: action,
      price: lastBar?.close,
    };
    setDecisionLog([logItem, ...decisionLog]);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" /> Bar-by-Bar Market Replay Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Replay historical price action candle-by-candle and practice manual decision making without lookahead bias
          </p>
        </div>

        {/* Replay Controls */}
        <div className="flex items-center gap-2 bg-[#101426] p-1.5 rounded-lg border border-[#161F38]">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition flex items-center gap-1"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setCurrentIdx((p) => Math.min(allCandles.length - 1, p + 1))}
            className="p-2 bg-[#0B0E17] hover:bg-[#151B32] text-slate-300 rounded text-xs font-medium transition flex items-center gap-1"
          >
            <SkipForward className="w-3.5 h-3.5" /> +1 Bar
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIdx(10);
            }}
            className="p-2 bg-[#0B0E17] hover:bg-[#151B32] text-slate-400 hover:text-white rounded text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs text-purple-400 px-2">
            Bar {currentIdx + 1} / {allCandles.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Replay Chart */}
        <div className="lg:col-span-8 quant-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#161F38] pb-3 text-xs">
            <span className="font-bold text-white">XAUUSD • 15m Simulation Stream</span>
            <span className="text-emerald-400 font-mono font-bold">Current Close: ${visibleCandles[visibleCandles.length - 1]?.close}</span>
          </div>

          <div className="h-[340px]">
            <ReactECharts option={replayChartOption} style={{ height: '100%', width: '100%' }} />
          </div>

          {/* Decision Buttons */}
          <div className="flex gap-3 pt-2 border-t border-[#161F38]">
            <button
              onClick={() => handleDecision('BUY LONG')}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs shadow-md shadow-emerald-900/30 transition"
            >
              Simulate BUY LONG (1.0R Risk)
            </button>
            <button
              onClick={() => handleDecision('SELL SHORT')}
              className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs shadow-md shadow-purple-900/30 transition"
            >
              Simulate SELL SHORT (1.0R Risk)
            </button>
            <button
              onClick={() => handleDecision('PASS / WAIT')}
              className="px-6 py-2.5 bg-[#161F38] hover:bg-slate-700 text-slate-300 rounded font-medium text-xs transition"
            >
              Pass / Wait
            </button>
          </div>
        </div>

        {/* Decision History */}
        <div className="lg:col-span-4 quant-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-[#161F38] pb-3">
            Replay Decision Log
          </h3>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 text-xs font-mono">
            {decisionLog.length === 0 ? (
              <div className="text-slate-500 text-center py-10">No simulated decisions logged yet.</div>
            ) : (
              decisionLog.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-[#0B0E17] rounded border border-[#161F38] flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 font-sans text-[11px] block">{item.time}</span>
                    <span className="text-white font-bold">${item.price}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                    item.action.includes('BUY') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : item.action.includes('SELL') ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {item.action}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MistakeAnalysisPage = MistakesPage;

