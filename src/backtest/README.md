# Module 4 — Backtest & Simulation Engine (L4)

## Purpose
Turn candidate strategy configs into realistic, cost-aware simulated trade histories and log every single trade.

## Key Rules
- **Cost Model**: Fees (5 bps) + base slippage (2 bps) modeled on every run.
- **Next-bar open fill**: Signal at bar $t$ executes at open of $t+1$ (no same-bar fills).
- **Intrabar conservative rule**: If a bar hits both Stop Loss and Take Profit, pessimistic outcome (SL first) is recorded.
- **Run Registry**: Every backtest run writes a structured folder to `runs/<run_id>/`.
