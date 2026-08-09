# Module 2 — Feature & Regime Factory (L2)

## Purpose
Transform raw bars into the labeled, feature-enriched dataset that the miner, backtester, and edge analytics consume.

## Responsibilities
- Compute technical indicators using `pandas-ta` (Momentum, Trend, Volatility, Volume).
- Compute session & time labels (`hour_utc`, `day_of_week`, `session`: asia, europe, us, overlap).
- Compute regime labels (`trend_regime`: up, down, range; `vol_regime`: low, mid, high, extreme).
- Enforce point-in-time correctness (strict no-lookahead requirement).
- Materialize features to `data/features/<pair>/<tf>.features.parquet`.
