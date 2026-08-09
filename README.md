# Project APEX — Institutional-Grade Quant Trading System

Project APEX is a zero-budget, institutional-grade quantitative trading system designed to continuously discover, validate, filter, size, monitor, and retire trading strategies using open-source Python tools.

---

## 🏛️ Architecture (The 12 Layers)

- **L1 Data Lake** (`src/datalake/`): Binance public archive bulk download (tick-to-1m), CCXT live updates, vectorized resampler, data validator.
- **L2 Feature Factory** (`src/features/`): Indicators, trend/volatility regime labelers, time & session labels, lookahead-free feature store (`.parquet`).
- **L3 Strategy Miner** (`src/miner/`): Staged combinatorial search (brute-force -> genetic -> local ML trade classifier).
- **L4 Backtest Engine** (`src/backtest/`): `vectorbt` for high-speed screening + `NautilusTrader` for realistic event-driven validation.
- **L5 Trade Database** (`src/tradesdb/`): DuckDB analytical store logging every trade with 30+ edge labels (`apex.duckdb`).
- **L6 Edge Analytics Engine** (`src/edge/`): SQL dimension slicing (session x regime x day x hour), significance testing (BH FDR), Edge Card generator.
- **L7 Validation Lab** (`src/validation/`): Anti-overfitting gauntlet: Anchored Walk-Forward (WFE >= 0.5), Monte Carlo battery (x4), Regime Stress, PBO, Deflated Sharpe Ratio (DSR).
- **L8 Portfolio Construction Engine** (`src/portfolio/`): `skfolio` HRP (Hierarchical Risk Parity), CVaR allocation, correlation guards.
- **L9 Risk Engine** (`src/risk/`): Position sizing (volatility targeting / fixed fractional), VaR/CVaR (GARCH), 9 code-enforced circuit breakers.
- **L10 Command Center** (`src/ui/`): Interactive Streamlit UI (Overview, Miner Control, Edge Explorer, Validation, Portfolio, Journal, Data Manager).
- **L11 Execution & Live Loop** (`src/execution/`): Telegram alert bot, manual/paper trading protocol, testnet bridge (CCXT / Freqtrade).
- **L12 Monitoring & Edge-Decay** (`src/monitoring/`): Trailing expectancy z-score detector, regime absence tracker, automated daily/weekly/monthly reports.

---

## 📁 Repository Layout

```text
apex/
├── README.md
├── requirements.txt
├── pyproject.toml
├── config/
│   ├── system.yaml
│   ├── universe.yaml
│   ├── risk.yaml
│   └── strategies/
├── data/
│   ├── raw/
│   ├── features/
│   └── calendar/
├── db/
│   ├── apex.duckdb
│   └── migrations/
├── notebooks/
├── src/
│   ├── datalake/
│   ├── features/
│   ├── miner/
│   ├── backtest/
│   ├── tradesdb/
│   ├── edge/
│   ├── validation/
│   ├── portfolio/
│   ├── risk/
│   ├── ui/
│   ├── execution/
│   └── monitoring/
├── tests/
└── runs/
```

---

## 🚀 Quick Start & Installation

### 1. Python Environment Setup
Recommended: Python 3.11+

```bash
python -m venv .venv
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate
```

### 2. Install Core Dependencies
```bash
pip install -r requirements.txt
```

### 3. Verify Installation
```bash
python -c "import duckdb, vectorbt, skfolio; print('Project APEX stack initialized successfully!')"
```

---

## 📜 Core Design Principles
1. **The database is the product** — Strategies are disposable; labeled trade memory compounds forever.
2. **Costs first, always** — Fees, spread, and slippage are modeled from day one.
3. **In-sample is for searching, out-of-sample is for deciding** — Hard research wall at `2022-12-31`.
4. **Kill ruthlessly** — Expecting 90-95% candidate rejection in the Validation Lab is healthy operation.
