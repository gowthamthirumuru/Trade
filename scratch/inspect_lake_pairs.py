import os
import glob

binance_pairs = [os.path.basename(p) for p in glob.glob("data/raw/binance/*") if os.path.isdir(p)]
dukas_pairs = [os.path.basename(p) for p in glob.glob("data/raw/dukascopy/*") if os.path.isdir(p)]
print("Binance pairs on disk:", binance_pairs)
print("Dukascopy pairs on disk:", dukas_pairs)
