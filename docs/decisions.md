# Project APEX — Architectural Decisions Log

This document records non-obvious technical choices, design trade-offs, and rationale as mandated by Master Plan §25.4.

---

## Decision Log Entries

### [2026-08-09] ADR-001: 12-Layer Modular Architecture & Folder Layout
- **Status**: Accepted
- **Context**: Project APEX requires a clean separation of concerns across data ingestion, feature generation, strategy mining, backtesting, trade database storage, edge analytics, validation, portfolio sizing, risk management, UI command center, execution, and monitoring.
- **Decision**: Adopt the 12-layer folder structure specified in Master Plan Page 13 (§8.1). All core code lives in `/src/<layer_name>`.
- **Rationale**: Keeps responsibilities cleanly isolated, allows wrapping external libraries (`vectorbt`, `NautilusTrader`, `duckdb`, `skfolio`) without coupling our system logic to third-party APIs, and ensures seamless upgrades.

### [2026-08-09] ADR-002: Hard Research Wall at 2022-12-31
- **Status**: Accepted
- **Context**: Strategy miners and edge scanners can easily overfit if allowed to look at recent market data.
- **Decision**: Code enforcement at the Data Access Layer (`src/datalake/api.py`): the miner process is only ever passed `end='2022-12-31'`. Post-2022 data is loaded exclusively inside the Validation Lab (`src/validation/`).
- **Rationale**: Enforces strict out-of-sample discipline in code rather than relying on human memory.

### [2026-08-09] ADR-003: DuckDB + Parquet Analytical Storage Engine
- **Status**: Accepted
- **Context**: We need high-speed, zero-cost local data storage that can query millions of OHLCV bars and labeled trades instantly.
- **Decision**: Store raw & feature bars in Snappy-compressed Parquet files and execute analytical SQL queries over them via DuckDB (`apex.duckdb`).
- **Rationale**: Provides columnar performance, zero database administration overhead, and instant SQL slicing across arbitrary session/day/regime dimensions.
