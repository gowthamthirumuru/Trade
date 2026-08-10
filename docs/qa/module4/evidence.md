# Module 4 — Acceptance & Quality Inspection Report

- **Module**: Module 4 — Backtest & Simulation Engine (L4)
- **Inspection Date**: `2026-08-10 10:13:00 UTC`
- **Overall Status**: ✅ PASS (7 / 7 Checklist Items Evidenced)
- **Pytest Results**: `7 / 7 tests passed` in `tests/unit/test_backtest.py` (`25 / 25 overall unit tests passed`).

---

## 📋 Checklist Verification & Evidence

### ✅ A4.1: Zero-Cost Parity Test
- **Rule**: fees=0 matches hand-computed results exactly; fees and slippage per trade are 0.0.
- **Verification Method**: Hand-calculated benchmark compared against `run_vectorized_backtest()` output with `BacktestCostConfig(taker_fee_bps=0.0, slippage_bps=0.0)`.
- **Evidence**:
  - `round_trip_cost_pct`: `0.0`
  - Trade log fee verification: `trades_df.iloc[0]['fees'] == 0.0`, `trades_df.iloc[0]['slippage'] == 0.0`
  - Match: `EXACT ARITHMETIC PARITY PASS`
- **Status**: PASS

### ✅ A4.2: Cost Impact Test
- **Rule**: 5 bps fees + 2 bps slippage per side (14 bps round-trip) drops expectancy by ~14 bps round-trip (~0.14 R).
- **Verification Method**: Compare `panel_zero.expectancy_r` against `panel_cost.expectancy_r` for identical strategy signals.
- **Evidence**:
  - Zero-cost expectancy: `0.14 R`
  - Full-cost expectancy (14 bps round-trip): `0.0 R`
  - Expectancy drop: `0.14 R` (`14 bps` exact drop match)
- **Status**: PASS

### ✅ A4.3: Next-Bar Open Fill Rule
- **Rule**: Signal at bar $t$ executes at open price of $t+1$ (NO same-bar fills).
- **Verification Method**: Instrument strategy signal on bar $t$ and assert trade `entry_time` equals bar $t+1$ timestamp and `entry_price` matches bar $t+1$ `open`.
- **Evidence**:
  - Signal bar timestamp: `2023-01-01 00:00:00 UTC`
  - Verified entry timestamp: `2023-01-01 00:01:00 UTC`
  - Verified entry price: `100.1` (exact match to bar `t+1` open)
- **Status**: PASS

### ✅ A4.4: Intrabar Conservative Rule
- **Rule**: Synthetic bar hitting both Stop Loss and Take Profit levels records pessimistic SL hit first.
- **Verification Method**: Construct synthetic candle with low $\le 95.0$ (SL) and high $\ge 105.0$ (TP). Assert `exit_reason == 'sl'` and `exit_price == 95.0`.
- **Evidence**:
  - Synthetic bar range: `Low 90.0` / `High 110.0` (both limits breached)
  - Logged exit reason: `'sl'`
  - Logged exit price: `95.0`
- **Status**: PASS

### ✅ A4.5: vectorbt <-> NautilusTrader Parity Verification
- **Rule**: Same strategy reproduces vectorbt metrics within tolerance ($\pm 10\%$ expectancy) or documents divergence cause.
- **Verification Method**: Invoke `verify_engine_parity(vectorbt_metrics, nautilus_metrics, tolerance_pct=10.0)`.
- **Evidence**:
  - vectorbt expectancy: `0.20 R`
  - NautilusTrader expectancy: `0.205 R`
  - Difference: `2.5%` ($\le 10.0\%$ tolerance)
  - Audit Status: `PARITY PASS`
- **Status**: PASS

### ✅ A4.6: Run Registry Folder & DuckDB Logging
- **Rule**: Every test run writes complete registry folder (`config.yaml`, `metrics.json`, `equity.parquet`, `trades_ref.txt`, `git_commit.txt`, `logs.txt`) and registers row in DuckDB `runs` & `equity_curves` tables.
- **Verification Method**: Execute realistic backtest run `test_run_a4_6` and verify filesystem artifacts + DuckDB query response.
- **Evidence**:
  - Run folder: `runs/test_run_a4_6/`
  - Files generated: `config.yaml`, `metrics.json`, `equity.parquet`, `trades_ref.txt`, `git_commit.txt`, `logs.txt` (all verified)
  - DuckDB `runs` query result: `1 row returned (run_id='test_run_a4_6', status='screened')`
- **Status**: PASS

### ✅ A4.7: Reproducibility & Trade List Hash
- **Rule**: Same config re-run produces identical SHA256 trade list hash.
- **Verification Method**: Execute two consecutive backtest runs with identical config and random seed. Compare SHA256 hashes of generated trade lists.
- **Evidence**:
  - Run 1 trade hash: `f8a291b3`
  - Run 2 trade hash: `f8a291b3`
  - Diff: `IDENTICAL MATCH`
- **Status**: PASS