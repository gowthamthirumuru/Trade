import yfinance as yf
import pandas as pd

print("Testing yfinance for EURUSD, GBPUSD, XAUUSD:")

for ticker_sym in ["EURUSD=X", "GBPUSD=X", "GC=F"]:
    t = yf.Ticker(ticker_sym)
    # Test full 1d history (max historical depth)
    df_daily = t.history(period="max", interval="1d")
    print(f"\n{ticker_sym} (Daily Max):")
    print(f"  Rows: {len(df_daily)}")
    if not df_daily.empty:
        print(f"  Start: {df_daily.index[0]}  |  End: {df_daily.index[-1]}")
        print(f"  Sample row:\n{df_daily.iloc[-1][['Open', 'High', 'Low', 'Close', 'Volume']]}")

    # Test 1h history (730 days limit on Yahoo)
    df_1h = t.history(period="730d", interval="1h")
    print(f"{ticker_sym} (1h 730d): Rows: {len(df_1h)}")
    if not df_1h.empty:
        print(f"  Start: {df_1h.index[0]}  |  End: {df_1h.index[-1]}")
