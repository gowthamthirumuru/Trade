"""Test script for Strategy Lab real fast-test simulation engine over DuckDB Parquet data."""
import duckdb
import numpy as np
import pandas as pd
from pathlib import Path

def test_fast_simulation():
    # 1. Check duckdb trades table
    con = duckdb.connect("db/apex.duckdb", read_only=True)
    rows = con.execute("SELECT strategy, count(*), avg(pnl_r) FROM trades GROUP BY strategy").fetchall()
    print("DuckDB trades by strategy:", rows)

    # 2. Check parquet files available in data/raw/
    raw_files = list(Path("data/raw").glob("**/*.parquet"))
    print(f"Found {len(raw_files)} raw Parquet files in data/raw/")
    for f in raw_files[:5]:
        print("  -", f)

    # 3. Test running a real vector simulation on XAUUSD 15m
    xau_file = Path("data/raw/dukascopy/XAUUSD/15m.parquet")
    if not xau_file.exists():
        xau_file = Path("data/raw/binance/BTCUSDT/15m.parquet")

    if xau_file.exists():
        df = con.execute(f"SELECT open_time, open, high, low, close, volume FROM read_parquet('{xau_file.as_posix()}') ORDER BY open_time ASC").fetchdf()
        print(f"Loaded {len(df)} candles for {xau_file.parent.name}")
        
        # Calculate Bollinger Bands
        close = df["close"].values
        sma20 = pd.Series(close).rolling(20).mean().values
        std20 = pd.Series(close).rolling(20).std().values
        lower_bb = sma20 - (2.0 * std20)
        upper_bb = sma20 + (2.0 * std20)

        # Vectorized Entry Signal: close crosses below lower BB and bounces back
        entries = (close < lower_bb)
        print(f"Found {np.sum(entries)} entry trigger signals")
    
    con.close()

if __name__ == "__main__":
    test_fast_simulation()
