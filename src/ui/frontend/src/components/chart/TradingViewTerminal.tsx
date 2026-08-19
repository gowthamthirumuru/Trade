import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TradingViewToolbar, ChartStyle } from './TradingViewToolbar';
import { TradingViewChart, ChartTrade } from './TradingViewChart';
import { ChartWatchlist } from './ChartWatchlist';
import { DrawingMode } from './DrawingCanvas';
import { CandleData } from './indicators';

interface TradingViewTerminalProps {
  initialPair?: string;
  initialTimeframe?: string;
  instruments?: any[];
  onPairSelected?: (pair: string) => void;
}

export const TradingViewTerminal: React.FC<TradingViewTerminalProps> = ({
  initialPair = 'BTCUSDT',
  initialTimeframe = '15m',
  instruments = [],
  onPairSelected,
}) => {
  const [pair, setPair] = useState<string>(initialPair);
  const [timeframe, setTimeframe] = useState<string>(initialTimeframe);
  const [barLimit, setBarLimit] = useState<number>(5000);
  const [chartStyle, setChartStyle] = useState<ChartStyle>('CANDLES');
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('CURSOR');

  const [candles, setCandles] = useState<CandleData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Strategy Trade Overlay State
  const [tradeStrategies, setTradeStrategies] = useState<any[]>([]);
  const [selectedTradeStrategy, setSelectedTradeStrategy] = useState<string | null>(null);
  const [trades, setTrades] = useState<ChartTrade[]>([]);

  // Indicators State with Volume Profile & Research Wall active
  const [activeIndicators, setActiveIndicators] = useState({
    ema20: true,
    ema50: false,
    ema200: false,
    vwap: false,
    bollinger: false,
    rsi: false,
    macd: false,
    smcFvg: true,
    smcOb: true,
    vpvr: true,
    researchWall: true,
  });

  // Replay Simulator State
  const [isReplayMode, setIsReplayMode] = useState(false);
  const [replayIndex, setReplayIndex] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);

  // UI state
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  // Synchronize initialPair if provided
  useEffect(() => {
    if (initialPair) setPair(initialPair);
  }, [initialPair]);

  // Fetch available trade strategies for pair
  useEffect(() => {
    fetch(`/api/v1/research/datalab/trade-strategies?pair=${pair}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setTradeStrategies(data);
        }
      })
      .catch(() => {});
  }, [pair]);

  // Fetch strategy trades when selected
  useEffect(() => {
    if (!selectedTradeStrategy) {
      setTrades([]);
      return;
    }
    fetch(`/api/v1/research/datalab/trades?pair=${pair}&strategy=${selectedTradeStrategy}&limit=500`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setTrades(data);
        }
      })
      .catch(() => {});
  }, [pair, selectedTradeStrategy]);

  // Fetch real candles and pair stats from DuckDB
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/v1/research/datalab/candles?pair=${pair}&timeframe=${timeframe}&limit=${barLimit}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.candles) {
          setCandles(data.candles);
          setStats(data.stats || null);
          setReplayIndex(data.candles.length);
        } else {
          setCandles([]);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [pair, timeframe, barLimit]);

  // Ref-based loading guard — avoids stale closure issues in scroll listener
  const isLoadingMoreRef = useRef(false);

  // Infinite Scroll Handler: Load earlier historical chunks on left scroll
  const handleLoadMoreOlderBars = useCallback(() => {
    if (isLoadingMoreRef.current || candles.length === 0) return;
    const earliestTime = candles[0].time;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    fetch(`/api/v1/research/datalab/candles?pair=${pair}&timeframe=${timeframe}&before_time=${earliestTime}&limit=10000`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.candles && data.candles.length > 0) {
          setCandles((prev) => {
            const map = new Map<number, CandleData>();
            for (const c of data.candles) map.set(c.time, c);
            for (const c of prev) map.set(c.time, c);
            return Array.from(map.values()).sort((a, b) => a.time - b.time);
          });
        }
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      })
      .catch(() => {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      });
  }, [candles, pair, timeframe]);

  // Macro Regime Jump Handler
  const handleSelectEra = (fromTime: number, toTime: number, _name: string) => {
    setIsLoading(true);
    fetch(`/api/v1/research/datalab/candles?pair=${pair}&timeframe=${timeframe}&from_time=${fromTime}&to_time=${toTime}&limit=0`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.candles && data.candles.length > 0) {
          setCandles(data.candles);
          setReplayIndex(data.candles.length);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const handlePairChange = (newPair: string) => {
    setPair(newPair);
    setSelectedTradeStrategy(null);
    if (onPairSelected) onPairSelected(newPair);
  };

  const handleToggleIndicator = (key: string) => {
    setActiveIndicators((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Replay Player Loop
  useEffect(() => {
    if (!isReplayMode || !isPlaying) return;

    const intervalMs = Math.max(200, 1000 / replaySpeed);
    const timer = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= candles.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isReplayMode, isPlaying, replaySpeed, candles.length]);

  const handleToggleReplay = () => {
    if (!isReplayMode) {
      setReplayIndex(Math.max(10, Math.floor(candles.length * 0.6)));
      setIsReplayMode(true);
      setIsPlaying(false);
    } else {
      setIsReplayMode(false);
      setIsPlaying(false);
      setReplayIndex(candles.length);
    }
  };

  const handleToggleFullscreen = () => {
    if (!terminalRef.current) return;
    if (!document.fullscreenElement) {
      terminalRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleTakeScreenshot = () => {
    const link = document.createElement('a');
    link.download = `APEX_${pair}_${timeframe}_${Date.now()}.png`;
    const canvas = terminalRef.current?.querySelector('canvas');
    if (canvas) {
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div
      ref={terminalRef}
      className={`w-full flex flex-col bg-[#080808] border border-[#1f1f1f] rounded-xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[640px]'
      }`}
    >
      {/* Top TradingView Toolbar */}
      <TradingViewToolbar
        pair={pair}
        onPairChange={handlePairChange}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        chartStyle={chartStyle}
        onChartStyleChange={setChartStyle}
        drawingMode={drawingMode}
        onDrawingModeChange={setDrawingMode}
        activeIndicators={activeIndicators}
        onToggleIndicator={handleToggleIndicator}
        tradeStrategies={tradeStrategies}
        selectedTradeStrategy={selectedTradeStrategy}
        onSelectTradeStrategy={setSelectedTradeStrategy}
        isReplayMode={isReplayMode}
        onToggleReplay={handleToggleReplay}
        replayIndex={replayIndex}
        maxReplayIndex={candles.length}
        isPlaying={isPlaying}
        onPlayPauseReplay={() => setIsPlaying(!isPlaying)}
        onStepForward={() => setReplayIndex((prev) => Math.min(candles.length, prev + 1))}
        onStepBackward={() => setReplayIndex((prev) => Math.max(10, prev - 1))}
        onResetReplay={() => {
          setReplayIndex(candles.length);
          setIsPlaying(false);
        }}
        replaySpeed={replaySpeed}
        onChangeSpeed={setReplaySpeed}
        onTakeScreenshot={handleTakeScreenshot}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        allPairs={instruments}
        barLimit={barLimit}
        onBarLimitChange={setBarLimit}
        onSelectEra={handleSelectEra}
      />

      {/* Main Terminal Body: Chart + Watchlist Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {isLoading && candles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-slate-400 bg-[#080808]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              Streaming DuckDB Parquet bars for {pair} ({timeframe})...
            </div>
          </div>
        ) : candles.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-xs font-mono text-slate-400 bg-[#080808]">
            <div className="text-slate-400">No candle data in current memory window.</div>
            <button
              onClick={() => {
                setBarLimit(5000);
                setIsLoading(true);
                fetch(`/api/v1/research/datalab/candles?pair=${pair}&timeframe=${timeframe}&limit=5000`)
                  .then((res) => (res.ok ? res.json() : null))
                  .then((data) => {
                    if (data && data.candles) {
                      setCandles(data.candles);
                      setStats(data.stats || null);
                      setReplayIndex(data.candles.length);
                    }
                    setIsLoading(false);
                  })
                  .catch(() => setIsLoading(false));
              }}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition shadow-lg"
            >
              ⚡ Load Recent 5,000 Candles
            </button>
          </div>
        ) : (
          <div className="flex-1 h-full relative">
            <TradingViewChart
              candles={candles}
              pair={pair}
              timeframe={timeframe}
              chartStyle={chartStyle}
              drawingMode={drawingMode}
              onDrawingModeChange={setDrawingMode}
              activeIndicators={activeIndicators}
              trades={trades}
              selectedTradeStrategy={selectedTradeStrategy}
              isReplayMode={isReplayMode}
              replayIndex={replayIndex}
              onLoadMoreOlderBars={handleLoadMoreOlderBars}
              isLoadingMore={isLoadingMore}
            />
          </div>
        )}

        {/* Right Collapsible Watchlist & HUD Drawer */}
        <ChartWatchlist
          isOpen={isWatchlistOpen}
          onToggle={() => setIsWatchlistOpen(!isWatchlistOpen)}
          selectedPair={pair}
          onSelectPair={handlePairChange}
          instruments={instruments}
          stats={stats}
        />
      </div>
    </div>
  );
};
