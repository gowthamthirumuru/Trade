# Module 7 — Validation Lab (L7)

## Purpose
The immune system of the entire operation. Rejects overfit candidates before paper or live trading.

## The Gauntlet (6 Gates)
1. **Gate 1**: OOS Replay (`2023->now`, unseen). Expectancy > 0, PF > 1.15.
2. **Gate 2**: Anchored Walk-Forward Analysis. WFE >= 0.5, no catastrophic fold.
3. **Gate 3**: Monte Carlo x4 (Reshuffle, Skip 10-30%, Block Bootstrap, Cost Stress 2x/3x).
4. **Gate 4**: Regime Stress. Survives all 6 regime cells.
5. **Gate 5**: PBO (Combinatorially Symmetric Cross-Validation). PBO < 0.20.
6. **Gate 6**: Deflated Sharpe Ratio (DSR). Adjusts for trial count ($n_{\text{variants}}$) with $p < 0.05$.
