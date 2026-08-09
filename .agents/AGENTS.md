# Project APEX — Agent Guidelines & Institutional Coding Standards

This document establishes the mandatory engineering standards, quantitative rigor, and code quality rules for **Project APEX**. Every AI agent and developer working on this codebase must adhere to these guidelines to ensure the project meets top-tier institutional quant standards.

---

## 🏛️ Core Engineering & Code Quality Standards

### 1. High Readability & Self-Documenting Code
- **Explicit Naming**: Use clear, domain-accurate identifiers (e.g., `trend_regime_ema200_slope` instead of `tr_s`).
- **Comprehensive Docstrings**: Every module, class, and public function MUST include detailed docstrings (Google/NumPy format) describing:
  - Purpose & context within the 12-layer APEX architecture
  - Parameters (with types and expected shapes/units)
  - Return values and types
  - Edge cases and exceptions raised
- **Inline Rationale Comments**: Comment non-obvious mathematical transformations, vectorization logic, and complex SQL joins, explaining **why** the logic is structured that way.

### 2. Strict Type Safety & Data Contracts
- **100% Type Annotation**: All function signatures, parameters, and return types must be fully typed (`pd.DataFrame`, `pd.Series`, `duckdb.DuckDBPyConnection`, `dict[str, Any]`, etc.).
- **Boundary Validation**: Validate DataFrames for required column schemas, non-empty states, and UTC timestamp indexing at module entry points.

### 3. Quantitative Rigor & Zero Lookahead Bias
- **Point-in-Time Discipline**: A feature or signal calculated at bar $t$ MUST ONLY use data available at or before bar $t$. Every custom feature requires a no-lookahead unit test.
- **Mandatory Cost Modeling**: Every backtest, sweep, or simulation MUST include taker fees (5 bps) and realistic slippage (2+ bps). Never execute zero-cost backtests.
- **Intrabar Ambiguity Rule**: If a bar's OHLC range contains both Stop Loss and Take Profit levels, the pessimistic outcome (SL hit first) is recorded.
- **Reproducibility Spine**: Every run must be seeded (`random_seed: 42`), config-driven, logged, and reproducible byte-for-byte.

### 4. Modular Separation of Concerns (The 12 Layers)
- **Interface Discipline**: Modules may ONLY communicate via their official contract functions specified in Master Plan §C2.5. Never import internal helper functions of another layer directly.
- **No Magic Numbers**: All thresholds, seeds, lookbacks, risk percentages, and limits MUST be externalized into `config/` YAML files (`system.yaml`, `universe.yaml`, `risk.yaml`).

### 5. Testing & Quality Assurance
- **Test-Driven Verification**: Every feature, indicator, trigger, filter, and sizer must be accompanied by unit tests in `tests/`.
- **Idempotency Guarantee**: Data Lake updaters, resamplers, and Trade Database writers must be idempotent (re-running on existing data yields 0 duplicate rows).
- **No Tick Without Evidence**: Never declare a task, feature, or checklist item complete without empirical evidence (passing pytest run, query log, or audit report).

---

## 📋 Definition of Done (Any Code Contribution)
1. ✅ **Code Written**: Clean, PEP-8 compliant code with strict type hints and docstrings.
2. ✅ **Tests Green**: Unit / integration tests written and passing under `pytest`.
3. ✅ **Config Externalized**: All thresholds and parameters configured in YAML.
4. ✅ **Decisions Logged**: Non-obvious choices recorded in `docs/decisions.md`.
5. ✅ **QA Evidenced**: Checklist item updated with concrete execution logs.
