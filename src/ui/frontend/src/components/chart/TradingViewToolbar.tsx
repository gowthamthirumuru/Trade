import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Camera,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  TrendingUp,
  Minus,
  Grid,
  Square,
  ShieldAlert,
  ShieldCheck,
  Target,
  Ruler,
  MousePointer,
  Eye,
  EyeOff,
  Check,
  Zap,
  Calendar,
  Clock,
  X,
  Crosshair,
  BarChart2,
} from 'lucide-react';
import { DrawingMode } from './DrawingCanvas';

export type ChartStyle = 'CANDLES' | 'HEIKIN_ASHI' | 'HOLLOW' | 'LINE' | 'AREA' | 'BARS' | 'BASELINE';

type DropdownId = 'symbol' | 'timeframe' | 'style' | 'depth' | 'eras' | 'years' | 'indicators' | 'trades' | null;

interface TradingViewToolbarProps {
  pair: string;
  onPairChange: (pair: string) => void;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  chartStyle: ChartStyle;
  onChartStyleChange: (style: ChartStyle) => void;
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  activeIndicators: {
    ema20: boolean;
    ema50: boolean;
    ema200: boolean;
    vwap: boolean;
    bollinger: boolean;
    rsi: boolean;
    macd: boolean;
    smcFvg: boolean;
    smcOb: boolean;
    vpvr?: boolean;
    researchWall?: boolean;
  };
  onToggleIndicator: (key: string) => void;
  tradeStrategies?: Array<{ strategy: string; trade_count: number; expectancy_r: number; win_rate: number }>;
  selectedTradeStrategy?: string | null;
  onSelectTradeStrategy?: (strat: string | null) => void;
  isReplayMode: boolean;
  onToggleReplay: () => void;
  replayIndex: number;
  maxReplayIndex: number;
  isPlaying: boolean;
  onPlayPauseReplay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onResetReplay: () => void;
  replaySpeed: number;
  onChangeSpeed: (speed: number) => void;
  onTakeScreenshot: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  allPairs: Array<{ pair: string; type: string; candles: number }>;
  barLimit?: number;
  onBarLimitChange?: (limit: number) => void;
  onSelectEra?: (fromTime: number, toTime: number, name: string) => void;
}

export const TradingViewToolbar: React.FC<TradingViewToolbarProps> = ({
  pair,
  onPairChange,
  timeframe,
  onTimeframeChange,
  chartStyle,
  onChartStyleChange,
  drawingMode,
  onDrawingModeChange,
  activeIndicators,
  onToggleIndicator,
  tradeStrategies = [],
  selectedTradeStrategy = null,
  onSelectTradeStrategy,
  isReplayMode,
  onToggleReplay,
  replayIndex,
  maxReplayIndex,
  isPlaying,
  onPlayPauseReplay,
  onStepForward,
  onStepBackward,
  onResetReplay,
  replaySpeed,
  onChangeSpeed,
  onTakeScreenshot,
  isFullscreen,
  onToggleFullscreen,
  allPairs,
  barLimit = 5000,
  onBarLimitChange,
  onSelectEra,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownId>(null);
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2024-01-01');
  const [customEndDate, setCustomEndDate] = useState('2025-02-01');
  const [selectedEraName, setSelectedEraName] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [assetTab, setAssetTab] = useState<'ALL' | 'Crypto' | 'Forex'>('ALL');

  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsDateRangeModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleDropdown = (id: DropdownId) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const yearsList = [
    { year: 'ALL', label: 'All Years (2017–2025)', from: 0, to: 0 },
    { year: '2025', label: '2025 (Latest)', from: 1735689600, to: 1738367999 },
    { year: '2024', label: '2024 (ETF & ATH)', from: 1704067200, to: 1735689599 },
    { year: '2023', label: '2023 (Recovery)', from: 1672531200, to: 1704067199 },
    { year: '2022', label: '2022 (FTX / Bear Market)', from: 1640995200, to: 1672531199 },
    { year: '2021', label: '2021 ($69k Bull Peak)', from: 1609459200, to: 1640995199 },
    { year: '2020', label: '2020 (COVID & Halving)', from: 1577836800, to: 1609459199 },
    { year: '2019', label: '2019 (Accumulation)', from: 1546300800, to: 1577836799 },
    { year: '2018', label: '2018 (Crypto Winter)', from: 1514764800, to: 1546300799 },
    { year: '2017', label: '2017 (Binance Genesis)', from: 1502928000, to: 1514764799 },
  ];

  const marketEras = [
    { id: '2024-etf', name: '2024–2025: Spot ETF & $108k ATH', from: 1704067200, to: 1738367999, icon: '🌟' },
    { id: '2022-ftx', name: '2022–2023: FTX & Bear Bottom ($15.5k)', from: 1640995200, to: 1672531199, icon: '📉' },
    { id: '2021-ath', name: '2021: $69,000 Dual Bull Peak', from: 1609459200, to: 1640995199, icon: '🏔️' },
    { id: '2020-covid', name: '2020: COVID Crash ($3.8k) & Halving', from: 1583020800, to: 1609459199, icon: '🩸' },
    { id: '2018-winter', name: '2018–2019: Crypto Winter ($3.1k)', from: 1514764800, to: 1577836799, icon: '❄️' },
    { id: '2017-genesis', name: '2017: Binance Genesis & $20k Peak', from: 1502942400, to: 1514764799, icon: '🚀' },
  ];

  const mainTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
  const extraTimeframes = ['3m', '30m', '2h', '12h', '1w'];

  const chartStylesList: Array<{ id: ChartStyle; label: string; icon: string }> = [
    { id: 'CANDLES', label: 'Candlestick', icon: '🕯️' },
    { id: 'HEIKIN_ASHI', label: 'Heikin Ashi', icon: '📊' },
    { id: 'HOLLOW', label: 'Hollow Candles', icon: '▯' },
    { id: 'LINE', label: 'Line Chart', icon: '📈' },
    { id: 'AREA', label: 'Area (Gradient)', icon: '🌊' },
    { id: 'BARS', label: 'Bars (OHLC)', icon: '|||' },
    { id: 'BASELINE', label: 'Baseline', icon: '⚖️' },
  ];

  const filteredPairs = allPairs.filter((p) => {
    const matchSearch = p.pair.toLowerCase().includes(searchFilter.toLowerCase());
    const matchAsset = assetTab === 'ALL' || p.type === assetTab;
    return matchSearch && matchAsset;
  });

  return (
    <div ref={toolbarRef} className="relative z-30 flex flex-col bg-[#0a0a0a] border-b border-[#1f1f1f] text-xs select-none">
      {/* Primary Toolbar Row */}
      <div className="relative flex items-center justify-between px-3 py-1.5 gap-2 overflow-visible">
        {/* Left Section: Symbol + Timeframes + Style + Macro Jump + Trade Overlay + Indicators */}
        <div className="flex items-center gap-1.5 flex-wrap md:flex-nowrap">
          {/* 1. Symbol Selector Button */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('symbol')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141414] hover:bg-[#1f1f1f] border text-white font-bold font-mono transition ${
                activeDropdown === 'symbol' ? 'border-purple-500 bg-[#1c1c1c]' : 'border-[#262626]'
              }`}
            >
              <span className="text-emerald-400 font-extrabold">{pair}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-800 text-slate-400 font-sans">
                {pair.includes('USDT') ? 'CRYPTO' : 'FOREX'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'symbol' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'symbol' && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-[#0c0c0c]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search 22 instruments..."
                    className="w-full bg-[#171717] border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono placeholder:text-slate-600 outline-none focus:border-purple-500"
                    autoFocus
                  />
                </div>

                <div className="flex bg-[#141414] p-0.5 rounded-lg text-[10px] font-mono">
                  {(['ALL', 'Crypto', 'Forex'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAssetTab(tab)}
                      className={`flex-1 py-1 rounded font-bold transition ${
                        assetTab === tab ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 font-mono text-xs scrollbar-thin">
                  {filteredPairs.length > 0 ? (
                    filteredPairs.map((p) => (
                      <button
                        key={p.pair}
                        onClick={() => {
                          onPairChange(p.pair);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                          pair === p.pair ? 'bg-purple-950/60 border border-purple-800 text-white' : 'hover:bg-[#171717] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{p.pair}</span>
                          <span className="text-[10px] text-slate-500">{p.type}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400">{Number(p.candles).toLocaleString()} bars</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-xs font-mono">No matching symbols found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-800 mx-0.5 hidden sm:block" />

          {/* 2. Timeframe Quick Buttons */}
          <div className="flex items-center bg-[#121212] p-0.5 rounded-lg border border-[#222]">
            {mainTimeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                  timeframe === tf ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}

            <div className="relative">
              <button
                onClick={() => toggleDropdown('timeframe')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                  extraTimeframes.includes(timeframe) ? 'bg-purple-950 text-purple-300' : 'text-slate-500 hover:text-white'
                }`}
              >
                {extraTimeframes.includes(timeframe) ? timeframe : '•••'}
                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${activeDropdown === 'timeframe' ? 'rotate-180' : ''}`} />
              </button>

              {activeDropdown === 'timeframe' && (
                <div className="absolute left-0 top-full mt-1.5 w-32 bg-[#0e0e0e]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-neutral-800">
                    Extended TF
                  </div>
                  {extraTimeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        onTimeframeChange(tf);
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                        timeframe === tf ? 'bg-purple-950/70 text-purple-300 font-bold' : 'text-slate-300 hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-4 w-px bg-neutral-800 mx-0.5 hidden sm:block" />

          {/* 3. Chart Style Switcher */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('style')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded bg-[#121212] hover:bg-[#1c1c1c] border text-slate-200 font-mono transition ${
                activeDropdown === 'style' ? 'border-purple-500 bg-[#1c1c1c]' : 'border-[#222]'
              }`}
            >
              <span>{chartStylesList.find((s) => s.id === chartStyle)?.icon || '🕯️'}</span>
              <span className="text-[11px] hidden sm:inline">{chartStylesList.find((s) => s.id === chartStyle)?.label}</span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${activeDropdown === 'style' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'style' && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#0e0e0e]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-neutral-800">
                  Chart Rendering
                </div>
                {chartStylesList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onChartStyleChange(s.id);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-mono transition ${
                      chartStyle === s.id ? 'bg-purple-950/70 text-purple-300 font-bold' : 'text-slate-300 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{s.icon}</span> {s.label}
                    </span>
                    {chartStyle === s.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. History Depth Selector */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('depth')}
              className={`flex items-center gap-1 px-2 py-1 rounded bg-[#121212] hover:bg-[#1c1c1c] border text-slate-200 font-mono transition ${
                activeDropdown === 'depth' ? 'border-amber-500 bg-[#1c1c1c]' : 'border-[#222]'
              }`}
              title="Candlestick history depth loaded into chart memory"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-300">
                {barLimit === 0 ? 'ALL History' : barLimit >= 1000 ? `${(barLimit / 1000).toFixed(0)}k Bars` : `${barLimit} Bars`}
              </span>
              <ChevronDown className={`w-2.5 h-2.5 text-slate-500 transition-transform ${activeDropdown === 'depth' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'depth' && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-[#0e0e0e]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-0.5 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-neutral-800">
                  Data Lake Depth
                </div>
                {[
                  { limit: 5000, label: '5,000 Candles (~3.5 Days)' },
                  { limit: 25000, label: '25,000 Candles (~17 Days)' },
                  { limit: 50000, label: '50,000 Candles (~1 Month)' },
                  { limit: 100000, label: '100,000 Candles (~2.5 Months)' },
                  { limit: 250000, label: '250,000 Candles (~6 Months)' },
                  { limit: 500000, label: '500,000 Candles (~1 Year)' },
                  { limit: 0, label: '⚡ ALL (Full Data Lake)' },
                ].map((d) => (
                  <button
                    key={d.label}
                    onClick={() => {
                      if (onBarLimitChange) onBarLimitChange(d.limit);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition ${
                      barLimit === d.limit ? 'bg-amber-950/70 text-amber-300 font-bold' : 'text-slate-300 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span>{d.label}</span>
                    {barLimit === d.limit && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Historical Market Eras (Macro Jump) */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('eras')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141414] hover:bg-[#1f1f1f] border text-slate-200 font-mono transition ${
                activeDropdown === 'eras' ? 'border-purple-500 bg-[#1c1c1c]' : 'border-[#2c2c2c]'
              }`}
              title="Jump directly to landmark market regimes in Bitcoin history"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-bold text-purple-300 hidden md:inline">
                {selectedEraName ? selectedEraName.slice(0, 16) + '...' : 'Market Eras'}
              </span>
              <ChevronDown className={`w-2.5 h-2.5 text-slate-500 transition-transform ${activeDropdown === 'eras' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'eras' && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-[#0c0c0c]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-neutral-800 flex justify-between items-center">
                  <span>Macro Regime Jump</span>
                  <span className="text-purple-400 font-bold">2017–2025</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {marketEras.map((era) => (
                    <button
                      key={era.id}
                      onClick={() => {
                        setSelectedEraName(era.name);
                        if (onSelectEra) onSelectEra(era.from, era.to, era.name);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#1a1a1a] text-slate-300 hover:text-white transition flex items-center gap-2 border border-transparent hover:border-neutral-800"
                    >
                      <span className="text-base">{era.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-[11px] text-slate-200">{era.name}</div>
                        <div className="text-[9px] text-slate-500 font-sans">Stream zero-copy 1m regime slice</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. Historical Year Quick-Jump */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('years')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded bg-[#141414] hover:bg-[#1f1f1f] border text-slate-200 font-mono transition ${
                activeDropdown === 'years' ? 'border-blue-500 bg-[#1c1c1c]' : 'border-[#2c2c2c]'
              }`}
              title="Jump directly to any historical year of 1-minute data"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-bold text-blue-300">
                {selectedYear ?? 'Year'}
              </span>
              <ChevronDown className={`w-2.5 h-2.5 text-slate-500 transition-transform ${activeDropdown === 'years' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'years' && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#0c0c0c]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-neutral-800 flex justify-between items-center">
                  <span>Select Year Partition</span>
                  <span className="text-blue-400 font-bold">1m Lake</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {yearsList.map((y) => (
                    <button
                      key={y.year}
                      onClick={() => {
                        setSelectedYear(y.year);
                        if (y.year === 'ALL') {
                          if (onBarLimitChange) onBarLimitChange(0);
                        } else if (onSelectEra) {
                          onSelectEra(y.from, y.to, `Year ${y.year}`);
                        }
                        setActiveDropdown(null);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-center font-bold text-xs transition ${
                        selectedYear === y.year
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-[#1a1a1a] text-slate-300 hover:text-white bg-[#141414] border border-neutral-800'
                      }`}
                    >
                      {y.year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Go to Date Button */}
          <button
            onClick={() => {
              setActiveDropdown(null);
              setIsDateRangeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141414] hover:bg-[#1f1f1f] border border-[#2c2c2c] text-emerald-300 font-mono transition text-[11px] font-bold"
            title="Custom Date Range Picker (2017 to 2025)"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Go to Date</span>
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-0.5 hidden sm:block" />

          {/* 8. Strategy Trade Overlay Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('trades')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121212] hover:bg-[#1c1c1c] border text-slate-200 font-mono transition ${
                selectedTradeStrategy
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-950/40 font-bold'
                  : activeDropdown === 'trades'
                  ? 'border-neutral-600 bg-[#1c1c1c]'
                  : 'border-[#222]'
              }`}
              title="Project backtested strategy trade executions onto candlestick chart"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] hidden sm:inline truncate max-w-[120px]">
                {selectedTradeStrategy ? selectedTradeStrategy : 'Trade Overlay'}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${activeDropdown === 'trades' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'trades' && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-[#0e0e0e]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-neutral-800 pb-1 flex justify-between items-center">
                  <span>Strategy Trade Projection</span>
                  <span className="text-[10px] text-emerald-400 font-bold">DuckDB</span>
                </div>

                <div className="space-y-1 font-mono text-xs max-h-60 overflow-y-auto scrollbar-thin pr-1">
                  <button
                    onClick={() => {
                      if (onSelectTradeStrategy) onSelectTradeStrategy(null);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition ${
                      selectedTradeStrategy === null
                        ? 'bg-neutral-800 text-white font-bold'
                        : 'text-slate-400 hover:bg-[#1a1a1a] hover:text-white'
                    }`}
                  >
                    <span>None (Raw Price Action)</span>
                    {selectedTradeStrategy === null && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  {tradeStrategies.map((strat) => (
                    <button
                      key={strat.strategy}
                      onClick={() => {
                        if (onSelectTradeStrategy) onSelectTradeStrategy(strat.strategy);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex flex-col gap-0.5 text-left px-2.5 py-1.5 rounded-lg transition ${
                        selectedTradeStrategy === strat.strategy
                          ? 'bg-emerald-950/70 border border-emerald-700 text-white font-bold'
                          : 'hover:bg-[#1a1a1a] text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{strat.strategy}</span>
                        <span className={`text-[10px] font-bold ${strat.expectancy_r >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {strat.expectancy_r >= 0 ? '+' : ''}{strat.expectancy_r}R
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between font-sans">
                        <span>{strat.trade_count.toLocaleString()} executions</span>
                        <span>Win Rate: {strat.win_rate}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-800 mx-0.5 hidden sm:block" />

          {/* 9. Indicators & Overlays Hub */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('indicators')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121212] hover:bg-[#1c1c1c] border text-slate-200 font-mono transition ${
                activeDropdown === 'indicators' ? 'border-purple-500 bg-[#1c1c1c]' : 'border-[#222]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-bold">Indicators</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-300 font-bold">
                {Object.values(activeIndicators).filter(Boolean).length}
              </span>
            </button>

            {activeDropdown === 'indicators' && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-76 bg-[#0e0e0e]/98 backdrop-blur-xl border border-neutral-800 rounded-xl shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-neutral-800 pb-1 flex justify-between items-center">
                  <span>Institutional Overlays</span>
                  <span className="text-[10px] text-purple-400 font-bold">
                    {Object.values(activeIndicators).filter(Boolean).length} Active
                  </span>
                </div>

                <div className="space-y-1 font-mono text-xs max-h-76 overflow-y-auto scrollbar-thin pr-1">
                  {[
                    { key: 'vpvr', label: 'Volume Profile (VPVR + POC / VAH / VAL)', color: 'text-amber-300 font-bold' },
                    { key: 'researchWall', label: 'Research Wall & Demarcation (2023)', color: 'text-purple-300 font-bold' },
                    { key: 'ema20', label: 'EMA 20 (Fast Trend)', color: 'text-cyan-400' },
                    { key: 'ema50', label: 'EMA 50 (Intermediate)', color: 'text-amber-400' },
                    { key: 'ema200', label: 'EMA 200 (Macro Baseline)', color: 'text-purple-400' },
                    { key: 'vwap', label: 'VWAP (Volume Weighted)', color: 'text-emerald-400' },
                    { key: 'bollinger', label: 'Bollinger Bands (20, 2.0)', color: 'text-blue-400' },
                    { key: 'rsi', label: 'RSI 14 (Oscillator Subpane)', color: 'text-rose-400' },
                    { key: 'macd', label: 'MACD (12, 26, 9 Subpane)', color: 'text-teal-400' },
                    { key: 'smcFvg', label: 'SMC: Fair Value Gaps (FVG)', color: 'text-yellow-400' },
                    { key: 'smcOb', label: 'SMC: Order Blocks (OB)', color: 'text-indigo-400' },
                  ].map((ind) => (
                    <button
                      key={ind.key}
                      onClick={() => onToggleIndicator(ind.key)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition border border-transparent hover:border-neutral-800"
                    >
                      <span className={`text-xs ${ind.color} font-medium`}>{ind.label}</span>
                      {(activeIndicators as any)[ind.key] ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Bar Replay + Fullscreen + Screenshot */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={onToggleReplay}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
              isReplayMode
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#121212] hover:bg-[#1c1c1c] border border-[#222] text-amber-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>

          <button
            onClick={onTakeScreenshot}
            title="Download HD Chart Snapshot"
            className="p-1.5 rounded bg-[#121212] hover:bg-[#1c1c1c] border border-[#222] text-slate-400 hover:text-white transition"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 rounded bg-[#121212] hover:bg-[#1c1c1c] border border-[#222] text-slate-400 hover:text-white transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Secondary Bar: Drawing Tools Quick Selector */}
      <div className="relative z-20 flex items-center justify-between px-3 py-1 bg-[#070707] border-t border-[#171717] text-[11px] font-mono select-none overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-slate-500 text-[10px] mr-1 uppercase">Draw:</span>
          {[
            { mode: 'CURSOR' as DrawingMode, label: 'Pointer', icon: MousePointer },
            { mode: 'TRENDLINE' as DrawingMode, label: 'Trendline', icon: TrendingUp },
            { mode: 'HORIZ_LINE' as DrawingMode, label: 'Price Level', icon: Minus },
            { mode: 'FIBONACCI' as DrawingMode, label: 'Fib Retracement', icon: Grid },
            { mode: 'RECTANGLE' as DrawingMode, label: 'Order Block Box', icon: Square },
            { mode: 'LONG_POSITION' as DrawingMode, label: 'Risk/Reward (Long)', icon: Target },
            { mode: 'SHORT_POSITION' as DrawingMode, label: 'Risk/Reward (Short)', icon: ShieldAlert },
            { mode: 'RULER' as DrawingMode, label: 'Measure Ruler', icon: Ruler },
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = drawingMode === tool.mode;
            return (
              <button
                key={tool.mode}
                onClick={() => onDrawingModeChange(tool.mode)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition ${
                  isActive
                    ? 'bg-purple-900/70 text-purple-300 border border-purple-600 font-bold'
                    : 'text-slate-400 hover:bg-[#141414] hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[10px] flex-shrink-0 pl-2">
          <span className="flex items-center gap-1 text-emerald-400">
            <Zap className="w-2.5 h-2.5" /> 100% Zero Lookahead
          </span>
        </div>
      </div>

      {/* Replay Control Ribbon */}
      {isReplayMode && (
        <div className="relative z-20 flex items-center justify-between px-4 py-2 bg-amber-950/40 border-t border-amber-800/40 text-amber-200 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Bar Replay Simulator:
            </span>
            <span className="text-slate-300">
              Bar {replayIndex} / {maxReplayIndex}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onStepBackward}
              disabled={replayIndex <= 10}
              className="p-1 rounded bg-[#171717] hover:bg-[#222] disabled:opacity-40 text-white"
              title="Step 1 Bar Backward"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPlayPauseReplay}
              className="flex items-center gap-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={onStepForward}
              disabled={replayIndex >= maxReplayIndex}
              className="p-1 rounded bg-[#171717] hover:bg-[#222] disabled:opacity-40 text-white"
              title="Step 1 Bar Forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onResetReplay}
              className="p-1 rounded bg-[#171717] hover:bg-[#222] text-slate-300"
              title="Reset to latest bar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded border border-neutral-800 text-[10px] font-mono">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded ${
                    replaySpeed === speed ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={onToggleReplay}
              className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 hover:bg-rose-900 text-xs font-mono"
            >
              Exit Replay
            </button>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {isDateRangeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-mono animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Historical Date Range</h3>
              </div>
              <button
                onClick={() => setIsDateRangeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="text-slate-400 text-[11px]">
                Directly stream any continuous slice of 1-minute data from Bitcoin's 8-year historical Data Lake (2017 to 2025).
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">Start Date (UTC):</label>
                <input
                  type="date"
                  min="2017-08-17"
                  max="2025-02-01"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-[#181818] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-bold">End Date (UTC):</label>
                <input
                  type="date"
                  min="2017-08-17"
                  max="2025-02-01"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-[#181818] border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between gap-2">
                <button
                  onClick={() => setIsDateRangeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const startTs = Math.floor(new Date(customStartDate + "T00:00:00Z").getTime() / 1000);
                    const endTs = Math.floor(new Date(customEndDate + "T23:59:59Z").getTime() / 1000);
                    if (onSelectEra && !isNaN(startTs) && !isNaN(endTs)) {
                      onSelectEra(startTs, endTs, `${customStartDate} to ${customEndDate}`);
                    }
                    setIsDateRangeModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Load 1-Minute Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
