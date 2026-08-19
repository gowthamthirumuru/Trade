import urllib.request
import lzma
import struct
import datetime
import pandas as pd

def test_dukascopy_candle_url(symbol="EURUSD", year=2024, month=0, day=15):
    # month is 0-indexed (0 = Jan)
    url = f"https://datafeed.dukascopy.com/datafeed/{symbol}/{year}/{month:02d}/{day:02d}/BID_candles_min_1.bi5"
    print(f"Fetching: {url}")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            compressed_data = response.read()
            print(f"Downloaded {len(compressed_data)} bytes compressed.")
            if len(compressed_data) == 0:
                print("Empty file (weekend or no data)")
                return None
            try:
                decompressed = lzma.decompress(compressed_data)
                print(f"Decompressed to {len(decompressed)} bytes.")
                return decompressed
            except Exception as e:
                print("Decompress error:", e)
                return None
    except Exception as e:
        print(f"HTTP Error: {e}")
        return None

decomp = test_dukascopy_candle_url("EURUSD", 2024, 0, 15)
if decomp:
    print(f"Record count (24 bytes per candle): {len(decomp) // 24}")
    # Struct format for 1-min candles: 
    # int32 time_sec, int32 open, int32 close, int32 low, int32 high, float32 volume
    # Or >5I
    for i in range(min(5, len(decomp) // 24)):
        chunk = decomp[i*24:(i+1)*24]
        fields = struct.unpack(">IIIIIf", chunk)
        sec_offset, c_open, c_close, c_low, c_high, vol = fields
        print(f"Candle {i}: sec={sec_offset}, O={c_open/100000}, C={c_close/100000}, L={c_low/100000}, H={c_high/100000}, Vol={vol}")

print("\nTesting XAUUSD (Gold):")
decomp_gold = test_dukascopy_candle_url("XAUUSD", 2024, 0, 15)
if decomp_gold:
    print(f"Gold record count: {len(decomp_gold) // 24}")
    for i in range(min(5, len(decomp_gold) // 24)):
        chunk = decomp_gold[i*24:(i+1)*24]
        fields = struct.unpack(">IIIIIf", chunk)
        sec_offset, c_open, c_close, c_low, c_high, vol = fields
        print(f"Gold Candle {i}: sec={sec_offset}, O={c_open/1000}, C={c_close/1000}, L={c_low/1000}, H={c_high/1000}, Vol={vol}")
