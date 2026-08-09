# Module 8 — Portfolio Construction Engine (L8)

## Purpose
Decide capital allocation across validated strategies and pairs using `skfolio` HRP (Hierarchical Risk Parity).

## Key Constraints
- `max_weight_per_strategy`: 0.30
- `max_weight_per_pair`: 0.40
- `max_cluster_weight`: 0.50
- `correlation_guard`: Halves combined weight if rolling 90d return correlation > 0.60.
