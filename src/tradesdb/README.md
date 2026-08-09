# Module 5 — Trade Database (L5)

## Purpose
The system's permanent analytical memory store (`db/apex.duckdb`), labeling every simulated or live trade richly for SQL edge mining.

## Responsibilities
- Schema initialization and migration execution (`db/migrations/`).
- Centralized edge label derivation (`src/tradesdb/label.py`) joining features at trade entry time.
- Idempotent upsert of trade batches.
- Maintenance of SQL analytical views (`v_strategy_summary`, etc.).
