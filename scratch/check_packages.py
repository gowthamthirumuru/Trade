import sys

for pkg in ["ccxt", "yfinance", "duckdb", "pandas", "requests", "urllib3"]:
    try:
        __import__(pkg)
        print(f"Package '{pkg}': INSTALLED")
    except ImportError:
        print(f"Package '{pkg}': NOT installed")
