import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
  BaselineSeries,
  CrosshairMode,
  ColorType,
  LineStyle,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  createTextWatermark,
  SeriesMarker,
} from 'lightweight-charts';
import {
  CandleData,
  calculateEMA,
  calculateSMA,
  calculateVWAP,
  calculateBollingerBands,
  calculateRSI,
  calculateMACD,
  calculateHeikinAshi,
  detectFairValueGaps,
  detectOrderBlocks,
} from './indicators';
import { DrawingCanvas, DrawingMode } from './DrawingCanvas';
import { ChartStyle } from './TradingViewToolbar';
import { ShieldCheck, ShieldAlert, Sparkles, Target, Zap, Activity } from 'lucide-react';

export interface ChartTrade {
  trade_id: number;
  strategy: string;
  pair: string;
  timeframe: string;
  direction: 'long' | 'short';
  entry_time: number;
  entry_time_str: string;
  exit_time: number;
  exit_time_str: string;
  entry_price: number;
  exit_price: number;
  pnl_r: number;
  pnl_quote: number;
  exit_reason: string;
}

interface TradingViewChartProps {
  candles: CandleData[];
  pair: string;
  timeframe: string;
  chartStyle: ChartStyle;
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
  trades?: ChartTrade[];
  selectedTradeStrategy?: string | null;
  isReplayMode: boolean;
  replayIndex: number;
  onLoadMoreOlderBars?: () => void;
  isLoadingMore?: boolean;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles,
  pair,
  timeframe,
  chartStyle,
  drawingMode,
  onDrawingModeChange,
  activeIndicators,
  trades = [],
  selectedTradeStrategy = null,
  isReplayMode,
  replayIndex,
  onLoadMoreOlderBars,
  isLoadingMore = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const rsiContainerRef = useRef<HTMLDivElement | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const onLoadMoreOlderBarsRef = useRef(onLoadMoreOlderBars);
  const isLoadingMoreRef = useRef(isLoadingMore);

  useEffect(() => {
    onLoadMoreOlderBarsRef.current = onLoadMoreOlderBars;
  }, [onLoadMoreOlderBars]);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  // Series references
  const mainSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // VPVR & Research Wall price line references
  const pocLineRef = useRef<any>(null);
  const vahLineRef = useRef<any>(null);
  const valLineRef = useRef<any>(null);

  // RSI references
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // History pagination and viewport lock references
  const prevCandlesLengthRef = useRef(0);
  const prevEarliestTimeRef = useRef<number | null>(null);
  const prevLatestTimeRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);

  // Reset viewport tracking on pair or timeframe change
  useEffect(() => {
    isInitialLoadRef.current = true;
    prevCandlesLengthRef.current = 0;
    prevEarliestTimeRef.current = null;
    prevLatestTimeRef.current = null;
  }, [pair, timeframe]);

  // Hovered candle state for legend
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [hoveredIndicatorValues, setHoveredIndicatorValues] = useState<{
    ema20?: number;
    ema50?: number;
    ema200?: number;
    vwap?: number;
    rsi?: number;
  }>({});

  // Container dimensions for drawing canvas
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 500,
  });

  // 1. Point-in-time sliced candles (Replay Mode support)
  const displayCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    if (!isReplayMode) return candles;
    return candles.slice(0, Math.min(replayIndex, candles.length));
  }, [candles, isReplayMode, replayIndex]);

  const latestCandle = displayCandles.length > 0 ? displayCandles[displayCandles.length - 1] : null;
  const activeCandle = hoveredCandle || latestCandle;

  // Calculate Price Delta and Percentage
  const priceChange = useMemo(() => {
    if (!activeCandle) return { delta: 0, pct: 0, isUp: true };
    const delta = activeCandle.close - activeCandle.open;
    const pct = activeCandle.open > 0 ? (delta / activeCandle.open) * 100 : 0;
    return {
      delta: Number(delta.toFixed(2)),
      pct: Number(pct.toFixed(2)),
      isUp: delta >= 0,
    };
  }, [activeCandle]);

  // Determine Active Research Zone (In-Sample 2017-2022 vs Out-of-Sample 2023+)
  const researchZone = useMemo(() => {
    if (!activeCandle) return 'IS';
    const wallTimestamp = 1672531200; // 2023-01-01 00:00:00 UTC
    if (activeCandle.time >= wallTimestamp) {
      return 'OOS';
    }
    return 'IS';
  }, [activeCandle]);

  // Coordinate Conversion helper for Drawing Canvas
  const priceFromY = useCallback(
    (y: number): number => {
      if (!mainSeriesRef.current) return 0;
      try {
        const val = mainSeriesRef.current.coordinateToPrice(y);
        return typeof val === 'number' ? val : 0;
      } catch {
        return 0;
      }
    },
    []
  );

  const yFromPrice = useCallback(
    (price: number): number => {
      if (!mainSeriesRef.current) return 0;
      try {
        const val = mainSeriesRef.current.priceToCoordinate(price);
        return typeof val === 'number' ? val : 0;
      } catch {
        return 0;
      }
    },
    []
  );

  // 2. Initialize TradingView Main Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;
    setDimensions({ width, height });

    // Create Main Chart with institutional dark OLED styling
    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: '#080808' },
        textColor: '#787b86',
        fontSize: 11,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      },
      grid: {
        vertLines: { color: '#131313', style: LineStyle.Solid },
        horzLines: { color: '#131313', style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1d4ed8',
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1d4ed8',
        },
      },
      rightPriceScale: {
        borderColor: '#1e1e1e',
        scaleMargins: {
          top: 0.08,
          bottom: 0.22,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: '#1e1e1e',
        timeVisible: true,
        secondsVisible: timeframe === '1s' || timeframe === '1m',
        barSpacing: 8,
        minBarSpacing: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Create TradingView Watermark
    try {
      if (chart.panes && chart.panes().length > 0) {
        createTextWatermark(chart.panes()[0], {
          lines: [
            {
              text: 'APEX DATA LAB · ZERO LOOKAHEAD',
              color: 'rgba(255, 255, 255, 0.035)',
              fontSize: 28,
              fontFamily: 'monospace',
            },
          ],
        });
      }
    } catch {}

    // Volume Series (Bottom 20% of pane as overlay)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    try {
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.82, bottom: 0.0 },
      });
    } catch {}
    volumeSeriesRef.current = volumeSeries;

    // Crosshair Tracker for Dynamic Legend
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }

      const mainData = param.seriesData.get(mainSeriesRef.current) as any;
      if (mainData) {
        setHoveredCandle({
          time: Number(param.time),
          open: mainData.open ?? mainData.value ?? 0,
          high: mainData.high ?? mainData.value ?? 0,
          low: mainData.low ?? mainData.value ?? 0,
          close: mainData.close ?? mainData.value ?? 0,
          volume: (param.seriesData.get(volumeSeries) as any)?.value ?? 0,
        });
      }

      // Track indicator values on hover
      const e20 = (param.seriesData.get(ema20SeriesRef.current as any) as any)?.value;
      const e50 = (param.seriesData.get(ema50SeriesRef.current as any) as any)?.value;
      const e200 = (param.seriesData.get(ema200SeriesRef.current as any) as any)?.value;
      const vw = (param.seriesData.get(vwapSeriesRef.current as any) as any)?.value;
      setHoveredIndicatorValues({
        ema20: e20,
        ema50: e50,
        ema200: e200,
        vwap: vw,
      });
    });

    // Infinite Historical Scroll Listener
    chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
      if (!logicalRange) return;
      if (logicalRange.from < 30 && !isLoadingMoreRef.current) {
        if (onLoadMoreOlderBarsRef.current) {
          onLoadMoreOlderBarsRef.current();
        }
      }
    });

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          chart.applyOptions({ width: w, height: h });
          setDimensions({ width: w, height: h });
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      try {
        chart.remove();
      } catch {}
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
      ema20SeriesRef.current = null;
      ema50SeriesRef.current = null;
      ema200SeriesRef.current = null;
      bbUpperSeriesRef.current = null;
      bbMiddleSeriesRef.current = null;
      bbLowerSeriesRef.current = null;
    };
  }, [timeframe]);

  // 3A. Initialize/Switch Main Series on chartStyle or timeframe change
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (mainSeriesRef.current) {
      try {
        chart.removeSeries(mainSeriesRef.current);
      } catch {}
      mainSeriesRef.current = null;
    }

    if (chartStyle === 'CANDLES' || chartStyle === 'HOLLOW') {
      const isHollow = chartStyle === 'HOLLOW';
      mainSeriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: isHollow ? '#080808' : '#089981',
        downColor: '#f23645',
        borderUpColor: '#089981',
        borderDownColor: '#f23645',
        wickUpColor: '#089981',
        wickDownColor: '#f23645',
      });
    } else if (chartStyle === 'HEIKIN_ASHI') {
      mainSeriesRef.current = chart.addSeries(CandlestickSeries, {
        upColor: '#089981',
        downColor: '#f23645',
        borderUpColor: '#089981',
        borderDownColor: '#f23645',
        wickUpColor: '#089981',
        wickDownColor: '#f23645',
      });
    } else if (chartStyle === 'LINE') {
      mainSeriesRef.current = chart.addSeries(LineSeries, {
        color: '#38bdf8',
        lineWidth: 2,
        crosshairMarkerVisible: true,
      });
    } else if (chartStyle === 'AREA') {
      mainSeriesRef.current = chart.addSeries(AreaSeries, {
        topColor: 'rgba(56, 189, 248, 0.35)',
        bottomColor: 'rgba(56, 189, 248, 0.01)',
        lineColor: '#38bdf8',
        lineWidth: 2,
      });
    } else if (chartStyle === 'BARS') {
      mainSeriesRef.current = chart.addSeries(BarSeries, {
        upColor: '#089981',
        downColor: '#f23645',
      });
    } else if (chartStyle === 'BASELINE') {
      const avgPrice =
        displayCandles.length > 0
          ? displayCandles.reduce((acc, c) => acc + c.close, 0) / displayCandles.length
          : 0;
      mainSeriesRef.current = chart.addSeries(BaselineSeries, {
        baseValue: { type: 'price', price: avgPrice },
        topFillColor1: 'rgba(8, 153, 129, 0.35)',
        topFillColor2: 'rgba(8, 153, 129, 0.05)',
        bottomFillColor1: 'rgba(242, 54, 69, 0.05)',
        bottomFillColor2: 'rgba(242, 54, 69, 0.35)',
        topLineColor: '#089981',
        bottomLineColor: '#f23645',
      });
    }
  }, [chartStyle, timeframe]);

  // 3B. Populate / Update Data & Project Trade Markers
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !mainSeriesRef.current || displayCandles.length === 0) return;

    let seriesData: any[] = [];
    const dataToUse = chartStyle === 'HEIKIN_ASHI' ? calculateHeikinAshi(displayCandles) : displayCandles;

    if (chartStyle === 'LINE' || chartStyle === 'AREA' || chartStyle === 'BASELINE') {
      seriesData = dataToUse.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.close,
      }));
    } else {
      seriesData = dataToUse.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
    }

    let savedTimeRange: { from: any; to: any } | null = null;
    try {
      const vr = chart.timeScale().getVisibleRange();
      if (vr) savedTimeRange = { from: vr.from, to: vr.to };
    } catch {}

    const currentEarliest = displayCandles[0].time;
    const currentLatest = displayCandles[displayCandles.length - 1].time;
    const prevEarliest = prevEarliestTimeRef.current;
    const prevLatest = prevLatestTimeRef.current;

    const isBackwardPrepend = (
      prevEarliest !== null &&
      prevLatest !== null &&
      currentEarliest < prevEarliest &&
      Math.abs(currentLatest - prevLatest) < 180
    );

    mainSeriesRef.current.setData(seriesData);

    // Apply Trade Markers & Research Wall
    const markers: SeriesMarker<UTCTimestamp>[] = [];

    // Research Wall Demarcation Marker at 2023-01-01
    const wallTimestamp = 1672531200;
    if (activeIndicators.researchWall !== false && currentEarliest <= wallTimestamp && currentLatest >= wallTimestamp) {
      markers.push({
        time: wallTimestamp as UTCTimestamp,
        position: 'aboveBar',
        color: '#a855f7',
        shape: 'square',
        text: '🛡️ RESEARCH WALL: IN-SAMPLE (2017–2022) | OUT-OF-SAMPLE (2023+)',
      });
    }

    // Project Strategy Trades onto Candles
    if (trades && trades.length > 0 && selectedTradeStrategy) {
      for (const t of trades) {
        if (t.entry_time >= currentEarliest && t.entry_time <= currentLatest) {
          markers.push({
            time: t.entry_time as UTCTimestamp,
            position: t.direction === 'long' ? 'belowBar' : 'aboveBar',
            color: t.direction === 'long' ? '#10b981' : '#f43f5e',
            shape: t.direction === 'long' ? 'arrowUp' : 'arrowDown',
            text: `${t.direction.toUpperCase()} @ ${t.entry_price}`,
          });
        }
        if (t.exit_time >= currentEarliest && t.exit_time <= currentLatest) {
          markers.push({
            time: t.exit_time as UTCTimestamp,
            position: t.direction === 'long' ? 'aboveBar' : 'belowBar',
            color: t.pnl_r >= 0 ? '#10b981' : '#f43f5e',
            shape: 'circle',
            text: `${t.pnl_r >= 0 ? '+' : ''}${t.pnl_r.toFixed(2)}R (${t.exit_reason.toUpperCase()})`,
          });
        }
      }
    }

    if (markers.length > 0) {
      markers.sort((a, b) => (a.time as number) - (b.time as number));
      try {
        mainSeriesRef.current.setMarkers(markers);
      } catch {}
    } else {
      try {
        mainSeriesRef.current.setMarkers([]);
      } catch {}
    }

    if (volumeSeriesRef.current) {
      const volData = displayCandles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)',
      }));
      volumeSeriesRef.current.setData(volData);
    }

    if (isInitialLoadRef.current || !isBackwardPrepend) {
      isInitialLoadRef.current = false;
      chart.timeScale().fitContent();
    } else if (savedTimeRange) {
      requestAnimationFrame(() => {
        try {
          if (chartRef.current) {
            chartRef.current.timeScale().setVisibleRange(savedTimeRange!);
          }
        } catch {}
      });
    }

    prevCandlesLengthRef.current = displayCandles.length;
    prevEarliestTimeRef.current = currentEarliest;
    prevLatestTimeRef.current = currentLatest;
  }, [displayCandles, chartStyle, trades, selectedTradeStrategy, activeIndicators.researchWall]);

  // 4. Update Technical Overlays (EMA, VWAP, Bollinger Bands)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || displayCandles.length === 0) return;

    // EMA 20
    if (activeIndicators.ema20) {
      if (!ema20SeriesRef.current) {
        ema20SeriesRef.current = chart.addSeries(LineSeries, {
          color: '#06b6d4',
          lineWidth: 2,
          title: 'EMA 20',
        });
      }
      const emaData = calculateEMA(displayCandles, 20).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      }));
      ema20SeriesRef.current.setData(emaData);
    } else if (ema20SeriesRef.current) {
      chart.removeSeries(ema20SeriesRef.current);
      ema20SeriesRef.current = null;
    }

    // EMA 50
    if (activeIndicators.ema50) {
      if (!ema50SeriesRef.current) {
        ema50SeriesRef.current = chart.addSeries(LineSeries, {
          color: '#f59e0b',
          lineWidth: 2,
          title: 'EMA 50',
        });
      }
      const emaData = calculateEMA(displayCandles, 50).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      }));
      ema50SeriesRef.current.setData(emaData);
    } else if (ema50SeriesRef.current) {
      chart.removeSeries(ema50SeriesRef.current);
      ema50SeriesRef.current = null;
    }

    // EMA 200
    if (activeIndicators.ema200) {
      if (!ema200SeriesRef.current) {
        ema200SeriesRef.current = chart.addSeries(LineSeries, {
          color: '#a855f7',
          lineWidth: 2,
          title: 'EMA 200',
        });
      }
      const emaData = calculateEMA(displayCandles, 200).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      }));
      ema200SeriesRef.current.setData(emaData);
    } else if (ema200SeriesRef.current) {
      chart.removeSeries(ema200SeriesRef.current);
      ema200SeriesRef.current = null;
    }

    // VWAP
    if (activeIndicators.vwap) {
      if (!vwapSeriesRef.current) {
        vwapSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#10b981',
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
          title: 'VWAP',
        });
      }
      const vwapData = calculateVWAP(displayCandles).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      }));
      vwapSeriesRef.current.setData(vwapData);
    } else if (vwapSeriesRef.current) {
      chart.removeSeries(vwapSeriesRef.current);
      vwapSeriesRef.current = null;
    }

    // Bollinger Bands
    if (activeIndicators.bollinger) {
      if (!bbUpperSeriesRef.current) {
        bbUpperSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
        });
        bbMiddleSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#60a5fa',
          lineWidth: 1,
        });
        bbLowerSeriesRef.current = chart.addSeries(LineSeries, {
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
        });
      }
      const bbData = calculateBollingerBands(displayCandles, 20, 2.0);
      bbUpperSeriesRef.current.setData(
        bbData.map((d) => ({ time: d.time as UTCTimestamp, value: d.upper }))
      );
      bbMiddleSeriesRef.current?.setData(
        bbData.map((d) => ({ time: d.time as UTCTimestamp, value: d.middle }))
      );
      bbLowerSeriesRef.current?.setData(
        bbData.map((d) => ({ time: d.time as UTCTimestamp, value: d.lower }))
      );
    } else if (bbUpperSeriesRef.current) {
      chart.removeSeries(bbUpperSeriesRef.current);
      if (bbMiddleSeriesRef.current) chart.removeSeries(bbMiddleSeriesRef.current);
      if (bbLowerSeriesRef.current) chart.removeSeries(bbLowerSeriesRef.current);
      bbUpperSeriesRef.current = null;
      bbMiddleSeriesRef.current = null;
      bbLowerSeriesRef.current = null;
    }
  }, [activeIndicators, displayCandles]);

  // 5. Initialize & Update RSI Subpane Chart
  useEffect(() => {
    if (!activeIndicators.rsi || !rsiContainerRef.current) {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
      return;
    }

    if (!rsiChartRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        width: rsiContainerRef.current.clientWidth || 800,
        height: 120,
        layout: {
          background: { type: ColorType.Solid, color: '#060606' },
          textColor: '#787b86',
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: '#131313' },
          horzLines: { color: '#131313' },
        },
        rightPriceScale: {
          borderColor: '#1e1e1e',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          visible: false,
          borderColor: '#1e1e1e',
        },
      });

      rsiChartRef.current = rsiChart;

      const rsiSeries = rsiChart.addSeries(LineSeries, {
        color: '#f43f5e',
        lineWidth: 2,
      });
      rsiSeriesRef.current = rsiSeries;

      rsiSeries.createPriceLine({
        price: 70,
        color: '#ef4444',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '70 OB',
      });
      rsiSeries.createPriceLine({
        price: 30,
        color: '#10b981',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '30 OS',
      });
      rsiSeries.createPriceLine({
        price: 50,
        color: '#64748b',
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: false,
      });
    }

    if (rsiSeriesRef.current && displayCandles.length > 0) {
      const rsiData = calculateRSI(displayCandles, 14).map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.value,
      }));
      rsiSeriesRef.current.setData(rsiData);
      rsiChartRef.current?.timeScale().fitContent();
    }
  }, [activeIndicators.rsi, displayCandles]);

  // 6. Visible Range Volume Profile (VPVR) Calculation & Horizontal Price Lines
  const vpvrData = useMemo(() => {
    if (!activeIndicators.vpvr || !displayCandles || displayCandles.length === 0) return null;

    const windowSlice = displayCandles.length > 600 ? displayCandles.slice(-600) : displayCandles;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalVolume = 0;

    for (const c of windowSlice) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      totalVolume += c.volume;
    }

    if (minPrice === maxPrice || totalVolume === 0) return null;

    const numBins = 28;
    const binSize = (maxPrice - minPrice) / numBins;
    const bins: { price: number; buyVol: number; sellVol: number; totalVol: number }[] = [];

    for (let i = 0; i < numBins; i++) {
      bins.push({
        price: minPrice + i * binSize + binSize / 2,
        buyVol: 0,
        sellVol: 0,
        totalVol: 0,
      });
    }

    for (const c of windowSlice) {
      const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor((c.close - minPrice) / binSize)));
      if (c.close >= c.open) {
        bins[binIdx].buyVol += c.volume;
      } else {
        bins[binIdx].sellVol += c.volume;
      }
      bins[binIdx].totalVol += c.volume;
    }

    // Find POC (Point of Control)
    let pocBin = bins[0];
    for (const b of bins) {
      if (b.totalVol > pocBin.totalVol) {
        pocBin = b;
      }
    }

    // Value Area Calculation (70% of total volume)
    const targetVaVolume = totalVolume * 0.7;
    let currentVaVol = pocBin.totalVol;
    let pocIdx = bins.indexOf(pocBin);
    let lowIdx = pocIdx;
    let highIdx = pocIdx;

    while (currentVaVol < targetVaVolume && (lowIdx > 0 || highIdx < numBins - 1)) {
      const nextLowVol = lowIdx > 0 ? bins[lowIdx - 1].totalVol : -1;
      const nextHighVol = highIdx < numBins - 1 ? bins[highIdx + 1].totalVol : -1;

      if (nextHighVol >= nextLowVol && nextHighVol >= 0) {
        highIdx++;
        currentVaVol += bins[highIdx].totalVol;
      } else if (nextLowVol >= 0) {
        lowIdx--;
        currentVaVol += bins[lowIdx].totalVol;
      } else {
        break;
      }
    }

    const poc = pocBin.price;
    const vah = bins[highIdx].price;
    const val = bins[lowIdx].price;

    return {
      bins,
      poc: Number(poc.toFixed(2)),
      vah: Number(vah.toFixed(2)),
      val: Number(val.toFixed(2)),
      maxBinVolume: Math.max(...bins.map((b) => b.totalVol)),
    };
  }, [activeIndicators.vpvr, displayCandles]);

  // Update VPVR Horizontal Reference Lines on Main Chart
  useEffect(() => {
    if (!mainSeriesRef.current) return;

    try {
      if (pocLineRef.current) mainSeriesRef.current.removePriceLine(pocLineRef.current);
      if (vahLineRef.current) mainSeriesRef.current.removePriceLine(vahLineRef.current);
      if (valLineRef.current) mainSeriesRef.current.removePriceLine(valLineRef.current);
      pocLineRef.current = null;
      vahLineRef.current = null;
      valLineRef.current = null;

      if (activeIndicators.vpvr && vpvrData) {
        pocLineRef.current = mainSeriesRef.current.createPriceLine({
          price: vpvrData.poc,
          color: '#fbbf24',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: 'POC',
        });
        vahLineRef.current = mainSeriesRef.current.createPriceLine({
          price: vpvrData.vah,
          color: '#38bdf8',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'VAH (70%)',
        });
        valLineRef.current = mainSeriesRef.current.createPriceLine({
          price: vpvrData.val,
          color: '#f97316',
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: 'VAL (70%)',
        });
      }
    } catch {}
  }, [activeIndicators.vpvr, vpvrData]);

  // Detect SMC Overlays (FVG & Order Blocks on recent active window)
  const smcFvgs = useMemo(() => {
    if (!activeIndicators.smcFvg || !displayCandles || displayCandles.length === 0) return [];
    const windowSlice = displayCandles.length > 500 ? displayCandles.slice(-500) : displayCandles;
    return detectFairValueGaps(windowSlice);
  }, [activeIndicators.smcFvg, displayCandles]);

  const smcObs = useMemo(() => {
    if (!activeIndicators.smcOb || !displayCandles || displayCandles.length === 0) return [];
    const windowSlice = displayCandles.length > 500 ? displayCandles.slice(-500) : displayCandles;
    return detectOrderBlocks(windowSlice);
  }, [activeIndicators.smcOb, displayCandles]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#080808] overflow-hidden select-none">
      {/* Floating TradingView HUD Legend */}
      <div className="absolute top-2 left-3 z-20 flex flex-col gap-0.5 pointer-events-none text-xs font-mono">
        {/* Main Ticker + OHLC Info + Research Zone Demarcation */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0a0a0a]/90 backdrop-blur px-2.5 py-1 rounded-lg border border-neutral-800/80 shadow-lg pointer-events-auto">
          <span className="font-extrabold text-white text-sm">{pair}</span>
          <span className="text-slate-500">•</span>
          <span className="font-bold text-slate-300">{timeframe}</span>
          <span className="text-slate-500">•</span>
          <span className="text-[10px] text-purple-400 font-bold">
            {pair.includes('USDT') ? 'BINANCE' : 'DUKASCOPY'}
          </span>

          {/* Research Wall Zone Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              researchZone === 'OOS'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-sm shadow-emerald-900/30'
                : 'bg-amber-950/80 text-amber-300 border-amber-700/80 shadow-sm shadow-amber-900/30'
            }`}
            title="Institutional Research Wall (IS: 2017-2022 Mining vs OOS: 2023+ Validation)"
          >
            {researchZone === 'OOS' ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> OOS GAUNTLET (2023–2025)
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3 text-amber-400" /> IN-SAMPLE DISCOVERY (2017–2022)
              </>
            )}
          </span>

          {activeCandle && (
            <div className="flex items-center gap-3 text-xs pl-2 border-l border-neutral-800">
              <span className="text-slate-400">
                O <span className="text-white font-bold">{activeCandle.open?.toLocaleString()}</span>
              </span>
              <span className="text-slate-400">
                H <span className="text-emerald-400 font-bold">{activeCandle.high?.toLocaleString()}</span>
              </span>
              <span className="text-slate-400">
                L <span className="text-rose-400 font-bold">{activeCandle.low?.toLocaleString()}</span>
              </span>
              <span className="text-slate-400">
                C{' '}
                <span
                  className={`font-bold ${
                    priceChange.isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activeCandle.close?.toLocaleString()}
                </span>
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                  priceChange.isUp ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'
                }`}
              >
                {priceChange.delta >= 0 ? '+' : ''}
                {priceChange.delta} ({priceChange.pct >= 0 ? '+' : ''}
                {priceChange.pct}%)
              </span>
              <span className="text-slate-400">
                Vol{' '}
                <span className="text-slate-200 font-bold">
                  {activeCandle.volume?.toLocaleString()}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Active Indicators & Overlays Legend */}
        <div className="flex items-center gap-2 text-[11px] pl-1 pt-0.5 flex-wrap">
          {selectedTradeStrategy && (
            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
              <Target className="w-3 h-3 text-emerald-400" /> Trades: {selectedTradeStrategy} ({trades.length} executions)
            </span>
          )}
          {activeIndicators.ema20 && (
            <span className="text-cyan-400 font-medium">
              EMA 20: <span className="font-bold">{hoveredIndicatorValues.ema20?.toLocaleString() ?? '—'}</span>
            </span>
          )}
          {activeIndicators.ema50 && (
            <span className="text-amber-400 font-medium">
              EMA 50: <span className="font-bold">{hoveredIndicatorValues.ema50?.toLocaleString() ?? '—'}</span>
            </span>
          )}
          {activeIndicators.ema200 && (
            <span className="text-purple-400 font-medium">
              EMA 200: <span className="font-bold">{hoveredIndicatorValues.ema200?.toLocaleString() ?? '—'}</span>
            </span>
          )}
          {activeIndicators.vwap && (
            <span className="text-emerald-400 font-medium">
              VWAP: <span className="font-bold">{hoveredIndicatorValues.vwap?.toLocaleString() ?? '—'}</span>
            </span>
          )}
          {activeIndicators.vpvr && vpvrData && (
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <span>VPVR:</span>
              <span className="text-yellow-400">POC {vpvrData.poc}</span>
              <span className="text-cyan-400">VAH {vpvrData.vah}</span>
              <span className="text-orange-400">VAL {vpvrData.val}</span>
            </span>
          )}
          {activeIndicators.smcFvg && (
            <span className="text-yellow-400 font-medium">
              SMC FVG ({smcFvgs.length} active)
            </span>
          )}
          {activeIndicators.smcOb && (
            <span className="text-indigo-400 font-medium">
              SMC OB ({smcObs.length} active)
            </span>
          )}
        </div>
      </div>

      {/* Main Lightweight Charts Canvas Container */}
      <div className="relative flex-1 w-full min-h-[350px]">
        {isLoadingMore && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-purple-950/90 border border-purple-600/80 text-purple-200 text-[11px] font-mono rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Streaming earlier Parquet bars from DuckDB Data Lake...</span>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />

        {/* Visible Range Volume Profile (VPVR) Canvas Overlay */}
        {activeIndicators.vpvr && vpvrData && (
          <div className="absolute top-12 right-14 w-28 bottom-8 pointer-events-none z-10 flex flex-col-reverse justify-between opacity-85">
            {vpvrData.bins.map((b, idx) => {
              const buyWidth = Math.min(100, (b.buyVol / vpvrData.maxBinVolume) * 100);
              const sellWidth = Math.min(100, (b.sellVol / vpvrData.maxBinVolume) * 100);
              const isPoc = b.price === vpvrData.poc;
              return (
                <div key={idx} className="h-1.5 w-full flex items-center justify-end gap-0.5">
                  <div
                    style={{ width: `${buyWidth * 0.5}%` }}
                    className={`h-full rounded-l-xs ${isPoc ? 'bg-yellow-400' : 'bg-emerald-500/70'}`}
                  />
                  <div
                    style={{ width: `${sellWidth * 0.5}%` }}
                    className={`h-full rounded-r-xs ${isPoc ? 'bg-yellow-400' : 'bg-rose-500/70'}`}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Interactive Drawing Canvas Layer */}
        <DrawingCanvas
          mode={drawingMode}
          onModeChange={onDrawingModeChange}
          width={dimensions.width}
          height={dimensions.height}
          priceFromY={priceFromY}
          yFromPrice={yFromPrice}
        />
      </div>

      {/* RSI Subpane Chart Container */}
      {activeIndicators.rsi && (
        <div className="w-full h-28 border-t border-[#1a1a1a] relative bg-[#060606] flex-shrink-0">
          <div className="absolute top-1.5 left-3 z-10 text-[10px] font-mono text-rose-400 font-bold flex items-center gap-2">
            <span>RSI (14, Close)</span>
            <span className="text-slate-500">OB 70 / OS 30</span>
          </div>
          <div ref={rsiContainerRef} className="w-full h-full" />
        </div>
      )}
    </div>
  );
};
