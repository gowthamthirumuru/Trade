# Module 3 — Strategy Miner (L3)

## Purpose
Automate the discovery of candidate strategies through systematic combinatorial search over building blocks.

## Architecture
- **Miner-1**: Staged brute-force combinatorial miner (`Stage 1` solo scan -> `Stage 2` pair-up -> `Stage 3` exit search -> `Stage 4` parameter plateau analysis).
- **Miner-2**: Genetic programming miner (`DEAP` + `gplearn`).
- **Miner-3**: Local ML trade-success classifier filter (`XGBoost` / `LightGBM`).
- **Trial Accounting**: Records total `n_variants_tested` into run metadata for Deflated Sharpe Ratio calculation.
