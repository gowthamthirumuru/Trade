# Module 12 — Monitoring, Alerts & Edge-Decay Detection (L12)

## Purpose
Watch every strategy's live performance against its historical distribution and bench decaying edges before they cause loss.

## Decay Detector z-score thresholds
- $z > -1.5$: Healthy (Normal variance)
- $-1.5 \ge z > -2.0$: Watch (Note in weekly review)
- $-2.0 \ge z > -2.5$: Warning (Halve position size)
- $z < -2.5$: Benched (Size 0, requires re-validation gauntlet)
