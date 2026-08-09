# Module 9 — Risk Engine (L9)

## Purpose
Convert "we have an edge" into "we survive long enough to compound it." Owns position sizing, exposure limits, VaR estimation, and circuit breakers.

## Circuit Breakers (Code-Enforced)
1. **Per-trade risk**: <= 1% equity (Reject order plan if exceeded)
2. **Concurrent positions**: <= 5
3. **Same-direction single-asset exposure**: <= 2 positions
4. **Daily loss limit**: -1.5% equity (Flat + locked until next day)
5. **Weekly loss limit**: -4.0% equity (Flat + locked until Monday)
6. **Strategy drawdown limit**: -15.0% (Strategy benched)
7. **Portfolio drawdown limit (halve)**: -12.0% (All sizes halved)
8. **Portfolio drawdown limit (full stop)**: -20.0% (FULL STOP -> manual review)
9. **API/journal failure**: Stop new trades until logging restored.
