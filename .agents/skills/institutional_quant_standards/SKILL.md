---
name: institutional_quant_standards
description: Enforces top-tier institutional quant engineering standards, clean readable code, strict typing, complete docstrings, no lookahead bias, and test-driven verification for Project APEX.
---

# Institutional Quant Engineering Skill — Project APEX

This skill guides code design, architectural decisions, and coding style to match top-tier quantitative trading firm standards (AQR, Citadel, Two Sigma).

## Key Directives

### 1. Code Cleanliness & Readability
- Write self-documenting, clean Python code using explicit domain variable names.
- Include Google-style docstrings for all public modules, classes, methods, and functions.
- Add informative inline comments for mathematical formulas, vectorized operations, and complex SQL.

### 2. Strict Type Hints & Schemas
- Apply 100% type hint coverage across parameters, return values, and data structures.
- Enforce schema contracts on pandas DataFrames (`open_time` indexed in UTC, OHLCV columns).

### 3. Rigorous Quant Mechanics
- Enforce point-in-time correctness (no lookahead bias).
- Always include transaction costs (fees + slippage) in backtests.
- Apply intrabar conservatism (pessimistic SL hit when SL and TP both trigger within the same candle).
- Externalize all magic numbers into `config/` YAML files.

### 4. Verification & QA
- Write comprehensive pytest tests for every module.
- Ensure all DB inserts and data lake pipelines are fully idempotent.
- Maintain `docs/decisions.md` ADR entries for non-obvious architecture trade-offs.
