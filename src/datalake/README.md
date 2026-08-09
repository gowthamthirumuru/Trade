# Module 1 — Data Lake (L1)

## Purpose
Provide the entire system with clean, complete, validated, fast local market data (Binance public archive -> Parquet -> DuckDB).

## Responsibilities
- Bulk-download historical 1m klines from `data.binance.vision`.
- Incrementally update data nightly via CCXT (`fetch_ohlcv`).
- Resample base 1m granularity into derived timeframes (`5m`, `15m`, `1h`, `4h`, `1d`).
- Validate data quality (gaps, duplicates, OHLC sanity, zero-volume runs, clock integrity).
- Serve data through one API function: `get_bars(pair, tf, start, end) -> pd.DataFrame`.
