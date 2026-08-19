/**
 * Quantitative Indicators & Smart Money Concepts (SMC) Calculation Engine.
 * 
 * Strict point-in-time calculation with zero lookahead bias.
 */

export interface CandleData {
  time: number;
  time_str?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface BollingerBandsPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface MACDPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface FairValueGap {
  id: string;
  type: 'BULLISH' | 'BEARISH';
  startIndex: number;
  startTime: number;
  endTime: number;
  top: number;
  bottom: number;
  mitigated: boolean;
}

export interface OrderBlock {
  id: string;
  type: 'BULLISH' | 'BEARISH';
  startIndex: number;
  startTime: number;
  endTime: number;
  top: number;
  bottom: number;
  mitigated: boolean;
}

/**
 * Calculate Exponential Moving Average (EMA).
 */
export function calculateEMA(candles: CandleData[], period: number): IndicatorPoint[] {
  if (!candles || candles.length < period) return [];
  const k = 2 / (period + 1);
  const result: IndicatorPoint[] = [];

  // Initial SMA for first EMA seed
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEMA = sum / period;
  result.push({ time: candles[period - 1].time, value: Number(prevEMA.toFixed(4)) });

  for (let i = period; i < candles.length; i++) {
    const close = candles[i].close;
    prevEMA = close * k + prevEMA * (1 - k);
    result.push({ time: candles[i].time, value: Number(prevEMA.toFixed(4)) });
  }

  return result;
}

/**
 * Calculate Simple Moving Average (SMA).
 */
export function calculateSMA(candles: CandleData[], period: number): IndicatorPoint[] {
  if (!candles || candles.length < period) return [];
  const result: IndicatorPoint[] = [];

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  result.push({ time: candles[period - 1].time, value: Number((sum / period).toFixed(4)) });

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result.push({ time: candles[i].time, value: Number((sum / period).toFixed(4)) });
  }

  return result;
}

/**
 * Calculate Volume-Weighted Average Price (VWAP).
 */
export function calculateVWAP(candles: CandleData[]): IndicatorPoint[] {
  if (!candles || candles.length === 0) return [];
  const result: IndicatorPoint[] = [];

  let cumVolume = 0;
  let cumVolPrice = 0;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumVolume += c.volume;
    cumVolPrice += typicalPrice * c.volume;

    const vwap = cumVolume > 0 ? cumVolPrice / cumVolume : typicalPrice;
    result.push({ time: c.time, value: Number(vwap.toFixed(4)) });
  }

  return result;
}

/**
 * Calculate Bollinger Bands (20, 2.0 std dev).
 */
export function calculateBollingerBands(
  candles: CandleData[],
  period: number = 20,
  stdDevMult: number = 2.0
): BollingerBandsPoint[] {
  if (!candles || candles.length < period) return [];
  const result: BollingerBandsPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, c) => acc + c.close, 0);
    const mean = sum / period;

    const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    result.push({
      time: candles[i].time,
      upper: Number((mean + stdDevMult * stdDev).toFixed(4)),
      middle: Number(mean.toFixed(4)),
      lower: Number((mean - stdDevMult * stdDev).toFixed(4)),
    });
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI 14) with Wilder's smoothing.
 */
export function calculateRSI(candles: CandleData[], period: number = 14): IndicatorPoint[] {
  if (!candles || candles.length <= period) return [];
  const result: IndicatorPoint[] = [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  result.push({ time: candles[period].time, value: Number(rsi.toFixed(2)) });

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const currentGain = diff >= 0 ? diff : 0;
    const currentLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);
    result.push({ time: candles[i].time, value: Number(rsi.toFixed(2)) });
  }

  return result;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD 12, 26, 9).
 */
export function calculateMACD(
  candles: CandleData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDPoint[] {
  if (!candles || candles.length < slowPeriod + signalPeriod) return [];

  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);

  const slowMap = new Map<number, number>(slowEMA.map((s) => [s.time, s.value]));
  const macdLinePoints: IndicatorPoint[] = [];

  for (const f of fastEMA) {
    if (slowMap.has(f.time)) {
      const slowVal = slowMap.get(f.time)!;
      macdLinePoints.push({ time: f.time, value: f.value - slowVal });
    }
  }

  if (macdLinePoints.length < signalPeriod) return [];

  const kSignal = 2 / (signalPeriod + 1);
  let sumSig = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sumSig += macdLinePoints[i].value;
  }
  let prevSignal = sumSig / signalPeriod;

  const result: MACDPoint[] = [];
  const firstMacd = macdLinePoints[signalPeriod - 1];
  result.push({
    time: firstMacd.time,
    macd: Number(firstMacd.value.toFixed(4)),
    signal: Number(prevSignal.toFixed(4)),
    histogram: Number((firstMacd.value - prevSignal).toFixed(4)),
  });

  for (let i = signalPeriod; i < macdLinePoints.length; i++) {
    const m = macdLinePoints[i];
    prevSignal = m.value * kSignal + prevSignal * (1 - kSignal);
    result.push({
      time: m.time,
      macd: Number(m.value.toFixed(4)),
      signal: Number(prevSignal.toFixed(4)),
      histogram: Number((m.value - prevSignal).toFixed(4)),
    });
  }

  return result;
}

/**
 * Calculate Average True Range (ATR 14).
 */
export function calculateATR(candles: CandleData[], period: number = 14): IndicatorPoint[] {
  if (!candles || candles.length <= period) return [];
  const trList: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const prevClose = candles[i - 1].close;
    const tr = Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose));
    trList.push(tr);
  }

  let sum = 0;
  for (let i = 0; i < period; i++) sum += trList[i];
  let prevATR = sum / period;

  const result: IndicatorPoint[] = [
    { time: candles[period].time, value: Number(prevATR.toFixed(4)) },
  ];

  for (let i = period; i < trList.length; i++) {
    prevATR = (prevATR * (period - 1) + trList[i]) / period;
    result.push({ time: candles[i + 1].time, value: Number(prevATR.toFixed(4)) });
  }

  return result;
}

/**
 * Convert standard candlesticks to Heikin-Ashi candlesticks.
 */
export function calculateHeikinAshi(candles: CandleData[]): CandleData[] {
  if (!candles || candles.length === 0) return [];
  const haCandles: CandleData[] = [];

  // First candle
  const first = candles[0];
  let haOpen = (first.open + first.close) / 2;
  let haClose = (first.open + first.high + first.low + first.close) / 4;
  let haHigh = Math.max(first.high, haOpen, haClose);
  let haLow = Math.min(first.low, haOpen, haClose);

  haCandles.push({
    time: first.time,
    time_str: first.time_str,
    open: Number(haOpen.toFixed(4)),
    high: Number(haHigh.toFixed(4)),
    low: Number(haLow.toFixed(4)),
    close: Number(haClose.toFixed(4)),
    volume: first.volume,
  });

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    haClose = (c.open + c.high + c.low + c.close) / 4;
    haOpen = (haOpen + haClose) / 2;
    haHigh = Math.max(c.high, haOpen, haClose);
    haLow = Math.min(c.low, haOpen, haClose);

    haCandles.push({
      time: c.time,
      time_str: c.time_str,
      open: Number(haOpen.toFixed(4)),
      high: Number(haHigh.toFixed(4)),
      low: Number(haLow.toFixed(4)),
      close: Number(haClose.toFixed(4)),
      volume: c.volume,
    });
  }

  return haCandles;
}

/**
 * Detect Smart Money Concepts Fair Value Gaps (FVG).
 */
export function detectFairValueGaps(candles: CandleData[]): FairValueGap[] {
  if (!candles || candles.length < 3) return [];
  const fvgs: FairValueGap[] = [];

  for (let i = 2; i < candles.length; i++) {
    const c0 = candles[i - 2];
    const c1 = candles[i - 1];
    const c2 = candles[i];

    // Bullish FVG: Low of candle[i] > High of candle[i-2]
    if (c2.low > c0.high && c1.close > c1.open) {
      fvgs.push({
        id: `fvg-bull-${i}`,
        type: 'BULLISH',
        startIndex: i - 1,
        startTime: c1.time,
        endTime: candles[Math.min(candles.length - 1, i + 15)].time,
        top: c2.low,
        bottom: c0.high,
        mitigated: false,
      });
    }

    // Bearish FVG: High of candle[i] < Low of candle[i-2]
    if (c2.high < c0.low && c1.close < c1.open) {
      fvgs.push({
        id: `fvg-bear-${i}`,
        type: 'BEARISH',
        startIndex: i - 1,
        startTime: c1.time,
        endTime: candles[Math.min(candles.length - 1, i + 15)].time,
        top: c0.low,
        bottom: c2.high,
        mitigated: false,
      });
    }
  }

  return fvgs.slice(-10);
}

/**
 * Detect Order Blocks (OB).
 */
export function detectOrderBlocks(candles: CandleData[]): OrderBlock[] {
  if (!candles || candles.length < 5) return [];
  const obs: OrderBlock[] = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const prev = candles[i];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];

    const bodySize = Math.abs(prev.close - prev.open);
    const avgBody = (Math.abs(next1.close - next1.open) + Math.abs(next2.close - next2.open)) / 2;

    // Bullish Order Block
    if (prev.close < prev.open && next1.close > next1.open && next2.close > next2.open && avgBody > bodySize * 1.5) {
      obs.push({
        id: `ob-bull-${i}`,
        type: 'BULLISH',
        startIndex: i,
        startTime: prev.time,
        endTime: candles[Math.min(candles.length - 1, i + 20)].time,
        top: prev.open,
        bottom: prev.low,
        mitigated: false,
      });
    }

    // Bearish Order Block
    if (prev.close > prev.open && next1.close < next1.open && next2.close < next2.open && avgBody > bodySize * 1.5) {
      obs.push({
        id: `ob-bear-${i}`,
        type: 'BEARISH',
        startIndex: i,
        startTime: prev.time,
        endTime: candles[Math.min(candles.length - 1, i + 20)].time,
        top: prev.high,
        bottom: prev.open,
        mitigated: false,
      });
    }
  }

  return obs.slice(-8);
}
