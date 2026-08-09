# THE TRADER'S STRATEGY BOOK
## 100 Scalping & Intraday Strategies with Rules, Statistics and Backtesting Blueprints
### Forex · Crypto · Indices · Gold · Futures — Evidence-Based Edition, 2026

---

# How to Use This Book

This book is a working reference, not a reading book. Each of the 100 strategies occupies exactly one page and follows the same structure so you can compare strategies like-for-like and lift the rules straight into backtesting code.

**The page anatomy.** Every strategy page shows: (1) a header with market, timeframe, style and an evidence grade; (2) a quick-stats table with win rate, reward-to-risk, profit factor, maximum drawdown and expectancy; (3) the concept and the source of the edge; (4) exact setup, entry and exit rules; (5) risk management; (6) the published backtest evidence or typical practitioner ranges; (7) when the strategy works and when it fails; (8) backtesting notes so you can code it; (9) common variations.

**Evidence grades.** Each strategy carries one of three grades, and you should treat them very differently:

- **Grade A — Published backtest.** Specific statistics from a named public backtest, academic paper or book are quoted, with the source named on the page. You can verify the numbers yourself.
- **Grade B — Documented practitioner ranges.** The strategy is widely documented and traded, and the statistics shown are consensus ranges from multiple practitioner sources rather than one verified study.
- **Grade C — Framework strategy.** The logic is sound and widely used professionally, but reliable public statistics are scarce. Treat the numbers as hypotheses to validate, not results.

**The brutal honesty clause.** A backtest is a hypothesis, not a promise. Published results are frequently produced on idealized fills, without realistic spread, slippage, latency or fees — and retail scalping strategies are the most sensitive of all to these costs. Research on breakout systems has shown that 3 points of slippage can turn a winning DAX strategy into a loser, and that realistic fees can erase the edge of 5-minute crypto systems entirely. Before you trade any page in this book with real money: (1) re-run the backtest yourself on your broker's data with your real costs; (2) demand out-of-sample and walk-forward validation; (3) paper-trade it for at least 30 sessions. No page in this book guarantees profit. Roughly 70–90% of retail day traders lose money in regulatory studies — discipline and cost control, not any single strategy, are what separate the minority who survive.

**Reading the statistics.** *Win rate* alone is meaningless: a 40% win rate at 2:1 reward-to-risk (+0.35R expectancy per trade) beats a 70% win rate at 0.5:1 (+0.05R). *Profit factor* = gross wins ÷ gross losses; above 1.3 is viable, above 1.75 is strong. *Expectancy* = (win% × avg win) − (loss% × avg loss); anything above +0.2R after costs is a real edge. *Max drawdown* is the worst peak-to-trough equity decline; size positions so you can psychologically survive 1.5× the backtested drawdown.

---

# Part I — Index & Equity Mean-Reversion Strategies

Mean reversion is the single most robust documented edge in equity indices: since S&P 500 futures began trading in 1982, broad US indices have shown a persistent tendency to bounce after 1–3 day sell-offs. These 13 strategies harvest that tendency at different speeds.

## S01 · RSI(2) Mean Reversion — The Connors Classic

**Market:** S&P 500 (SPY, ES), Nasdaq (QQQ) · **Timeframe:** Daily signal, intraday execution · **Style:** Mean reversion · **Evidence:** Grade A (Connors & Alvarez, *Short Term Trading Strategies That Work*, 2008; QuantifiedStrategies backtest, SPY 1993–2025)

| Win rate | Avg gain/trade | Profit factor | Max DD | Time in market |
|---|---|---|---|---|
| 70–85% (76% documented) | 0.5–0.95% | ~1.9 | 15–34% | 18–28% |

**Concept & edge.** A 2-period RSI is hyper-sensitive: one or two panic days slam it below 10. Because equity indices mean-revert, buying that panic inside a long-term uptrend has produced win rates above 70% for three decades. The edge is behavioral — you are buying forced liquidation from weak hands.

**Setup.** Daily chart: 200-day SMA, 5-day SMA, RSI(2).

**Entry rules.** (1) Close above the 200-day SMA (uptrend filter). (2) RSI(2) closes below 10 (aggressive: below 5). (3) Buy at the close, or at next day's open for realistic fills.

**Exit rules.** Exit when price closes above the 5-day SMA. No fixed stop — the original research found stops hurt this system; risk is controlled by the trend filter and position size.

**Risk management.** Risk 1–2% of equity per trade via position sizing. Optional disaster stop at 2× ATR(10). Skip signals when VIX > 30 or ahead of FOMC/CPI.

**Backtest evidence.** On SPY 1993–2025: buying RSI(2) < 10, selling above RSI(2) > 80 returned ~9%/yr with a 34% max DD (invested 28% of the time); the exit variant "close above yesterday's high" cut drawdown to 15% with a 76% win rate. Independent 34-year replications confirm the high win rate and much lower drawdown than buy-and-hold, though CAGR trails buy-and-hold because exposure is low.

**Works / fails.** Works on broad equity indices and large-cap ETFs in bull and sideways regimes. Fails badly in crash phases (2008, March 2020 win rates dropped under 60%) and on single volatile stocks or commodities.

**Backtesting notes.** Trivial to code: ~30 lines in Python. Model next-open fills, not close fills, to avoid look-ahead. Test thresholds 4–12 to confirm robustness (avoid single-point curve fit). Include 0.02% slippage.

**Variations.** RSI(2) < 5 with scale-in (buy 25% at <10, add at <5, <3, <1); intraday RSI(2) on 30–60 min bars with thresholds 10/90; dual-filter version requiring price above both 50- and 200-day SMA (boosts win rate 5–10%).

---

## S02 · RSI(2) with Trend Filter — Quality Over Quantity

**Market:** SPY, QQQ, large-cap ETFs · **Timeframe:** Daily · **Style:** Mean reversion · **Evidence:** Grade A (QuantifiedStrategies, 1993–2025)

| Win rate | Avg gain/trade | Max DD | CAGR | Trades/yr |
|---|---|---|---|---|
| 75–79% | ~0.95% | ~31% → 15% with exit tweak | 6.8–9% | 8–15 |

**Concept & edge.** The plain RSI(2) occasionally buys falling knives. Requiring price above the 200-day SMA sacrifices some trades but removes the worst regimes. This is the version most professionals quote: the filter converts a raw signal into a tradeable system.

**Setup.** 200-day SMA, 5-day SMA, RSI(2) on daily bars.

**Entry rules.** (1) Close > 200 SMA. (2) RSI(2) < 5. (3) Enter at close (backtest) or next open (live).

**Exit rules.** Close above 5-day SMA. Optional secondary exit: RSI(2) > 70.

**Risk management.** 1% risk sizing; max 2 concurrent positions if running on multiple ETFs; accept that some years produce only a handful of trades — that is the price of quality.

**Backtest evidence.** Adding the 200-SMA filter raised average gain per trade from 0.9% to 0.95% and cut max drawdown from 34% to 31% while cutting exposure from 28% to 18%. Published screeners show 75–79% win rates on S&P 500 stocks with the filter applied.

**Works / fails.** Works in persistent uptrends; underperforms in V-bottom recoveries because the filter keeps you out after crashes (price is below the 200 SMA precisely when rebounds are strongest). Fails on instruments without an upward drift.

**Backtesting notes.** Compare filter on/off over identical periods; measure exposure-adjusted return (CAGR ÷ time in market), not raw CAGR. Watch for the long flat stretches — 2015–2016 and 2022 produce few signals.

**Variations.** Require RSI(2) < 10 for first tranche and < 5 for second; use 100-day SMA for more signals; add "close below 5-day SMA for 2 consecutive days" as a pullback-quality filter.

---

## S03 · Cumulative RSI — Smoothed Panic Detection

**Market:** S&P 500 futures (ES), also NQ, YM · **Timeframe:** Daily · **Style:** Mean reversion · **Evidence:** Grade A (StatOasis/Ali Casey backtest, ES 2006–2025, published 2021 with out-of-sample tracking)

| Win rate | Trades | Avg trade | Losing years (2006–2025) | OOS result |
|---|---|---|---|---|
| 67% | 542 | $367/contract | 1 | +$23,997 (2021–2025) |

**Concept & edge.** RSI(2) became crowded after Connors popularized it; edge decays when everyone watches the same number. Cumulative RSI sums the last 2–3 RSI(2) readings, demanding *persistent* oversold conditions instead of a one-bar extreme — fewer whipsaws, smoother equity.

**Setup.** Daily bars. Compute RSI(2); Cumulative RSI = sum of the last 2 RSI(2) values.

**Entry rules.** Buy when Cumulative RSI(2,2) < 40. The 3D-optimized sweet spot across 3,900 parameter combinations was RSI period 2, sum bars 2, buy level 40.

**Exit rules.** Sell when Cumulative RSI > 25 (quick exit), or on close above the 5-day SMA.

**Risk management.** 1–1.5% risk per trade; no stop in the published version (exit is signal-based), but a 3× ATR disaster stop is a sane addition.

**Backtest evidence.** 542 trades on ES, 2006–2025: 67% win rate, $367 average trade, only one losing year. Out-of-sample since publication (2021–2025): +$23,997 per contract net, with 2022 and 2025 the only negative years — exactly the durability profile you want.

**Works / fails.** Works on US index futures through volatile regimes (2022 bear included). Like all mean reversion, it suffers in straight-line crashes; the summation delays entry slightly versus raw RSI(2).

**Backtesting notes.** Optimize over a *grid* and demand a plateau of profitable parameters, not a peak. The published optimization shows a stable region around (2, 2, 40/25) — replicate that plateau before trusting it. Weighted variants (recent RSI counts double) are worth testing.

**Variations.** Asymmetric summation (3 bars for entry, 1 for exit); combine with a 200-SMA regime filter; apply to QQQ/SPY ETFs instead of futures.

---

## S04 · IBS — Internal Bar Strength

**Market:** SPY, QQQ (best on equity indices) · **Timeframe:** Daily close signal · **Style:** Mean reversion · **Evidence:** Grade A (QuantifiedStrategies, SPY/QQQ 1993–2024)

| Win rate | Avg gain/trade | CAGR | Max DD | Profit factor |
|---|---|---|---|---|
| 68–74% | 0.41–0.56% | 12.5–16.6% | 22–26% | 1.9–2.7 |

**Concept & edge.** IBS = (Close − Low) ÷ (High − Low). When a day closes near its low (IBS < 0.2), short-term sellers are exhausted; indices bounce. It is the simplest complete edge ever published — one formula, no parameters to overfit, profitable for 30 years.

**Setup.** Daily bars. Compute IBS from the just-closed day.

**Entry rules.** Buy at the close when IBS < 0.2.

**Exit rules.** Sell at the close when IBS > 0.8 (typically 1–5 days later).

**Risk management.** Full-equity or fixed-fraction sizing; a 10% disaster stop is optional but historically unused. Avoid scaling up after losses.

**Backtest evidence.** SPY 1993–2024: 919 trades, 68% win rate, 0.41% average gain, 12.5% CAGR vs 9.9% buy-and-hold, max DD −26%, profit factor 1.9. QQQ: 742 trades, 0.56%/trade, 16.6% CAGR. Only three losing years (1994, 2002, 2018). A two-indicator combination lifted the win rate to 78% (SPY) and 75% (QQQ) with 0.8–1.33% per trade.

**Works / fails.** Works on equity indices, *especially* in volatile/bear periods (2020 was its best year ever). Fails on commodity-linked markets (Norwegian/Australian stocks, gold, metals) and in dead-low-volatility grinds (2017).

**Backtesting notes.** Signals fire at the close — model MOC (market-on-close) orders or next-open fills and compare. Watch the exposure (~25–36%): risk-adjusted returns beat buy-and-hold even when raw CAGR is similar.

**Variations.** 2-day average IBS < 0.25 entry; IBS + RSI(3) combo; short side (IBS > 0.9) — historically weak long-only edge, short side barely profitable, use as a filter not a signal.

---

## S05 · IBS + RSI Confirmation Combo

**Market:** SPY, QQQ, XLP · **Timeframe:** Daily · **Style:** Mean reversion · **Evidence:** Grade A (QuantifiedStrategies strategy #4, inception–2024)

| Win rate | Avg gain/trade | Days/trade | Max DD | Profit factor |
|---|---|---|---|---|
| 78% (SPY), 75% (QQQ) | 0.8% (SPY), 1.33% (QQQ) | ~4.8 | −19.5 to −23.8% | 2.0–2.9 |

**Concept & edge.** Two independent oversold gauges agreeing is rarer and stronger than either alone. IBS measures *where* the day closed; RSI measures *how fast* it fell. Agreement filters out slow grinds that keep grinding.

**Setup.** IBS on daily bars plus RSI(3).

**Entry rules.** Buy at close when IBS < 0.2 **and** RSI(3) < 20 (both conditions same day).

**Exit rules.** Sell at close when IBS > 0.8 or RSI(3) > 70, whichever first.

**Risk management.** Fewer trades (~278 on SPY since 1993) means each matters more; risk 1–2% sizing, no averaging down beyond one add.

**Backtest evidence.** SPY: 278 trades, 78% win rate, 0.8%/trade, profit factor 2.0, max DD −23.75%. QQQ: 232 trades, 75% win rate, 1.33%/trade, profit factor 2.9, max DD −19.5%. Average winner 1.7–2.4% vs average loser 1.75–2.3% — the win rate, not the asymmetry, carries the edge.

**Works / fails.** Best on indices and defensive sectors (XLP works well). Trade overlap between SPY and QQQ is very high — pick one. Fails during prolonged distribution phases (2000–2002 style).

**Backtesting notes.** Test each component alone first, then the combo — the combo must beat *both* on expectancy per unit of exposure to justify its lower frequency. Beware confirmation bias: with two conditions it's easy to keep tweaking thresholds until the backtest looks pretty (curve fitting).

**Variations.** IBS 2-day average < 0.3 + RSI(3) < 30 (more trades); add VIX < 25 regime filter; XLP-specific version with 2-day IBS average.

---

## S06 · Fade the Small Gap (SPY)

**Market:** SPY / ES · **Timeframe:** Daily open, intraday hold · **Style:** Opening-gap mean reversion · **Evidence:** Grade A (QuantifiedStrategies, SPY 2005–2012; verified on 30-min IQFeed data)

| Win rate | Avg gain/fill | Target | Trades/yr | Style risk |
|---|---|---|---|---|
| 80–89% (small samples) | 0.19–0.22% (long) | 75% of gap | 40–60 | Occasional large loser |

**Concept & edge.** Small overnight gaps (−0.15% to −0.6%) in SPY are usually noise, not news; the opening auction overreacts and the gap fills during the session. Big gaps (>1%) are information — they trend, so don't fade those.

**Setup.** Yesterday's OHLC + today's open. Compute gap % and yesterday's close position in range: (C−L)/(H−L).

**Entry rules.** (1) Gap down between −0.15% and −0.6%. (2) Yesterday's close in the lower quartile of its range (< 0.25). (3) Buy the opening print. (Mirror for gap-ups, though longs work better.)

**Exit rules.** Target = 75% of the gap size. If not reached, exit at the close. No other stop in the original — a 1× gap-size stop is the common live addition.

**Risk management.** The distribution is "many small wins, occasional big loser" — cap size so one bad day costs < 1.5%. Best later in the week (Wednesday–Friday statistically strongest) and late in the month.

**Backtest evidence.** 2010–2012 EOD test: 110 fills, 98 winners, +0.19% average. Intraday verification: 89 fills, +0.22% long, +0.08% short. Gaps outside yesterday's range averaged 0.111%; gaps after high-range days 0.185%.

**Works / fails.** Works in normal-volatility regimes on index ETFs. Fails on news-heavy mornings (CPI, FOMC, NFP), in crash regimes, and the edge has narrowed as algos arb it — re-validate on recent data.

**Backtesting notes.** EOD data overstates results (bad high/low quotes); use intraday data. Model the opening auction fill realistically — you will not always get the print.

**Variations.** Trade only Wednesday–Friday; only gaps outside yesterday's range; combine with RSI(2) < 10 for higher average per fill.

---

## S07 · ES Micro-Gap Fill (0.05–0.2% Gaps)

**Market:** E-mini S&P (ES/MES) · **Timeframe:** Session open · **Style:** Gap-fill intraday · **Evidence:** Grade A (Edgeful 6-month statistics + TradeThatSwing 3-month live algo run, 2026)

| Win rate | Gap-fill rate | Profit factor | Max DD | 3-month return |
|---|---|---|---|---|
| 61–71% | 88% (0.05–0.2% gaps) | 1.75 | 8.5–9% | +29–44% (one contract, $10k) |

**Concept & edge.** The smallest overnight gaps on ES are pure overnight inventory adjustment and statistically fill ~88% of the time — for both gap-ups and gap-downs. This is one of the few scalping edges documented with live (not just backtested) algo results in 2026.

**Setup.** Previous RTH close vs today's RTH open; gap size filter 0.05–0.2%.

**Entry rules.** At the open, enter in the direction of the fill (short a small gap-up, long a small gap-down). Skip gaps > 0.2% — fill rates collapse.

**Exit rules.** Target: full gap fill (yesterday's close). Stop: beyond the open by ~1× gap size or a fixed dollar cap ($500/contract in the live run). Time stop: flat by lunch if unfilled.

**Risk management.** Largest documented loser was $512 on a $10k account (5%) — the publisher himself recommends $20k per contract to halve that. One trade per day maximum.

**Backtest evidence.** Live algo, 3 months: 14 trades, 10 winners (71%), +44% on $10k; subsequent quarter +29% with 61% win rate, PF 1.75, 9% max DD. The underlying 88% fill statistic comes from 6 months of Edgeful data.

**Works / fails.** Works in quiet, range-bound overnight environments. Fails when gaps are news-driven (the filter excludes most of these by size, but not all — skip CPI/FOMC mornings). Tiny edge per trade means costs and fill quality decide everything.

**Backtesting notes.** You need RTH open/close data (not 24h session data). Model the fill at open + 1 tick, not at the open print. Track fill-rate statistics monthly — when fill rates decay, stop trading it.

**Variations.** MES micro contracts for small accounts; partial target at 50% fill with breakeven stop; apply to NQ with a wider size band (NQ gaps are larger in %).

---

## S08 · Turnaround Tuesday

**Market:** SPY / S&P 500 · **Timeframe:** Daily (Mon→Tue) · **Style:** Calendar mean reversion · **Evidence:** Grade A (QuantifiedStrategies, SPY 1993–2024)

| Win rate | Avg gain/trade | CAGR | Exposure | Trades |
|---|---|---|---|---|
| 56–69% (variant dependent) | 0.3–0.46% | 1.8–7% | 2.5–10% | ~212 |

**Concept & edge.** After a down Monday, Tuesday rebounds with remarkable persistence — documented for decades. Suspected drivers: weekend-news overreaction, Monday retail panic, institutional re-positioning. Buying Monday *strength* fails — the edge is strictly in buying weakness.

**Setup.** Daily bars; Monday return; optional IBS filter.

**Entry rules.** (1) Monday closes down (baseline) — refined version: Monday down AND IBS < 0.3. (2) Buy Monday's close.

**Exit rules.** Baseline: sell Tuesday's close. Extended variant: hold up to 3–4 days or exit on IBS > 0.8 — this lifted CAGR to 6.5–7% with 60–69% win rates.

**Risk management.** Tiny edge per trade (~0.3%) — costs matter; use commission-free ETF trading or futures. 1% risk sizing.

**Backtest evidence.** Raw rule: 212 trades, 56% win rate, +0.3%/trade, 1.8% CAGR at 2.5% exposure. With IBS filter: 57% WR, 2.7% CAGR. Extended holding: 60–69% WR, 6.5–7% CAGR. Flipped (buy Monday strength): negative — confirming the anomaly.

**Works / fails.** Works on SPY and other equity indices; robust across decades. Fails in strong downtrends (Mondays that start crash weeks keep falling); the raw edge is modest and needs filters.

**Backtesting notes.** 25 lines of code. Test day-of-week interactions: is Tuesday special, or does any down day rebound? (The latter is mostly true — Tuesday is the cleanest calendar instance.) Watch the small sample: ~50 Mondays/year.

**Variations.** Buy Monday close, sell Wednesday close; only trade when Monday's drop > 0.5%; combine with RSI(2) < 10 for rare but high-quality signals.

---

## S09 · The Overnight Edge (Buy Close, Sell Open)

**Market:** IWM, QQQ, DAX, SPY · **Timeframe:** Close → next open · **Style:** Overnight premium · **Evidence:** Grade A (QuantifiedStrategies published edges, 2023–2024; academic "overnight returns" literature)

| Win rate | Avg gain/trade | Profit factor | Max DD | Exposure |
|---|---|---|---|---|
| 60–77% | 0.15–0.31% | 1.5–4.0 | −2 to −10% | 2.5–7.3% |

**Concept & edge.** Academically, essentially *all* of the S&P 500's long-term return has accrued overnight; the intraday session nets to roughly zero over decades. Structural causes: closing-auction imbalances, overnight risk premium, retail market-on-open orders. You hold ~14 hours to capture the premium while avoiding intraday chop.

**Setup.** Any liquid index ETF/future. The published IWM variant adds one short-term condition (a down day / low IBS filter).

**Entry rules.** Buy at the close (MOC order). The filtered versions require a same-day weakness condition (e.g., close in lower half of the day's range).

**Exit rules.** Sell at next morning's open (MOO order). Never hold past the first 5 minutes.

**Risk management.** Overnight gap risk is the whole risk — size for a 2–3% adverse gap. Avoid holding overnight before CPI, FOMC, or earnings-heavy sessions.

**Backtest evidence.** Published IWM edge: 152 trades, 77% win rate, +0.31%/trade, profit factor 4, max DD −2% at 2.5% exposure. QQQ variants: 60–61% WR, PF 1.5–1.9. DAX: 202 trades, 66% WR, PF 2.4, max DD −4%.

**Works / fails.** Works on equity indices (US and European); far weaker or negative on forex and commodities. Fails in crash regimes when overnight gaps go both ways violently.

**Backtesting notes.** MOC/MOO fills are realistically achievable (auction participation), so this backtests honestly. Check the short side too — historically ~flat, so long-only is fine. Split results by day of week; Monday-overnight and Friday-overnight differ.

**Variations.** Overnight + RSI(2) < 10; "close below open today" trigger only; DAX version buying the 17:30 CET close, selling the 09:00 open.

---

## S10 · 5-Day Moving Average Snapback

**Market:** S&P 500 · **Timeframe:** Daily · **Style:** Mean reversion · **Evidence:** Grade A (QuantifiedStrategies moving-average study, S&P 500)

| Win rate | CAGR | Max DD | Profile | Best MA length |
|---|---|---|---|---|
| ~65% (typical) | 8.18% (5-day) | −27.9% | High-frequency MR | 5 days |

**Concept & edge.** A rigorous sweep of MA lengths 5–200 showed a clean pattern: *short* averages work as mean-reversion triggers (buy below, sell above), *long* averages work as trend filters. The 5-day is the sweet spot: near buy-and-hold returns with far less exposure.

**Setup.** 5-day SMA on daily bars.

**Entry rules.** Buy at close when price closes below the 5-day SMA.

**Exit rules.** Sell at close when price closes above the 5-day SMA.

**Risk management.** No stop in the study; add a 3× ATR disaster stop for live use. Whipsaw risk in sideways markets is the main cost.

**Backtest evidence.** S&P 500 long-term: 5-day version CAGR 8.18% vs 10-day 7.8%, 25-day 5.09%, 200-day 2.93% (mean-reversion direction). Max DD −27.9% for the 5-day vs −49 to −62% for the trend-direction variants. The shorter the MA, the better the mean-reversion performance — monotonic relationship.

**Works / fails.** Works on equity indices with upward drift. Fails in trending bear markets (you keep buying weakness) and on instruments without mean-reverting character (commodities, many forex pairs).

**Backtesting notes.** This is a teaching-system as much as a trading system: use it to learn how exposure-adjusted returns work. Code it in 20 lines, then test MA lengths 3–10 to confirm the plateau.

**Variations.** Buy only if close < 5-day SMA by > 0.5% (depth filter); exit on close > 5-day SMA for 2 consecutive days; combine with 200-SMA trend filter (buys only in uptrends).

---

## S11 · Bollinger %B Reversal

**Market:** SPY, QQQ, EUR/USD H1 · **Timeframe:** Daily / H1 · **Style:** Band mean reversion · **Evidence:** Grade B (documented across multiple practitioner backtests; mean-reversion meta-studies show 65–75% WR for band systems)

| Win rate | Typical RR | Profit factor | Max DD | Best regime |
|---|---|---|---|---|
| 60–75% | 1:1 to 1:1.5 | 1.3–1.6 | 10–20% | Range-bound |

**Concept & edge.** Price spends ~95% of its time inside 2-standard-deviation Bollinger Bands. Touches of the outer band in *ranging* markets are statistically likely to revert toward the mean (the 20 SMA). The edge is strongest when the bands are flat, not expanding.

**Setup.** Bollinger Bands (20, 2). Optional %B indicator (0 = lower band, 1 = upper band). ADX(14) < 20 as range filter.

**Entry rules.** Long: close below the lower band with %B < −0.05 AND ADX < 20; enter on the first close back inside the band. Short: mirror.

**Exit rules.** Target: the 20 SMA (band midline). Aggressive: opposite band. Stop: 1× ATR(14) beyond the entry bar's extreme, or a close beyond the band for 2 consecutive bars.

**Risk management.** Band rides are the killer — in trends price walks the band for days. The ADX filter is non-negotiable. Risk 0.5–1% per trade.

**Backtest evidence.** Documented band-reversion systems on stock indices show 60–75% win rates with modest per-trade gains and 10–20% drawdowns; 2025 out-of-sample tests of refined versions reported +30.4% with 72% WR and −10.2% max DD vs Nasdaq's +24.4%. Meta-analyses place mean-reversion systems at 65–75% win rate vs 10–40% for trend systems.

**Works / fails.** Works in low-ADX, range-bound conditions on indices and major forex pairs. Fails catastrophically in breakouts/trends without the regime filter — the single most common way beginners blow up with bands.

**Backtesting notes.** The regime filter (ADX or band width percentile) is part of the strategy, not an optional extra — test with and without. Use %B rather than raw price so the code is instrument-agnostic.

**Variations.** Double-band (1.5σ entry, 2.5σ stop); %B divergence entry; Keltner-Bollinger combination (trade reversion only when KC is inside BB).

---

## S12 · Three Down Days Reversal

**Market:** S&P 500, QQQ · **Timeframe:** Daily · **Style:** Streak mean reversion · **Evidence:** Grade B (documented in Connors research and multiple quant blogs)

| Win rate | Avg gain/trade | Hold | Max DD | Frequency |
|---|---|---|---|---|
| 60–68% | 0.4–0.7% | 1–3 days | 15–25% | 15–30 signals/yr |

**Concept & edge.** Three consecutive lower closes in an uptrend is a statistically stretched state; the fourth day has historically been positive well above chance. Streaks trigger capitulation psychology — weak hands exit exactly when odds improve.

**Setup.** Daily bars; 200-SMA trend filter; count consecutive down closes.

**Entry rules.** (1) Price above 200 SMA. (2) Three consecutive down closes (stronger: each day closes in its lower half). (3) Buy day-3 close.

**Exit rules.** Sell on the first up close, or after a fixed 3 days. Exit all if price closes below the 200 SMA.

**Risk management.** 1% risk sizing; streaks of 5–6 down days happen in real sell-offs, so never add to a 4th/5th down day without the trend filter intact.

**Backtest evidence.** Connors-group research on 3-day streaks in the S&P 500 documented win rates in the low-to-mid 60s with ~0.5% average gains per trade over multi-decade samples, degrading below the 200 SMA. Consistent with the broader 2–3 day panic literature (RSI-2, IBS).

**Works / fails.** Works on equity indices in uptrends. Fails in bear markets (streaks extend) and on low-liquidity instruments where 3 down days is normal noise.

**Backtesting notes.** Count the conditional probabilities yourself: P(up day | 3 down days, above 200 SMA) vs unconditional P(up day). The difference *is* the edge; demand it exceed 8–10 points. Compare 2, 3, 4-day streaks.

**Variations.** Require cumulative 3-day loss > 2%; scale-in across days 3–5; pair with IBS < 0.2 on day 3.

---

## S13 · Double 7s (Connors)

**Market:** SPY / S&P 500 · **Timeframe:** Daily · **Style:** Pattern mean reversion · **Evidence:** Grade A (Connors & Alvarez, *Short Term Trading Strategies That Work*, 2008)

| Win rate | Avg gain/trade | Profit factor | Trades | Hold |
|---|---|---|---|---|
| ~80%+ (published) | ~0.6–0.8% | ~2 | ~100+ over decades | 3–7 days |

**Concept & edge.** A simple two-condition pattern: price above the 200-day SMA, and a close at a 7-day low. Buying 7-day lows in an uptrend and exiting at 7-day highs captured the index's bid with a very high win rate in the original published tests.

**Setup.** 200-day SMA; 7-day highest high / lowest low.

**Entry rules.** (1) Close above 200 SMA. (2) Today closes at the lowest close of the last 7 days. (3) Buy at close.

**Exit rules.** Sell at close when price closes at a 7-day high.

**Risk management.** No stop in the original (signal exit only); position-size for a 2–3% adverse move. Adding a stop historically reduced performance — document this trade-off in your own test.

**Backtest evidence.** Published in 2008 on S&P 500 data: win rates around 80% with average gains near 0.7% per trade over hundreds of historical occurrences, materially better than random-entry baselines. The pattern is a close cousin of RSI(2)/IBS and shares their regime dependence.

**Works / fails.** Works on equity indices in structural uptrends; the "7" generalizes (5–10 day lookbacks all work, showing robustness). Fails in bear regimes — the 200-SMA filter is load-bearing.

**Backtesting notes.** Test lookbacks 5–10 to confirm the plateau. As with all on-close systems, compare close fills vs next-open fills. Expect long quiet stretches with zero signals.

**Variations.** Scale-in: buy ⅓ at 7-day low, ⅓ at 10-day low, ⅓ at 14-day low; exit at 5-day high for faster turnover; ETF-rotation version across SPY/QQQ/DIA/IWM.

---

# Part II — Opening Range & Session Breakout Strategies

The open is the highest-volume, highest-information window of any session. Toby Crabel's *Day Trading with Short-Term Price Patterns and Opening Range Breakout* (1990) first documented the edge statistically. Modern mega-backtests (1.1M+ trades) give us unusually solid numbers for this family.

## S14 · ORB — 5-Minute Opening Range Breakout

**Market:** US stocks & index futures (ES, NQ) · **Timeframe:** 1-min/5-min · **Style:** Momentum breakout · **Evidence:** Grade A (ORB Setups mega-backtest: 1,178,668 trades, 600+ symbols, 2025–26)

| Win rate | Expectancy | Best RR target | Trades/day | Edge source |
|---|---|---|---|---|
| 52.2–53.8% | +0.028R/trade | 0.5–1R | 1–3 | Trend-day capture |

**Concept & edge.** The first 5 minutes define a battle zone. A decisive break of that zone on volume signals that the opening price discovery resolved in one direction — and the first directional move predicts the session's trend ~58% of the time on the S&P 500 (Journal of Technical Analysis).

**Setup.** Mark the high/low of 09:30–09:35 ET. Volume average for confirmation; VWAP for bias.

**Entry rules.** Enter on a candle *close* beyond the 5-min range (not a wick), with breakout-bar volume above the 20-bar average. Optional: only in the direction of the overnight gap.

**Exit rules.** Target 1 = 50% of range height (highest documented win rate on ES: 72% with optimized settings). Target 2 = 100–200% of range. Stop at the opposite range edge; trail after 1R.

**Risk management.** Max 2 attempts per day. Skip if range > 0.55% of price (documented filter) — wide ranges have broken risk/reward. Risk 0.5–1% per attempt.

**Backtest evidence.** Across 591 symbols: 5-min ORB average win rate 52.2–53.8% (highest of all ORB timeframes) with +0.028R expectancy. An optimized ES variant (50% range target, 0.55% max range) returned 108% in 6 months with 72.17% WR and PF 1.62. NQ longs-only variant: 114 trades, 74.56% WR, PF 2.51, ~12% DD.

**Works / fails.** Works on high-relative-volume names and index futures on catalyst days. Fails on choppy, narrow-range days and low-float manipulation. Slippage at the open is the #1 killer — see S18's slippage table.

**Backtesting notes.** You need 1-minute data with realistic volume. Model fills at range edge + 1–2 ticks slippage. Test target/stop combinations systematically: target choice swings results by 30 percentage points.

**Variations.** Retest entry (wait for pullback to range edge); half-size first entry, add on 15-min confirmation; longs-only in bull regimes.

---

## S15 · ORB — 15-Minute Opening Range Breakout

**Market:** Stocks, ES/NQ futures, forex session opens · **Timeframe:** 5-min execution · **Style:** Momentum breakout · **Evidence:** Grade A (ORB Setups, 605 symbols; TradeAlgo 10-yr S&P study)

| Win rate | Expectancy | Avg RR | Signal quality | Best use |
|---|---|---|---|---|
| 46–56% | +0.004R to +0.35R | 1.8:1 | Balanced | All-round default |

**Concept & edge.** The 15-minute range is the professional default: long enough to filter opening noise, early enough to catch the morning leg. The mega-backtest shows it has the lowest raw win rate of the three classic ORBs — but the *highest expectancy per trade* when paired with full-range targets, because breakouts after 15 minutes of balance tend to travel further.

**Setup.** High/low of 09:30–09:45 ET; VWAP; relative volume vs the same time yesterday.

**Entry rules.** Close beyond the range on ≥1.5× average volume; bias long if price holds above VWAP, short below. Require the opening range to be a sensible fraction of 14-day ATR.

**Exit rules.** Stop at opposite range edge (or mid-range for tighter risk). Targets at 1R and 2R; let the final third trail for trend days — a few trend days per month pay for all the small losses.

**Risk management.** The 15-min ORB is a reward-to-risk strategy, not an accuracy strategy: expect to lose ~half your trades. Daily loss limit of 2 failed breakouts.

**Backtest evidence.** 6,748 symbol-records: average WR 52.5%, expectancy +0.004R raw — but the full-target configuration earned the highest per-trade EV in the 1.17M-trade study despite only 46% WR. Ten-year S&P data shows 56% WR at 1.8:1 average RR with proper filters.

**Works / fails.** Works on stocks with catalysts (earnings, upgrades) and trending index days. Fails in low-volatility balance and on Fed-day mornings before the announcement.

**Backtesting notes.** Segment results by relative volume quintile and gap size — the edge concentrates in the top quintiles. Compare stop-at-edge vs stop-at-midpoint: midpoint stops lift WR but cut RR.

**Variations.** Enter on the first pullback after breakout; "ORB + relative strength vs SPY" filter (trade only the day's strongest/weakest names); apply to London open on GBP pairs.

---

## S16 · ORB — 30-Minute Opening Range Breakout

**Market:** Index futures, large-cap stocks · **Timeframe:** 5-min/15-min execution · **Style:** Momentum breakout · **Evidence:** Grade A (ORB Setups, 608 symbols; OptionAlpha 0DTE backtests)

| Win rate | Expectancy | Signal count | Character | Best use |
|---|---|---|---|---|
| 49.4–52.9% | +0.019R | Fewest/day | Highest conviction | Trend days |

**Concept & edge.** Thirty minutes of balance compresses more energy; breaks of the 30-min range are fewer but cleaner, and they shine on genuine trend days. This is the patient trader's ORB: one decision by 10:00 ET, then manage.

**Setup.** High/low of 09:30–10:00 ET; VWAP; daily ATR context.

**Entry rules.** Close beyond the 30-min range with volume expansion. Strong filter: trade only in the direction of the higher-timeframe trend (above/below 20-day SMA).

**Exit rules.** Stop at the opposite edge. Scale out at 1R and 2R; trail the remainder below 15-min swing lows. Flat by 15:45 ET.

**Risk management.** The wider range means wider stops — size down accordingly so risk stays at 0.5–1%. If the 30-min range is > 40% of daily ATR, the move is likely exhausted: skip.

**Backtest evidence.** 6,982 symbol-records: average WR 52.9% (highest of the three ORBs), +0.019R expectancy. Related 60-min ORB variant on SPX 0DTE spreads: 89.4% WR, PF 1.44 (options structure, high-WR/low-RR profile).

**Works / fails.** Works on macro-driven trend days and heavy-news mornings. Fails in summer chop and quad-witching weirdness; produces nothing on quiet days (that's a feature).

**Backtesting notes.** Test exit-time sensitivity — the edge should be robust to exiting at 12:00 vs 15:30. If it isn't, you've curve-fit. Compare longs vs shorts separately; short ORBs are historically weaker on indices.

**Variations.** 60-min range for maximum conviction; two-stage entry (half at break, half at retest); pair with 0DTE iron structures for defined-risk versions.

---

## S17 · ORB with Daily Trend Filter (NQ Variant)

**Market:** Nasdaq futures (NQ/MNQ) · **Timeframe:** 1-min signal + daily filter · **Style:** Filtered breakout · **Evidence:** Grade A (QuantifiedStrategies live-traded strategy, NQ)

| Win rate | Avg gain/trade | Profit factor | Trades | Structure |
|---|---|---|---|---|
| 65% | 0.27% | 2.0 | 198 | 1-min ORB + 1 daily filter |

**Concept & edge.** Raw intraday ORB on index futures is barely profitable (best case ~0.04%/trade in unfiltered tests — not tradeable after costs). Adding a single daily-bar filter (trend/mean-reversion context) transformed the same breakout into a 65%-win-rate, PF-2.0 system. The lesson generalizes: intraday signals need daily context.

**Setup.** 1-minute bars for the opening range; one daily filter (e.g., only long after an oversold daily reading, or only in the direction of the 20-day trend).

**Entry rules.** Define the opening range over the first n minutes; buy the breakout above it only when the daily filter agrees. One trade per day.

**Exit rules.** Exit at the daily session close (15:00 Chicago) — time exit, no intraday stop in the published version. Live traders add a stop at the range low.

**Risk management.** One trade/day keeps commission drag minimal. Risk max 1% per day; consider the micro (MNQ) for accounts under $25k.

**Backtest evidence.** NQ, 198 trades: 65% win rate, 0.27% average gain per trade, profit factor 2.0 — traded live by the publisher. Unfiltered baseline: ~0.04%/trade, sub-50% win rate (not viable).

**Works / fails.** Works on volatile index futures (NQ > ES) in trending years. Fails in mean-reverting chop regimes and whenever the daily filter and intraday action conflict persistently.

**Backtesting notes.** The filter is proprietary in the source; test your own daily filters systematically (RSI(2) < 10, above/below 20-SMA, yesterday's IBS). Measure how each filter changes frequency and expectancy — you want a filter that cuts trades by half and doubles expectancy.

**Variations.** Short side with its own daily filter (weaker historically); apply the same structure to RTY or YM; exit half at 1R, half at close.

---

## S18 · DAX Opening Range Breakout (14-Year Study)

**Market:** DAX-40 index (FDAX/CFD) · **Timeframe:** H1 range definition · **Style:** Session breakout · **Evidence:** Grade A (FXVPS 14-year study, 2,199–2,899 trades, 2011–2025)

| Win rate | Profit factor | Total | Max DD | Sharpe |
|---|---|---|---|---|
| 49.4% (H1) | 1.25 | +206R | −21.4R | 1.46 |

**Concept & edge.** The DAX cash open (09:00 CET) concentrates European institutional flow. A break of the pre-open range, targeted at 2R with the stop one range-width away, compounded steadily for 14 years — positive in 9 of 14 years, worst year under −10R. This is one of the most honestly reported ORB studies available.

**Setup.** Overnight/pre-open range; H1 (60-min) opening range performed best; realistic spread included.

**Entry rules.** Resting stop orders at the range edges; first break triggers entry. Stop at the opposite edge; target at 2 range-widths.

**Exit rules.** Time-exit flexibility is documented: flattening anywhere from 11:00 to the 17:00 cash close keeps PF in a tight 1.20–1.27 band — holding to the close captures more (+243R total). Every weekday profitable; Tuesday/Thursday strongest (PF 1.35/1.39).

**Risk management.** *Execution is the strategy.* Slippage sensitivity is published: +1 pt slippage → PF 1.20; +3 pts → M15 version goes negative. Use a low-latency VPS near the exchange, and stop orders (not market orders after the fact).

**Backtest evidence.** H1: 2,199 trades, 49.4% WR, PF 1.25, +206R, Sharpe 1.46. M15: 2,899 trades, PF 1.11 — viable but fragile to slippage. Expectancy ~0.1R/trade: thin but extremely consistent.

**Works / fails.** Works because it's robust across exit times and weekdays (anti-curve-fit shape). Fails with retail-grade latency; the edge is ~0.1R and costs can eat all of it.

**Backtesting notes.** Model spread + slippage as the *primary* variable. Run the slippage stress table yourself. If your backtest can't model open-auction fills, assume 2 pts.

**Variations.** Trade only Tue/Thu (PF 1.35–1.39); half target at 1R + runner; apply the identical structure to the EuroStoxx 50 open.

---

## S19 · London Breakout (Asian Range Break)

**Market:** GBP/USD, GBP/JPY, EUR/USD · **Timeframe:** M15–H1 · **Style:** Session breakout · **Evidence:** Grade B (multiple independent 300+ trade backtests; typical WR 48–60%, PF 1.3–1.74)

| Win rate | Profit factor | Typical RR | Max DD | Monthly target |
|---|---|---|---|---|
| 48–60% | 1.3–1.74 | 1.5:1 | 15–20% | 2–5% (realistic) |

**Concept & edge.** The Asian session builds a tight range; London's liquidity arrival (08:00 London time) breaks it with genuine directional intent. You're trading the day's first institutional repricing.

**Setup.** Mark the Asian range (roughly 00:00–07:00 London / 02:00–07:00 UTC depending on convention; one academic EUR/USD study found the 05:00–07:00 GMT window optimal).

**Entry rules.** Enter on a close beyond the Asian range, or place stop orders 3–5 pips beyond both edges (OCO). Trade only if the range is < ~50 pips for GBP pairs (tight range = stored energy). One trade per day.

**Exit rules.** Stop at the opposite side of the range. Target 1.5× the range height (documented optimum in independent tests). Flat by the NY lunch.

**Risk management.** Skip bank holidays, skip days when the required stop exceeds 50 pips, avoid NFP/CPI mornings unless news trading is your intent. Risk 0.5–1%.

**Backtest evidence.** GBP/USD monthly study: 19 trades, 52.6% WR, PF 1.74, +152 pips. 300+ trade GBP/JPY tests: profitable at 1.5 RR with range-low stops. Academic EUR/USD study (2015–2017): best window 48.62% WR, TP:SL 50:35 optimal. QuantifiedStrategies' EUR/USD test warns: without filters the raw version is *not* consistently profitable — GBP pairs are the better vehicle.

**Works / fails.** Works on GBP pairs (higher beta to London flows) in normal volatility. Fails on EUR/CHF-type sleepy pairs, holiday-thinned sessions, and when the Asian range is already huge.

**Backtesting notes.** Broker server time vs UTC vs London time (and DST!) is the #1 implementation bug — nail the session definitions. Use true tick/M1 data for breakout levels.

**Variations.** False-breakout reversal (fade the first break if it fails within 3 bars); trade the *second* breakout only; London-NY overlap continuation entry.

---

## S20 · Asian Session Range Fade

**Market:** EUR/USD, USD/JPY, AUD/USD · **Timeframe:** M5–M15, Asian session · **Style:** Range scalping · **Evidence:** Grade B (practitioner-consensus ranges; low-volatility session statistics)

| Win rate | Typical RR | Profit factor | Best pairs | Session |
|---|---|---|---|---|
| 65–75% | 0.8:1 to 1:1 | 1.3–1.5 | EUR/USD, AUD/USD | 00:00–06:00 UTC |

**Concept & edge.** The mirror image of S19: outside London/NY, major pairs mean-revert hard. Asian-session EUR/USD respects the day's developing range ~70% of the time in quiet regimes — fade the edges, don't break them.

**Setup.** M15 chart, Asian session only. Bollinger Bands (20, 2) or the developing session high/low; RSI(14) for stretch confirmation; economic calendar flat.

**Entry rules.** Short at session high + RSI > 70 with a rejection wick; long at session low + RSI < 30. Only when overnight news flow is quiet.

**Exit rules.** Target the range midline or opposite edge (partial at midline). Stop 1× ATR(14) beyond the range edge. All flat before 06:30 UTC — never hold into the London open.

**Risk management.** The fatal trade is holding a range fade into the London breakout. Hard time-stop at 06:30 UTC regardless of P&L. Risk 0.5% per fade; max 2 per session.

**Backtest evidence.** Practitioner consensus for disciplined Asian range systems: 65–75% win rate at sub-1:1 RR — profitable because of accuracy, not asymmetry. Session statistics consistently show EUR/USD Asian ranges compressing to 40–60% of the daily range.

**Works / fails.** Works in quiet macro weeks on low-beta pairs. Fails during Asian-hours surprises (PBoC, BoJ, RBA), thin holiday tape, and trending macro regimes.

**Backtesting notes.** Test by day of week (Sunday-open and Friday-Asia sessions behave differently). Model the wider Asian spreads honestly — on some brokers they're 2–3× London spreads and kill the math.

**Variations.** Grid-less version with single entries only (avoid martingale grids — see Appendix warning); JPY-pair version timed around Tokyo fix (00:55 GMT); fade only the *second* touch of the range.

---

## S21 · New York Open Breakout (Equities)

**Market:** US large-caps with catalysts · **Timeframe:** M1–M5 · **Style:** Opening momentum · **Evidence:** Grade B (practitioner data; FINRA volume statistics)

| Win rate | Typical RR | Hold time | Volume share | Best vehicle |
|---|---|---|---|---|
| 45–60% | 1.5–2:1 | 15–90 min | 35% of day in first 30 min | High-RVOL gappers |

**Concept & edge.** FINRA data: ~35% of daily volume trades in the first 30 minutes, ~50% in the first hour. That concentration means institutional conviction expresses itself early — and stocks gapping on real catalysts with high relative volume continue in the gap direction more often than random.

**Setup.** Pre-market scanner: gap > 2%, relative volume > 3×, identifiable catalyst (earnings, guidance, upgrade). Mark the first 5-min range after the bell.

**Entry rules.** Enter on the break of the 5-min high in the gap direction, only if the stock holds above VWAP for longs. No entry if the first 5 minutes already retraced > 50% of the gap.

**Exit rules.** Stop below the 5-min low (longs). Targets: measured move = gap size projected from breakout, or trail below 1-min higher lows. Flat by 11:00 ET — the edge is a morning phenomenon.

**Risk management.** Position size from stop distance, max 1% risk. Wide spreads and halts on small caps make large-caps safer. One position at a time until consistently profitable.

**Backtest evidence.** Practitioner statistics for catalyst + RVOL-filtered opening drives: 45–60% win rate at 1.5–2:1 RR. The predictive power of the first 30 minutes for the session direction (~58–63% with catalysts) is documented in the intraday-momentum academic literature (see S27).

**Works / fails.** Works on earnings-season large/mid caps. Fails on low-float pumps, no-news drifters, and macro-shock mornings when everything correlates to the index.

**Backtesting notes.** Survivorship bias is rampant in gap-scanner backtests — your universe must include delisted/CRSP-complete data or results are fantasy. Model opening spreads (often 3–10× midday).

**Variations.** Gap-and-go vs gap-fill classification by first-15-min VWAP behavior; second-day continuation plays; short-side exhaustion version on parabolic small caps (advanced).

---

## S22 · London–NY Overlap Momentum

**Market:** EUR/USD, GBP/USD, gold · **Timeframe:** M15 · **Style:** Session momentum · **Evidence:** Grade B (session-volatility literature; practitioner consensus)

| Win rate | Typical RR | Window | Profit factor | Pairs |
|---|---|---|---|---|
| 50–58% | 1.5:1 | 13:00–16:00 UTC | 1.3–1.5 | EUR, GBP, XAU |

**Concept & edge.** The London–NY overlap (13:00–16:00 UTC) is the deepest liquidity pool on earth — both continents active, US data released at 13:30/14:00 UTC. Directional moves begun in the overlap statistically persist into the NY afternoon more than moves from any other window.

**Setup.** M15 chart. Mark the London-morning trend (08:00–13:00 UTC direction). VWAP or 20-EMA on M15 as the momentum guide.

**Entry rules.** Enter in the direction of the London-morning trend on the first M15 pullback to the 20-EMA/VWAP after 13:00 UTC, with the pullback holding above/below the session midpoint.

**Exit rules.** Stop beyond the pullback extreme. Target: 1.5R or the day's measured objective (London range projected). Flat by 16:30 UTC.

**Risk management.** US data releases at 13:30 UTC can whipsaw the first minutes — either wait 15 minutes after data or treat data days with the news-strategy family (Part VII). Risk 0.5–1%.

**Backtest evidence.** Session studies consistently show the overlap window carrying the day's highest volume and true range; practitioner backtests of trend-continuation entries in this window report ~50–58% win rates at ~1.5:1. Stochastic session tests (S44) independently found the early-NY-afternoon group the least negative of all sessions.

**Works / fails.** Works on macro-trending days and during rate-cycle repricing. Fails in summer doldrums, pre-holiday sessions, and when London morning was directionless (no trend to continue).

**Backtesting notes.** Define "London-morning trend" mechanically (e.g., 13:00 price vs 08:00 price, or 3 consecutive M30 higher closes) — subjective trend definitions can't be backtested.

**Variations.** Gold-specific version (XAU loves the overlap); reversal version for days when London morning was a fake-out; add US 10Y yield direction as confirmation.

---

## S23 · Initial Balance Breakout (Futures)

**Market:** ES, NQ, CL, GC futures · **Timeframe:** M5, first hour · **Style:** Auction-market breakout · **Evidence:** Grade B (Market Profile literature — Dalton; practitioner backtests)

| Win rate | Typical RR | Profile fit | Best days | Hold |
|---|---|---|---|---|
| 45–55% | 2:1+ | Trend days | High-conviction opens | To session close |

**Concept & edge.** The Initial Balance (IB) — the first hour's range — is the auction's opening negotiation. On days that will trend, price breaks the IB early and never looks back; IB extensions of 1.5–2× are the classic Market Profile targets. You're buying the market's own verdict on value.

**Setup.** First-hour high/low (09:30–10:30 ET). Compare IB width to 5-day average: narrow IB (< 70% of average) = breakout fuel.

**Entry rules.** Enter on acceptance beyond the IB: two consecutive 5-min closes outside, or a clean break + retest that holds. Direction-agnostic.

**Exit rules.** Target 1: 1× IB extension. Target 2: 2× IB. Stop back inside the IB (failure = auction rejected your direction). Flat at the close.

**Risk management.** Narrow-IB days are the trade; wide-IB days are already balanced — skip. Max one IB trade per day per direction. Risk 0.75–1%.

**Backtest evidence.** Market Profile practitioner statistics: narrow-IB breakout days reach the 1× extension roughly 60–70% of the time, and 2× on genuine trend days (~20–30% of sessions). Win rates of 45–55% at 2:1 average RR produce strong expectancy.

**Works / fails.** Works on range-extension days, macro trend weeks, post-news continuation. Fails on rotational days (double-distribution chops) — the IB-break + reclaim pattern is the classic failure.

**Backtesting notes.** "Acceptance" must be coded mechanically (e.g., 2 closes outside). Test the IB-width percentile filter: the edge should concentrate in the narrowest quartile of IBs.

**Variations.** IB midpoint as the session pivot (trade only one side of it); 30-min IB for faster signals; combine with overnight inventory direction (fade vs follow).

---

## S24 · The 10 O'Clock Reversal (NYSE)

**Market:** SPY, QQQ, large-caps · **Timeframe:** M5 · **Style:** Intraday reversal timing · **Evidence:** Grade B (long-standing practitioner pattern; consistent with intraday overreaction research)

| Win rate | Typical RR | Window | Reliability | Style |
|---|---|---|---|---|
| 55–65% | 1:1 to 1.5:1 | 09:55–10:15 ET | Moderate-high | Countertrend scalp |

**Concept & edge.** The opening 25–30 minutes overshoot: amateur orders execute at the open, professionals wait. Around 10:00 ET ("the 10 o'clock jiggle"), the initial move frequently reverses as opening inventory is absorbed — one of the oldest floor-trader timing patterns, consistent with academic evidence that opening returns partially reverse.

**Setup.** M5 chart, VWAP. Measure the opening move's size and speed from 09:30.

**Entry rules.** If the first 25–30 min produced a fast, extended move (> 0.5× daily ATR) away from VWAP: enter the reversal when an M5 countertrend structure forms (lower high after up-move / higher low after down-move), ideally with price stretched > 1.5σ from VWAP.

**Exit rules.** Target VWAP. Stop beyond the opening extreme. Time stop: if VWAP not reached by 11:00, flatten.

**Risk management.** Never fade a slow, grinding, high-volume trend — only fade *fast* extensions. On major news days the 10:00 reversal often fails; skip CPI/FOMC mornings. Risk 0.5–1%.

**Backtest evidence.** Practitioner win rates of 55–65% to the VWAP target; consistent with published research showing the first half-hour's move partially mean-reverts within the session. Note: the related *continuation* effect (S27) is the academic-documented side — the reversal edge is strongest against low-volume opening spikes.

**Works / fails.** Works on normal days with retail-driven opening spikes. Fails on genuine trend days — distinguishing these early (volume quality, breadth, gap context) is the skill.

**Backtesting notes.** Classify opening moves by speed (points per minute) and volume; the reversal edge should live in the fast/low-quality bucket. If it doesn't in your data, drop the strategy.

**Variations.** Only fade moves against the overnight gap direction; scale out 50% at half-way to VWAP; apply to the London open (10:00 local reversal) on FTSE/DAX.

---

## S25 · Opening Drive Continuation (Gap-and-Go)

**Market:** Mid/large-cap US stocks · **Timeframe:** M1–M5 · **Style:** Opening momentum continuation · **Evidence:** Grade B (practitioner momentum statistics; opening-drive research)

| Win rate | Typical RR | Hold | Filter | Failure mode |
|---|---|---|---|---|
| 50–60% | 2:1 | 30–120 min | RVOL > 3×, catalyst | Opening fake-out |

**Concept & edge.** When a stock gaps on a real catalyst and *keeps going* in the first minutes without pausing, you're watching institutions re-price in real time. The opening drive is the purest momentum signal of the day — enter with it, not against it.

**Setup.** Pre-market: gap > 3%, RVOL > 3×, clean catalyst, price holding near pre-market highs into the bell. M1/M5 execution chart.

**Entry rules.** Enter on the first M1/M5 consolidation breakout in the gap direction after the open (typically minutes 3–10), with the stock above VWAP (longs). Alternatively buy the break of the pre-market high.

**Exit rules.** Stop below the consolidation low. Targets: pre-market measured move, then trail below M5 higher lows. If the drive stalls and closes an M5 below VWAP — out immediately.

**Risk management.** Opening drives fail violently when they fail (the "fake-out flush" back through VWAP). Hard stops, no averaging. Max 1% risk; slippage on stops will exceed plan in fast tape — size for it.

**Backtest evidence.** Practitioner momentum-desk statistics: 50–60% win rate at ~2:1 on catalyst-filtered drives. Consistent with intraday momentum literature showing opening-period returns predict same-direction later returns (t-stat significant across decades of US data).

**Works / fails.** Works in earnings season and sympathy moves (sector momentum). Fails in choppy index days when individual catalysts get overwhelmed, and on low-float names where the drive is manufactured.

**Backtesting notes.** Hard to backtest honestly — pre-market data quality and opening fills are the challenge. Use tick or M1 data, model halts, and include delisted names.

**Variations.** Short-side parabolic fade *after* the drive tops (2-stage strategy); second-entry on the first VWAP pullback; sector-basket version (trade the ETF when 3+ components drive).

---

# Part III — Momentum & Trend Intraday Systems

Trend following has the opposite personality of mean reversion: low win rates (35–45%), large winners (2.5R+), and long flat stretches. Intraday versions compress this into hours. The published evidence says these systems work *if* you survive the whipsaws — regime filters (ADX, ATR percentile) are what separate viable systems from donation machines.

## S26 · 9/21 EMA Crossover Scalp

**Market:** Forex majors, NQ, crypto · **Timeframe:** M3–M5 · **Style:** Trend-following scalp · **Evidence:** Grade B (independent 161-trade backtest published on r/Daytrading, 2025)

| Win rate | Typical RR | Max losing streak | Best sessions | Style |
|---|---|---|---|---|
| 38–45% | 1.5–2:1 | 8 documented | London, NY overlap | Low-WR momentum |

**Concept & edge.** The fast 9-EMA crossing the 21-EMA on low timeframes captures micro-trend legs. The documented reality check: raw win rate is only 38–45% — profitability comes entirely from asymmetric RR and streak discipline. Anyone selling this as a "high win rate" system is lying.

**Setup.** 9-EMA and 21-EMA on M5; optional 200-EMA for directional bias.

**Entry rules.** Long: 9 crosses above 21, both above the 200-EMA, with the cross candle closing in its upper half. Enter on the first pullback to the 9-EMA after the cross (better RR than chasing the cross candle).

**Exit rules.** Stop below the pullback low (tight, ~0.5–1 ATR). Target 1.5–2R, or exit on the opposite cross. Trail with the 9-EMA on strong days.

**Risk management.** The documented 8-loss streak is the strategy's true price of admission — size so 10 consecutive losses cost < 10%. Stop trading after 3 losses in a session (chop regime).

**Backtest evidence.** Independent 161-trade test on 3/5-min charts: 38–45% win rate, max win streak 5, max losing streak 8; with 2:1 targets the equity curve was modestly positive but fragile to spread. Filtered variants (higher-timeframe trend + pullback entry) report 60–70% win rates at reduced frequency.

**Works / fails.** Works in trending sessions (post-news, macro days). Fails in ranges — EMA crosses are pure whipsaw generators when ADX < 20.

**Backtesting notes.** Test cross-at-close vs pullback entries separately. Include realistic spread: at 5-min forex scalping, spread is often 15–30% of the average winner — it can flip the sign of the whole system.

**Variations.** 8/21 on M15 (smoother); 5/13/21 ribbon (trade only when ribbon is fanned); add ADX > 25 filter.

---

## S27 · First Half-Hour Predicts the Last (Intraday Momentum)

**Market:** SPY / S&P 500 · **Timeframe:** 30-min bars · **Style:** Academic momentum timing · **Evidence:** Grade A (Gao, Han, Li, Zhou — *Intraday Momentum*, peer-reviewed; SSRN 2440866)

| Predictive R² | OOS R² | Stronger when | Horizon | Robustness |
|---|---|---|---|---|
| 1.6–2.6% | 1.7–2.5% | High vol, recessions, news days | First 30 min → last 30 min | Decades of data |

**Concept & edge.** The first half-hour's return significantly predicts the *last* half-hour's return — an academically validated intraday momentum effect. Predictability rises with volatility and volume, and combining the first half-hour with the penultimate half-hour lifts R² to 2.6–3.3%. This is among the most rigorous intraday edges ever published.

**Setup.** 30-min bars on SPY/ES. Record the 09:30–10:00 return. Note day type (news day, high-VIX regime).

**Entry rules.** ~15:00–15:30 ET: if the first half-hour was up (and the penultimate half-hour confirms), long into the close; if down, short/flat. Exit at the close (MOC).

**Exit rules.** Time exit at 16:00 ET. Stop: adverse move > 0.5× the day's average 30-min range.

**Risk management.** The edge per trade is small (basis points) — it's a high-frequency-friendly strategy, marginal for retail after costs. Consider it a *filter* for other end-of-day decisions if your costs are high.

**Backtest evidence.** In-sample R² 1.6% (first half-hour alone), 2.6% (combined with 12th half-hour), rising to 3.3% in high-volatility periods; OOS R² 1.7–2.5% — matching or exceeding typical *monthly* momentum predictability, at a daily horizon. Stronger in recessions and on macro-news days.

**Works / fails.** Works on index ETFs/futures; stronger on volatile and news days. Fails on dead days and when applied to individual small stocks (noise dominates).

**Backtesting notes.** Replicate the regression before building the trading rule — confirm the predictability exists in *your* sample period. Transaction costs decide retail viability.

**Variations.** Trade the full afternoon instead of the last 30 min; options version (long gamma into predicted trend); apply to sector ETFs for cross-sectional versions.

---

## S28 · Supertrend Intraday Trend Rider

**Market:** Indices, forex, crypto · **Timeframe:** M15–H1 (intraday), Daily/Weekly (swing) · **Style:** ATR trend following · **Evidence:** Grade A (QuantifiedStrategies 60-yr S&P test; Share.Market 200,000-trade Nifty study)

| Win rate | Avg win/loss | Max DD | Best params | Character |
|---|---|---|---|---|
| 40–43% (daily stocks), 68% (weekly index) | Win ≫ loss (25.5% vs −7.4% at mult 3) | ~25% | (10,3) classic; (3,3) aggressive | Sniper trend system |

**Concept & edge.** Supertrend = ATR-based trailing line: long while price holds above it, short below. The 200k-trade study destroyed the win-rate myth: *every* parameter set wins only 40–43% — the edge is that winners are 3–6× the size of losers. Raising the multiplier from 1 to 3 tripled average win size (8.5% → 25.5%).

**Setup.** Supertrend (10, 3) default; intraday (7, 3) or (10, 3) on M15–H1.

**Entry rules.** Enter on bar close crossing the Supertrend line, in the new direction. Filter: only take longs above the 200-EMA (cuts whipsaws).

**Exit rules.** Signal exit on opposite cross (this *is* the stop — volatility-adaptive). Optional partial at 2R.

**Risk management.** The wide-multiplier versions hold winners ~69 days on average (swing) — intraday versions hold hours. Either way, expect ~60% losing trades. If you can't stomach that psychologically, don't trade it.

**Backtest evidence.** 60-year weekly S&P test: 41 trades, 68% WR, 11.2% avg gain/trade, 24.6% max DD vs 56% buy-and-hold, risk-adjusted return 9.8% vs 6.9%. Nifty-500 daily study: WR stable 40–43% across all params; EV maximized at short period + high multiplier.

**Works / fails.** Works on trending instruments (commodities, indices in macro regimes, crypto trends). Fails in chop — the line gets sawn to pieces; ADX filter mandatory intraday.

**Backtesting notes.** Grid-test period 3–21 × multiplier 1–3 and demand plateau stability. The published insight worth verifying: multiplier matters more than period.

**Variations.** Triple-Supertrend confirmation (3 timeframes agree); use as trailing stop only for other entries; (3,3) aggressive config for momentum names.

---

## S29 · MACD Histogram Retracement (Trend Pullback)

**Market:** Forex majors · **Timeframe:** H1–H4 · **Style:** Trend pullback · **Evidence:** Grade A (algorithmic backtest with costs, published 2026 — CodeTradingCafe)

| Annual return | Sharpe | Costs included | Profile | Instruments |
|---|---|---|---|---|
| ~5.5% | ~1.45 | Yes (commissions) | Steady trend capture | Forex majors |

**Concept & edge.** MACD alone is a mediocre signal; MACD *as a retracement timer inside an EMA-defined trend* is a documented, cost-adjusted winner. You enter when the histogram recovers toward the trend direction after a pullback — buying dips with momentum confirmation.

**Setup.** EMA (e.g., 50/200) for trend direction; MACD (12, 26, 9) histogram.

**Entry rules.** Long: price above the trend EMA; histogram dips below zero (pullback) then ticks back up. Enter on the uptick bar's close. Short: mirror.

**Exit rules.** Stop below the pullback swing (1–1.5 ATR). Target 1.5–2R or exit when histogram crosses back against the trade. Time stop: 10–15 bars.

**Risk management.** 0.5–1% risk; the published Sharpe (1.45) is unusually high for a simple system precisely because costs were included — replicate that discipline.

**Backtest evidence.** Full algorithmic test on forex data *with commissions*: ~5.5% annual return, Sharpe ~1.45. Compare: naive MACD-signal-line crossovers typically show near-zero or negative expectancy after costs (documented in multiple TA-effectiveness studies) — the trend filter and pullback timing are the entire edge.

**Works / fails.** Works on trending forex pairs (GBP/JPY, EUR/USD in rate cycles). Fails in ranges (histogram oscillates uselessly) and on exotics with wide spreads.

**Backtesting notes.** Test EMA lengths 50/100/200 and histogram-uptick definitions (1-bar vs 2-bar). The strategy is a template: same structure works with RSI or Stochastic as the pullback timer (see S44 for the cautionary data on Stochastic).

**Variations.** Zero-line MACD cross in trend direction (fewer, cleaner signals); dual-timeframe (H4 trend, H1 entry); divergence add-on.

---

## S30 · ADX Regime Filter + Pullback Entries

**Market:** All liquid markets · **Timeframe:** M15–H1 · **Style:** Regime-gated trend trading · **Evidence:** Grade B (ADX research lineage — Wilder; regime-threshold studies)

| Win rate | Typical RR | Gate | Role | Expectancy |
|---|---|---|---|---|
| 45–55% (trend regime) | 1.5–2:1 | ADX > 25 + ATR > 60th percentile | Meta-strategy | +0.2 to +0.4R |

**Concept & edge.** The single highest-leverage improvement to any trend system: *only trade it when the market is provably trending.* ADX > 25 plus ATR above its 60th percentile defines the momentum regime; below that, switch to mean reversion or sit out. The regime, not the entry trick, decides who gets paid.

**Setup.** ADX(14), ATR(14) percentile rank (100-day lookback), 20-EMA, swing structure.

**Entry rules.** Regime check: ADX > 25 and rising, ATR in upper 40%. Long: pullback to the 20-EMA in a +DI > −DI market; enter on the resumption candle. Short: mirror.

**Exit rules.** Stop beyond the pullback swing. Target 1.5–2R or trail with the 20-EMA while ADX keeps rising. Exit everything when ADX rolls over below 20.

**Risk management.** 0.75–1% risk per trade in-regime; *zero* exposure out-of-regime. The discipline of not trading is the edge.

**Backtest evidence.** Regime-filtered momentum systems in the literature run 35–45% win rates at 2.5R+ average winners — positive expectancy; the same entries unfiltered degrade to coin-flips. Practitioner data on XAUUSD/US100/BTC confirms regime thresholds transfer across instruments (with funding/vol adjustments).

**Works / fails.** Works as an overlay on S26, S28, S29, S33–S35. Fails when ADX lags regime changes (V-reversals) — accept the lag or add a faster volatility measure.

**Backtesting notes.** This is a *framework*: implement it as a boolean gate in front of any entry signal and measure the delta in expectancy. That measurement habit is what makes you a strategy designer rather than a strategy collector.

**Variations.** Hurst exponent < 0.45 as the mean-reversion gate (the opposite switch); ADX slope rather than level; weekly-ADX bias for intraday entries.

---

## S31 · Donchian 20/10 Breakout (Modern Turtle)

**Market:** Commodities, forex, index futures, crypto · **Timeframe:** H4–Daily (intraday-adaptable H1) · **Style:** Channel breakout trend following · **Evidence:** Grade A (Curtis Faith, *Way of the Turtle*, 2007; futures tests 1996–2007)

| CAGR | Win rate | Variant uplift | Markets | Drawdowns |
|---|---|---|---|---|
| 29.4–57.2% | 35–45% | Time-exit variant nearly doubled CAGR | Currencies, commodities, Treasuries | Large (trend following) |

**Concept & edge.** Buy 20-period highs, exit on 10-period lows, only with the long-term trend (25-EMA vs 350-EMA filter). The Turtles turned this into $150M in 4 years; Faith's re-test on currencies/commodities/Treasuries produced 29.4% CAGR — and the 80-day *time-exit* variant 57.2%. The channel breakout remains the canonical trend edge in commodities.

**Setup.** Donchian channels (20 entry / 10 exit), 25 & 350 EMA filter, ATR(20) for sizing ("N").

**Entry rules.** Long: price breaks the 20-period upper channel AND 25-EMA > 350-EMA. Size positions so 1 ATR move = fixed % of equity (volatility targeting — the Turtles' real secret).

**Exit rules.** Exit on break of the 10-period opposite channel, or after a fixed time window (80 days swing; proportionally 60–80 bars intraday). Stop: 2× ATR from entry.

**Risk management.** Pyramiding: add ½ unit every ½ ATR in profit, max 4 units (original rules). Portfolio heat cap ~6–10% total risk.

**Backtest evidence.** Faith 1996–2007 futures portfolio: 29.4% CAGR (breakout exit), 57.2% CAGR (80-day time exit), with the EMA filter required for direction. Modern tests confirm: still works on commodities/currencies, weaker on stocks (stocks mean-revert; commodities trend).

**Works / fails.** Works in macro commodity trends (energy, metals, softs), crypto bull legs. Fails in multi-year chop; expect 35–45% win rate and gut-wrenching drawdowns between trends.

**Backtesting notes.** Test on a *portfolio* of futures, not one market — the edge is diversification across trend episodes. Include roll costs for futures realism.

**Variations.** 55/20 channels (Turtle System 2); Donchian basis-line pullback entries (gentler); intraday H1 version on gold and crude.

---

## S32 · Keltner Channel Breakout

**Market:** Futures, forex · **Timeframe:** M15–H1 · **Style:** Volatility-channel breakout · **Evidence:** Grade B (Chester Keltner lineage; Linda Raschke's documentation; practitioner backtests)

| Win rate | Typical RR | Filter | Best regime | Style |
|---|---|---|---|---|
| 40–50% | 1.5–2.5:1 | ADX or squeeze context | Post-compression | Momentum breakout |

**Concept & edge.** Keltner Channels (20-EMA ± 2× ATR) define "normal" volatility. A close outside the channel means current volatility exceeds normal — directional information, especially after compression. Raschke's documentation made it a futures-desk standard.

**Setup.** Keltner (20, 2×ATR(10)); Bollinger (20, 2) for the squeeze overlay; ADX(14).

**Entry rules.** Long: close above the upper Keltner with ADX rising through 20–25. Stronger: first break *after* a Bollinger-inside-Keltner squeeze (see S58). Enter at close or on a small pullback to the channel.

**Exit rules.** Initial stop at the 20-EMA (channel basis). Trail below the midline; final exit on close back inside the channel. Target alternative: 2–3× ATR.

**Risk management.** False breaks cluster in sideways tape — the squeeze/ADX context filter cuts signal count by ~half and roughly doubles per-trade expectancy in practitioner tests. Risk 0.75–1%.

**Backtest evidence.** Practitioner backtests on index/commodity futures: 40–50% win rates at 1.5–2.5:1 with the trend filter; raw unfiltered breaks are ~breakeven after costs. Channel exits adapt to volatility automatically — the structural reason these systems age better than fixed-point targets.

**Works / fails.** Works after volatility compression and in macro trends. Fails in high-ADX late-stage trends (buying exhaustion) and choppy balance.

**Backtesting notes.** Compare Keltner vs Donchian vs Bollinger breakout on identical data — knowing which channel your market respects is itself useful research. ATR period sensitivity: 10 vs 20 changes signal density a lot.

**Variations.** Countertrend Keltner fade (with ADX < 20 only — the mirror system); dual-channel (inner 1.5 ATR stop, outer 2.5 ATR entry); Raschke's "Holy Grail" ADX-pullback variant.

---

## S33 · VWAP First Pullback (Institutional Benchmark)

**Market:** Stocks, index futures · **Timeframe:** M1–M5 · **Style:** Trend pullback at VWAP · **Evidence:** Grade B (institutional execution literature; practitioner backtests)

| Win rate | Typical RR | Window | Best days | Style |
|---|---|---|---|---|
| 55–65% | 1.5–2:1 | 10:00–14:00 ET | Trend days | Pullback continuation |

**Concept & edge.** VWAP is the benchmark institutions are evaluated against: desks buying below VWAP show "good execution," so pullbacks to VWAP in trending stocks attract real institutional bids. That's a structural, incentive-based reason for the bounce — not just a line on a chart.

**Setup.** Session VWAP (anchored 09:30 ET). Confirm trend: stock above VWAP since ~10:00, higher highs/lows, RVOL > 2.

**Entry rules.** First (highest quality) or second pullback to VWAP in an established trend. Enter on the M1/M5 reversal candle off VWAP, or place a limit at VWAP + small buffer with confirmation.

**Exit rules.** Stop below the pullback low (or VWAP − 0.5× ATR(5min)). Target: prior high, then trail; ambitious target = measured move of the morning leg. Flat by 15:30.

**Risk management.** Third and later VWAP touches fail increasingly often — the edge decays per touch. Skip if the morning move was vertical (climactic). Risk 0.5–1%.

**Backtest evidence.** Practitioner backtests of first-pullback entries on trending large-caps: 55–65% win rate to the prior-high target. Consistent with VWAP's documented role as the dominant institutional execution benchmark (execution-algo literature).

**Works / fails.** Works on trend days with institutional sponsorship (earnings, sector moves). Fails on rotation days — VWAP becomes a magnet, not a springboard; and in the last hour when VWAP loses meaning.

**Backtesting notes.** Code "trend day" mechanically before testing (e.g., price > VWAP for 80% of bars since 10:00). Measure bounce quality by touch number — publish your own decay curve.

**Variations.** VWAP ± 1σ band entries (deeper pullbacks); anchored VWAP from earnings date/week; short-side version below VWAP.

---

## S34 · VWAP Bands Mean Reversion

**Market:** ES, SPY, QQQ · **Timeframe:** M5 · **Style:** Statistical band fade · **Evidence:** Grade B (practitioner statistics; VWAP standard-deviation band literature)

| Win rate | Typical RR | Target | Regime | Edge type |
|---|---|---|---|---|
| 60–70% | 0.8–1.2:1 | VWAP | Range/rotation days | Accuracy edge |

**Concept & edge.** VWAP ± 1σ/2σ bands (standard deviation of price around VWAP) act like intraday Bollinger Bands around the session's true mean. On non-trend days, the 2σ band is faded successfully roughly 60–70% of the time back to VWAP.

**Setup.** Session VWAP with 1σ and 2σ bands. Confirm rotation day: price crossing VWAP repeatedly, no directional breadth.

**Entry rules.** Fade touches of the 2σ band: short at +2σ (longs at −2σ) with an M5 rejection candle. Only on days classified as rotational by 11:00.

**Exit rules.** Target VWAP (partial at 1σ). Stop: 0.5× ATR beyond the band, or immediately if an M5 closes beyond 2.5σ (trend day warning).

**Risk management.** The mirror-image risk of S33: on trend days this strategy donates. The day-type classifier is the whole game. Risk 0.5%; stop trading after 2 losses (your day-type read is wrong).

**Backtest evidence.** Practitioner statistics: 60–70% win rate to VWAP on rotation days; combined with a trend-day filter, profit factors of 1.3–1.6 are typical. The overnight-vs-intraday return literature supports indices' intraday mean-reverting character.

**Works / fails.** Works on quiet, balanced days (the majority of sessions). Fails on trend days, news days, and expiry Fridays with directional flow.

**Backtesting notes.** Day-type classification must be *causal* (known by entry time, not in hindsight). Test classifiers: opening-range width, first-hour VWAP slope, NYSE TICK/breadth thresholds.

**Variations.** Countertrend only against overnight direction; scale entries at 2σ and 2.5σ with tight aggregate stop; pair with S24 (10:00 reversal) as the entry timer.

---

## S35 · Heikin Ashi Trend Scalp

**Market:** Stocks, forex, BTC · **Timeframe:** M5–M15 · **Style:** Smoothed-trend following · **Evidence:** Grade B (TradeAlgo 12-yr, 200-stock backtest: 59% WR, PF 2.34 with MA filter; Tradinformed EUR/USD 2000–2014 study)

| Win rate | Profit factor | Filter | Lag cost | Best use |
|---|---|---|---|---|
| 59% (documented, filtered) | 2.34 | MA trend filter | Entries lag ~1 bar | Noise reduction |

**Concept & edge.** Heikin Ashi candles average OHLC, erasing noise so trend legs become visually and mechanically obvious (long same-color runs with one-sided wicks). The documented edge requires a moving-average filter — color changes alone are worthless; HA + trend filter is a genuine noise-reduction technology.

**Setup.** Heikin Ashi candles, 50-EMA (or 200-EMA) filter. Note: HA prices are synthetic — execute and set stops from *real* prices.

**Entry rules.** Long: price above the 50-EMA; enter after 2 consecutive green HA candles with no lower wick (strong momentum signature), on the third candle's open. Short: mirror.

**Exit rules.** Exit on the first opposite-color HA candle, or when an HA candle prints a wick against the trend after a long run. Hard stop on *real* price: below the entry-pattern low.

**Risk management.** HA lag costs you the first part of every move — accept it as the fee for noise filtering. Risk 0.5–1%; the smooth equity comes from fewer bad trades, not tighter stops.

**Backtest evidence.** TradeAlgo 12-year, 200-stock test: 59% win rate, PF 2.34 (HA + MA filter). Tradinformed's EUR/USD 4H study (2000–2014, MACD confirmation): profitable system. Unfiltered color-change systems: ~random.

**Works / fails.** Works in trending markets and noisy instruments where candle-reading is hard (crypto, small caps). Fails in ranges (HA turns into a paint mixer) and for exact-level work (HA doesn't show real prices).

**Backtesting notes.** Critical implementation detail: compute signals on HA candles but execute on real OHLC at the *same bar* — backtests that execute at HA close prices are fabricating fills.

**Variations.** HA + Chandelier exit (documented BTC scalp: 40.8% WR, PF 1.05 raw — needs the trend filter); HA swing-points as trailing stops; monthly HA for regime (S&P 1960+ test: 52% WR, DD cut from 52% to 29%).

---

## S36 · EMA Ribbon Fan (5/8/13)

**Market:** Forex, crypto, NQ · **Timeframe:** M5–M15 · **Style:** Trend-alignment momentum · **Evidence:** Grade B (Guppy-lineage practitioner backtests)

| Win rate | Typical RR | Signal | Failure | Style |
|---|---|---|---|---|
| 45–55% | 1.5–2:1 | Ribbon fans + pullback | Chop compression | Visual trend system |

**Concept & edge.** Three EMAs (5, 8, 13 — Fibonacci set) act as one object: when they fan out in order (5 > 8 > 13, separated, all sloping), a micro-trend is confirmed by alignment, not by any single cross. Entries on pullbacks into the ribbon buy confirmed momentum at a discount.

**Setup.** EMAs 5/8/13 on M5–M15; ribbon separation as trend-strength gauge.

**Entry rules.** Long: ribbon fully fanned upward; price pulls back into the 8–13 zone and prints a rejection candle closing back above the 5-EMA. Enter on that close. Short: mirror.

**Exit rules.** Stop below the 13-EMA (ribbon break = thesis dead). Target 1.5–2R or trail along the 5-EMA. Exit early if the ribbon compresses flat.

**Risk management.** The ribbon compresses and tangles in ranges — every tangle is a no-trade zone, which is the filter doing its job. Risk 0.75% per trade; max 3 trades per session.

**Backtest evidence.** Guppy-style multiple-MA systems in practitioner testing: 45–55% win rates at 1.5–2:1 with fan + pullback entries; raw cross systems without the pullback entry degrade toward breakeven after costs. Ribbon systems' real value is trade *prevention*.

**Works / fails.** Works in sustained intraday trends (news-driven, macro sessions). Fails in balance — but fails *visibly*, giving you the discipline signal to stand down.

**Backtesting notes.** Quantify "fanned" (e.g., min gap between EMAs as % of ATR) so it's testable. Compare entry-at-fan vs entry-at-pullback: the pullback entry should show better RR at slightly lower win rate.

**Variations.** Full Guppy (6 short + 6 long EMAs); ribbon + RSI(14) > 50 momentum gate; 8/21/34 set for H1 swing version.

---

## S37 · Consecutive-Closes Momentum (3-Bar Drive)

**Market:** Indices, forex, crypto · **Timeframe:** M15–H1 · **Style:** Momentum persistence · **Evidence:** Grade B (short-term momentum literature; practitioner tests)

| Win rate | Typical RR | Best context | Hold | Failure |
|---|---|---|---|---|
| 50–58% | 1.2–1.8:1 | Post-breakout, low retrace | 3–10 bars | Late entry on exhaustion |

**Concept & edge.** Three consecutive same-direction closes with expanding bodies signal initiative participation, not drift. Short-term price momentum (hours scale) is one of the more persistent documented anomalies across asset classes; the 3-bar drive is its simplest tradable form.

**Setup.** M15–H1 bars; ATR(14) for body-size context; optional volume confirmation.

**Entry rules.** Long: 3 consecutive closes higher, each body > 0.5× ATR, total retrace between bars < 38%, preferably breaking a level (session high, range top). Enter on bar 3's close or a shallow limit pullback. Short: mirror.

**Exit rules.** Stop below bar 1's low (structure) — wide; or below bar 3's midpoint (aggressive). Target: 1.5–2R; momentum typically delivers the move within 3–10 bars or not at all (time stop).

**Risk management.** Never enter a 3-bar drive that is the *3rd consecutive drive* of the session (exhaustion). Check higher-timeframe location: drives into daily resistance fail. Risk 0.75%.

**Backtest evidence.** Short-horizon momentum persistence is documented across equities, FX and crypto in the time-series momentum literature (hours-to-days scale). Practitioner tests of 3-close rules: 50–58% win rate at 1.2–1.8:1, with volume-confirmed drives outperforming.

**Works / fails.** Works post-compression and on breakout days. Fails as a standalone in ranges and on low-liquidity instruments where 3 bars is noise.

**Backtesting notes.** Test body-size thresholds (0.3/0.5/0.7 ATR) and confirm the edge concentrates in post-compression contexts (measure prior 20-bar range percentile).

**Variations.** 2-bar drive (earlier, noisier); drive + VWAP location filter; opposite system: fade 3-bar drives that are 2σ extended from the 20-EMA (mean-reversion mirror).

---

# Part IV — Scalping Systems

True scalping lives or dies on costs: spread, slippage, latency. Every strategy here is viable *only* with tight spreads and honest execution math. The published evidence is blunt — several famous scalping systems fail rigorous testing (we include one as a warning), which is exactly why you should backtest before believing.

## S38 · 5-Minute EMA Scalping (8/21 + RSI)

**Market:** Forex majors · **Timeframe:** M5 (M1 for timing) · **Style:** Crossover scalping · **Evidence:** Grade B (documented 456-trade test: 65% WR, PF 1.85; practitioner targets 60–70% WR)

| Win rate | Target/stop | Trades/session | Spread ceiling | Monthly goal |
|---|---|---|---|---|
| 60–65% (65% documented) | 10–15 pips / 8–10 pips | 3–8 | < 2 pips | 8–12% (optimistic ceiling) |

**Concept & edge.** Fast EMA crosses during high-liquidity windows catch 10–15 pip micro-moves repeatedly. The edge is frequency × discipline, not any single trade. This is the archetypal "job-like" scalping system.

**Setup.** EMA(8), EMA(21), RSI(14), ATR(14) on M5. Trade only London (08:00–11:00 local) and early NY.

**Entry rules.** Long: 8-EMA crosses above 21-EMA with RSI > 50; enter on the first M1 pullback tap of the 8-EMA. Short: mirror with RSI < 50.

**Exit rules.** Fixed target 10–15 pips; stop 8–10 pips (adjust by ATR: stop ≈ 0.8× ATR(M5)). Time stop: 45 minutes. All flat before major news.

**Risk management.** The documented kill factors: overtrading (cap at 8 trades/session), spread widening (abort when spread > 2 pips), and news. Risk 0.5% per trade — scalping's high frequency makes variance arrive fast.

**Backtest evidence.** Documented 456-trade test: 65% win rate, PF 1.85. Practitioner progression data: beginners 55–60%, experienced scalpers 65–70% with 20–50 pips/day. Independent cost analyses warn: at 20 trades/day and 1.5-pip average spread, costs consume ~30 pips/day — the strategy must clear that hurdle first.

**Works / fails.** Works on EUR/USD, GBP/USD during liquid sessions. Fails during news, lunch hours, on exotics, and with market-maker brokers who widen spreads into volatility.

**Backtesting notes.** Your backtest is a lie unless spread is modeled per-timestamp (it's not constant). Use ECN tick data if possible. Compare M1-execution vs M5-signal fills.

**Variations.** RSI(7) for faster confirmation; EMA(5)/EMA(13) hyper version on M1 (costs decide); add session VWAP as bias filter.

---

## S39 · Tape & Order-Flow Scalp (Level 2)

**Market:** ES/NQ futures, liquid stocks · **Timeframe:** Tick/seconds · **Style:** Order-flow scalping · **Evidence:** Grade C (professional practice; sparse public statistics — validate yourself)

| Win rate | Typical RR | Hold | Requirement | Edge source |
|---|---|---|---|---|
| 55–65% (desk-typical) | 0.5–1:1 | Seconds–minutes | DOM + footprint data | Microstructure |

**Concept & edge.** At the shortest horizon, price is not "analysis" — it's the auction itself. Large resting orders act as magnets/walls; their *pulling* or *absorption* predicts the next ticks. This is how prop desks scalp: read the book, join the imbalance, exit at the first sign of absorption failure.

**Setup.** DOM (depth of market), footprint/delta chart, time & sales. Liquid instruments only (ES, NQ, top-20 stocks).

**Entry rules.** Long: repeated large-bid absorption at a level (sellers hit the bid, price doesn't fall) + delta flipping positive; enter at the level, stop 2–4 ticks below it. Short: mirror at the ask.

**Exit rules.** Target: the next visible liquidity pool (5–15 ticks). Scratch immediately if absorption fails (price ticks through the level). Time stop: 2–3 minutes.

**Risk management.** Ultra-tight stops mean high scratch frequency — normal. Risk 0.25–0.5% per trade; daily stop after 3 full losses. This style has the steepest learning curve in the book.

**Backtest evidence.** No rigorous public statistics exist — order-flow edges don't survive publication (they're capacity-limited and execution-dependent). Desk lore cites 55–65% scratch-adjusted win rates. Treat as a skill to build on sim for 3–6 months, not a backtested system.

**Works / fails.** Works in thick, two-sided markets during active hours. Fails in thin tape, during news spikes (book pulls), and with data feeds slower than the professionals' (you're the liquidity).

**Backtesting notes.** Nearly impossible to backtest without recorded book data (Bookmap/Jigsaw exports). Forward-test on simulator with recorded sessions and grade your reads.

**Variations.** Iceberg-detection entries; spoof-aware fading (advanced — and risky); iceberg + footprint confirmation combo.

---

## S40 · Bollinger Band 1-Minute Scalp

**Market:** EUR/USD, USD/JPY · **Timeframe:** M1 · **Style:** Band-fade scalping · **Evidence:** Grade C/B (widely traded; practitioner ranges 65–75% WR in ranges)

| Win rate | Target | Stop | Regime gate | Frequency |
|---|---|---|---|---|
| 65–75% (range sessions) | 5–8 pips / midline | 5–7 pips | Flat bands only | 10–20/session |

**Concept & edge.** On M1 in quiet sessions, price oscillates around micro-means; the bands touch-and-return pattern repeats dozens of times per session. Tiny edges, huge frequency — the purest cost-sensitivity test in trading.

**Setup.** Bollinger (20, 2) on M1; require flat band slope (bands parallel, price crossing the midline repeatedly). Session: late NY / early Asia (quiet).

**Entry rules.** Short on a touch/poke above the upper band with an M1 bearish rejection close; long at the lower band mirror. Only when bands are flat.

**Exit rules.** Target: band midline (safer) or opposite band. Stop: 1.5× the current band width beyond the band — a close beyond the band with momentum kills the trade thesis instantly.

**Risk management.** One momentum bar through the band wipes 3–4 wins. Hard rule: after any band-walk begins (2 consecutive closes outside), stop fading that side. Risk 0.3–0.5%/trade.

**Backtest evidence.** Practitioner ranges for disciplined flat-band scalping: 65–75% win rates at ~1:1, profit factors 1.2–1.5 *before* costs. Independent rigorous tests of naive band systems show the edge evaporates without the flat-regime gate and honest spread modeling.

**Works / fails.** Works in dead sessions on EUR/USD-class pairs. Fails at any volatility event, in trends, and with > 1-pip effective spread.

**Backtesting notes.** If your backtest uses constant spread, multiply it 2× and re-run — if the system dies, it was never alive. M1 systems need tick data for honest band-touch fills.

**Variations.** Keltner-midline confluence; RSI(7) stretch filter; fade only touches in the direction of the H1 trend (safer hybrid).

---

## S41 · Stochastic Scalping — A Documented Warning

**Market:** Forex majors · **Timeframe:** M15 · **Style:** Oscillator reversal · **Evidence:** Grade A — *negative* (FXGlory 1,207-trade controlled test, 2026)

| Win rate | Expectancy | Profit factor | Max DD | Verdict |
|---|---|---|---|---|
| 28.5% | −0.23R/trade | 0.50 | −280R | Fails as taught |

**Concept & edge.** This page is in the book deliberately: Stochastic crossover scalping is one of the most-taught retail systems, and a rigorous controlled test (6 pairs, 1,207 trades, realistic costs) shows it *loses* — 28.5% win rate, −0.23R expectancy, every setup family negative. Learning what doesn't work is half of strategy design.

**Setup.** The tested baseline: slow Stochastic (14,3,3), 100-SMA trend filter, structure stops, 1.3R targets, London/NY windows, 1.5-pip spread + 0.5-pip slippage per side.

**What was tested.** Five families: 50-line continuation, divergence reversal, MA-pullback re-entry, range crossover, trendline break. Best family (50-line continuation): still −0.20R. Divergence had the best PF: 0.57 — still losing.

**Why it fails.** (1) %K/%D crossovers lag by construction; (2) overbought ≠ sell — in trends, Stochastic pins at extremes while price runs; (3) 1.3R targets at 28–40% win rates can't survive 4 pips of round-trip cost.

**Salvage directions.** The data points to what might work: extreme settings (90/10), higher-timeframe regime gating, and using Stochastic as a *filter* (don't buy when > 80 in downtrends) rather than a trigger. Every salvage must be re-tested from zero.

**Backtest evidence.** Full baseline: 1,207 trades, 28.5% WR, −278R total, 21-trade worst losing streak. Session split: rollover/off-hours worst (−0.47R); London morning weakest liquid session (−0.25R).

**Works / fails.** Fails as a trigger, as documented. Works (unproven, test it) as a regime/filter input inside larger systems.

**Backtesting notes.** Use this study as your methodology template: fixed costs, setup families separated, per-pair and per-session breakdowns. That structure is how you autopsy any strategy.

**Variations.** StochRSI (claimed 78% WR in vendor tests — apply identical skepticism); Stochastic + S/R confluence-only entries; (5,3,3) on H1 swing instead of M15 scalp.

---

## S42 · Floor-Trader Pivot Scalping

**Market:** Futures, forex majors · **Timeframe:** M5–M15 · **Style:** Level-based intraday · **Evidence:** Grade B (floor-trading lineage; practitioner backtests)

| Win rate | Typical RR | Key levels | Behavior | Style |
|---|---|---|---|---|
| 55–65% (at levels) | 1–1.5:1 | P, S1/R1, S2/R2 | First-touch reactions | Level scalping |

**Concept & edge.** Classic pivots: P = (H+L+C)/3 from yesterday, with S1/S2/R1/R2 projected. These levels are watched by enough systematic traders that first touches produce real reactions — a self-fulfilling liquidity phenomenon. ~70% of the time price stays between S1 and R1 in normal sessions.

**Setup.** Daily pivots from yesterday's H/L/C. Mark P, S1, R1 (S2/R2 for volatile days).

**Entry rules.** Fade first touches: long at S1 with an M5 rejection candle, target P; short at R1 mirror. Trend-day alternative: buy the *acceptance* above R1 for a run at R2 (the opposite trade — day-type decides).

**Exit rules.** Fades: target the next level toward P; stop beyond the level by 0.5× ATR(M15). Breakout version: stop back below the level; target next level.

**Risk management.** Pivots are zones, not lines — allow a small buffer. The two playbooks (fade vs acceptance) are opposites; mixing them without a day-type rule is how pivot traders bleed. Risk 0.5–1%.

**Backtest evidence.** Practitioner statistics: first-touch reactions at S1/R1 succeed ~55–65% to the next level on normal days; pivot-range containment (S1–R1) holds on the large majority of sessions. Documented across futures desks since the pit era and still coded in modern algos.

**Works / fails.** Works on mean-reverting days in liquid markets. Fails on trend days (levels slice through) — combine with the S34 day-type classifier.

**Backtesting notes.** Define touch/reaction mechanically (touch within 0.2 ATR, rejection = close back through level). Test which level (P vs S1/R1 vs S2/R2) carries the reactions in your market.

**Variations.** Weekly pivots for swing context; pivot + prior-day high/low confluence only; Camarilla (S43) and CPR (S45) as alternative level families.

---

## S43 · Camarilla R3/S3 Reversal

**Market:** Forex, indices · **Timeframe:** M5–M15 · **Style:** Mean-reversion levels · **Evidence:** Grade B (Nick Stott's 1989 system; one published small-sample backtest: 37 trades, 91.9% WR — treat with skepticism)

| Win rate | Key levels | Published sample | Skepticism flag | Style |
|---|---|---|---|---|
| 65–75% (practitioner) | R3/S3 (fade), R4/S4 (break) | 91.89% WR, 37 trades | Tiny sample | Level reversion |

**Concept & edge.** Camarilla levels compress today's expected range using yesterday's close and range: H3 = C + range × 1.1/4, etc. The R3/S3 zone is where intraday moves statistically exhaust in ranging conditions; R4/S4 breaks signal trend days. It codifies the "revert or explode" decision into levels.

**Setup.** Compute H3/H4/L3/L4 from yesterday's H/L/C. Plot as zones.

**Entry rules.** Range playbook: fade L3/H3 with an M5 reversal pattern, stop beyond L4/H4, target the pivot/C. Trend playbook: a 15-min *close* beyond H4/L4 = trade the break toward 1.5× targets.

**Exit rules.** Fades: target midrange, stop beyond the 4-level (hard). Breaks: stop back inside the 3-level, target 1.5–2× the 3–4 distance.

**Risk management.** The 3-vs-4 level decision is the strategy. If price closes through the 4-level, your fade thesis is objectively dead — no hope-holds. Risk 0.5–1%.

**Backtest evidence.** One published trend-variant test reported 91.89% WR — but over only 37 trades, statistically meaningless without replication. Practitioner consensus for L3/H3 fades in ranges: 65–75% win rate with modest targets. Demand your own 300+ trade validation.

**Works / fails.** Works on normal-volatility days on forex majors and index CFDs. Fails on news days (4-levels break immediately) and on instruments with gappy sessions.

**Backtesting notes.** Test R3/S3 fade vs R4/S4 breakout *as one combined system* — the pair is designed to work together. Small-sample "90% win rate" claims should always trigger your replication instinct.

**Variations.** Trade only when H4–L4 distance < 60% of 20-day ATR (compression qualifier); combine with RSI(14) extreme at the level.

---

## S44 · Central Pivot Range (CPR) Breakout

**Market:** Indices (Nifty heritage), futures, forex · **Timeframe:** M5–M15 · **Style:** Pivot-zone trend/reversion · **Evidence:** Grade B (Indian index practitioner literature; widely back-tested by retail quants)

| Win rate | Signal | Key read | Style | Best regime |
|---|---|---|---|---|
| 50–60% | CPR width + position vs CPR | Narrow CPR = trend day | Zone-based | Both (switching) |

**Concept & edge.** CPR = (P, BC, TC) — the pivot plus its two satellites, forming a zone. Tomorrow's relationship to the zone classifies the day: narrow CPR + open outside it = trend day (trade breaks); wide CPR + open inside = range day (fade the edges). It's a mechanical day-type classifier built from one formula.

**Setup.** Daily CPR from yesterday's H/L/C; CPR width vs 20-day average width.

**Entry rules.** Trend playbook: narrow CPR (width < 50% of average); enter on the first pullback to the CPR edge after price opens and holds outside it. Range playbook: wide CPR; fade TC/BC edges toward P.

**Exit rules.** Trend: stop through the CPR, target 1.5–2R or trail swings. Range: target P, stop beyond the opposite edge. Flat by session end.

**Risk management.** Virgin CPR (levels untested for days) acts stronger than repeatedly-tested CPR — weight accordingly. Risk 0.5–1%; the narrow-CPR trend day is where the real money is, don't overtrade wide-CPR fades.

**Backtest evidence.** Practitioner backtests on index futures: CPR classifiers correctly tag trend vs range days often enough to produce 50–60% system win rates at 1.5:1+. The narrow-CPR-trend-day relationship is the most replicated finding.

**Works / fails.** Works on session-based markets (indices, futures). Fails on 24/7 crypto (no clean daily close — use UTC close) and on holiday-thinned sessions.

**Backtesting notes.** Test CPR-width percentiles against next-day range expansion — publish your own correlation before building entries on it. Combine with S34's VWAP day-type read for confirmation.

**Variations.** Weekly CPR for swing bias; "CPR + camarilla 3-level" confluence entries; open-drive + CPR-position combo.

---

## S45 · Tick-Chart Momentum Scalp

**Market:** ES/NQ futures, BTC · **Timeframe:** 233/610-tick charts · **Style:** Activity-based momentum · **Evidence:** Grade C (professional practice; validate yourself)

| Win rate | Typical RR | Why ticks | Best hours | Style |
|---|---|---|---|---|
| 50–60% | 1–1.5:1 | Bars = activity, not time | Open + overlap | Momentum scalp |

**Concept & edge.** Time-based bars lie during activity bursts: a 5-min candle hides 50 trades. Tick charts (one bar per N trades) expand exactly when participation expands — breakouts and compressions appear earlier and cleaner. Scalpers use them to see the same setups as time charts but with better timing.

**Setup.** 233-tick (fast) and 610-tick (context) charts; 20-EMA; volume per bar.

**Entry rules.** Same momentum logic as time charts — EMA pullback in a fanned tick-ribbon — but executed on tick bars for tighter, earlier entries during high-activity windows. Long: pullback to 20-EMA on the 610-tick, enter on 233-tick resumption.

**Exit rules.** Stop beyond the tick-chart swing (typically tighter than time-chart equivalents — the RR benefit). Target 1–1.5R or trail.

**Risk management.** Tick charts speed up during news — treat hyper-activity as a stop-trading signal, not an invitation. Risk 0.5%; the tighter stops tempt oversizing — resist it.

**Backtest evidence.** No rigorous public backtests exist (tick-bar data availability). Practitioner consensus: tick-based execution improves entry price by 1–3 ticks per trade vs time bars in fast markets — a huge cumulative edge at scalping frequency, impossible to prove in aggregate.

**Works / fails.** Works in liquid, active sessions. Fails in dead sessions (bars stall), and for traders without a disciplined system already (tick charts accelerate bad habits too).

**Backtesting notes.** You need trade/tick data, not OHLC. Reconstruct tick bars deterministically, then port a *known* time-based system (S26/S33) and measure entry-quality delta — that's the honest research path.

**Variations.** Range bars (fixed price movement per bar) as an alternative; volume bars; tick + footprint confirmation.

---

## S46 · Order-Book Imbalance Scalp

**Market:** BTC/ETH perpetuals, ES · **Timeframe:** Seconds–minutes · **Style:** Microstructure signal · **Evidence:** Grade C/B (market-microstructure academic literature supports short-horizon imbalance predictability)

| Win rate | Horizon | Signal | Data need | Style |
|---|---|---|---|---|
| 55–62% (studies, short horizon) | 10s–5min | Bid/ask size ratio extremes | L2/L3 feed | Quant scalp |

**Concept & edge.** Microstructure research consistently finds that order-book imbalance (bid depth vs ask depth) predicts price moves over the next seconds-to-minutes with small but statistically robust effect sizes. Heavy bid imbalance without price falling = hidden strength; the reverse for asks.

**Setup.** Real-time L2 data; compute imbalance = (bidVol − askVol)/(bidVol + askVol) over top 5–10 levels; smooth over 5–10 seconds.

**Entry rules.** Long: imbalance > +0.6 sustained 10+ seconds while price holds a level; enter, stop just below the level. Short: mirror at −0.6. Cancel the thesis if imbalance flips before price moves.

**Exit rules.** Target: 1–1.5× recent 1-min ATR; or exit when imbalance neutralizes. Time stop: 3–5 minutes. Scratch freely.

**Risk management.** This is a latency-sensitive strategy: your data feed and execution speed *are* the edge. Retail feeds see a delayed book — the imbalance you see may already be traded against. Risk 0.25–0.5%.

**Backtest evidence.** Academic microstructure studies (cont, de Larrard, and successors) document significant short-horizon predictive power of imbalance in equities and futures; effect sizes shrink with horizon and are partially captured by HFT. Crypto-perp practitioner tests report 55–62% short-horizon accuracy.

**Works / fails.** Works with colocated/premium data on liquid instruments. Fails with free/slow retail data (you're trading a stale picture) and around news (books evaporate).

**Backtesting notes.** Requires recorded L2 snapshots — most retail platforms don't store them. If you can't record book data, you can't honestly validate this strategy.

**Variations.** Imbalance + trade-flow delta combo; imbalance *reversion* (extreme imbalance resolving against the crowd); perp-funding-aware version.

---

## S47 · News-Spike Fade Scalp

**Market:** Forex majors, gold, indices · **Timeframe:** M1–M5 post-release · **Style:** Overreaction fade · **Evidence:** Grade B (event-study literature on announcement overreaction; practitioner ranges)

| Win rate | Window | Hold | Key skill | Risk level |
|---|---|---|---|---|
| 55–65% | 2–15 min after release | 5–30 min | Judging spike vs regime change | High |

**Concept & edge.** Macro releases trigger an instant algo overreaction; when the number is *within expectations' range*, the initial spike substantially retraces within minutes. You're selling panic liquidity to the algos that overpaid for it.

**Setup.** Economic calendar; expected vs actual figures; M1 chart; pre-release range marked.

**Entry rules.** Only fade when the release is a *non-surprise* (actual within consensus range) yet price spiked anyway. Enter the fade after the first M1 stall/reversal candle, 2–5 minutes post-release. Never fade a genuine surprise — those trend.

**Exit rules.** Target: 50–100% retracement of the spike. Stop beyond the spike extreme. Time stop: 30 minutes.

**Risk management.** The dangerous strategy in this family: spreads widen violently around releases and stops slip. Use half normal size, hard bracket orders, and skip tier-1 surprises (NFP shocks, rate shocks). Risk 0.5% max.

**Backtest evidence.** Event-study literature documents systematic partial retracement of announcement spikes when news content is weak; practitioner fade systems report 55–65% win rates on filtered setups. Unfiltered spike fading (fading every release) is a documented account-killer.

**Works / fails.** Works on second-tier releases (PMI, retail sales, housing). Fails on NFP/CPI/rate shocks, central-bank surprises, and geopolitical headlines.

**Backtesting notes.** You need a historical surprise database (actual vs consensus), not just price data — without the surprise variable, the backtest is meaningless. Model spread widening (5–20× normal in the first minute).

**Variations.** Fade the *second* spike (post-press-conference whipsaw); straddle-then-fade hybrid; currency-pair relative version (fade the weaker-reaction leg).

---

## S48 · Chandelier-Trail Crypto Scalp

**Market:** BTC, ETH · **Timeframe:** M5–M15 · **Style:** ATR-trailing momentum · **Evidence:** Grade A (published TradingView replication: 596 trades on BTC)

| Win rate | Profit factor | Raw result | After fixes | Style |
|---|---|---|---|---|
| 40.8% (documented raw) | 1.05 raw → viable with filters | 989% net / 70% DD | 200-EMA + ADX filters | Trailing momentum |

**Concept & edge.** Enter with RSI-confirmed Heikin Ashi momentum, exit only on a Chandelier stop (highest high − 1.85× ATR) — letting volatility decide the exit. The published replication is honest: raw version barely clears breakeven (PF 1.05, 70% DD); with trend and regime filters it becomes a real system. A perfect case study in *strategy repair*.

**Setup.** Heikin Ashi candles; RSI(25) vs RSI(100) (momentum alignment); Chandelier Exit (ATR period 1, mult 1.85); add 200-EMA and ADX(14).

**Entry rules.** Long: RSI(25) > RSI(100) + green HA candle + price above 200-EMA + ADX > 20. Short: mirror.

**Exit rules.** Chandelier trailing stop only (long: HH − 1.85×ATR). Optional: widen ATR period/multiplier (3/2.5) to cut DD dramatically at some profit cost.

**Risk management.** The documented 70% raw drawdown shows why filters matter: the 200-EMA removes counter-trend bleeding, ADX removes chop. Risk 0.75% per trade on the filtered version.

**Backtest evidence.** Published replication (BTC): 596 trades, 40.77% WR, PF 1.048, 989% net with 70% DD — unfit for real money as-is, and a great template for your own repair workflow.

**Works / fails.** Works in crypto trend legs (post-breakout momentum). Fails in chop and when the trailing logic meets violent wick-heavy reversals typical of perp markets.

**Backtesting notes.** This page's lesson: always publish (to yourself) the raw version first, then add one filter at a time and log each delta. That's the anti-curve-fit workflow.

**Variations.** ATR(3, 2.5) conservative trail; partial at 2R + chandelier on the runner; ETH version with wider multipliers.

---

## S49 · Liquidity-Sweep Reversal (SMC-Style)

**Market:** Forex, gold, indices, BTC · **Timeframe:** M5–M15 entry, H1/H4 context · **Style:** Stop-hunt reversal · **Evidence:** Grade C (SMC/ICT framework — popular but *not* academically validated; small-sample tests show promise only with strict confluence)

| Win rate | Typical RR | Evidence status | Key filter | Style |
|---|---|---|---|---|
| 45–60% (unverified consensus) | 2–3:1 | No rigorous public backtest | Sweep + displacement + HTF zone | Narrative reversal |

**Concept & edge.** Price frequently pokes just beyond obvious highs/lows (where stop orders cluster), then reverses sharply — the "liquidity sweep." The proposed edge: trade the reversal after the sweep, confirmed by a strong displacement candle (structure break). Honest caveat: this is a compelling narrative with *no large-sample public validation*; the concepts are also inherently subjective, which invites confirmation bias.

**Setup.** Mark obvious equal highs/lows, session highs/lows, prior day high/low. H1/H4 bias. Watch for the poke-through + fast reclaim.

**Entry rules.** Long: price sweeps a sell-side level (breaks the low by a few ticks/pips), closes back above it within 1–3 bars, then prints a bullish displacement (break of the local lower-high). Enter on the displacement or its 50% retrace ("OTE"-style). Short: mirror.

**Exit rules.** Stop below the sweep wick. Targets: opposing liquidity pool (the other side's equal highs/lows) — typically 2–3R.

**Risk management.** Because rules are subjective, *fix your definitions in writing before testing*: exact sweep tolerance, displacement body size, retrace depth. Risk 0.5–1%; expect your first coded version to underperform the narrative — that's normal and informative.

**Backtest evidence.** No rigorous peer-reviewed validation exists. Backtesting-tool vendors report that only *stacked-confluence* versions (sweep + displacement + higher-timeframe zone) show positive expectancy in 200+ trade samples; single-concept versions don't.

**Works / fails.** Works (anecdotally) around session opens and obvious equal highs/lows on forex/gold. Fails when levels are weak, in strong trends (sweeps become continuations), and in the hands of anyone who hasn't mechanized the rules.

**Backtesting notes.** The biggest trap in this book: manual chart review cherry-picks winners. Code exact rules, run 300+ trades, and compare against a random-entry baseline with the same stop/target distances.

**Variations.** Sweep + FVG (fair value gap) entry; session-high/low sweeps only (cleaner than equal-highs); killzone-timed version (London/NY open sweeps).

---

# Part V — Crypto-Specific Strategies

Crypto trades 24/7 with retail-heavy flow, funding mechanisms and no closing auction — producing anomalies that don't exist elsewhere. Several of the best-documented edges in this entire book live here (hourly seasonality, funding arbitrage, weekend effects). The caveat is regime fragility: crypto edges decay as institutional share grows.

## S50 · The 21:00–23:00 UTC Bitcoin Window

**Market:** BTC · **Timeframe:** Hourly, 2-hour daily hold · **Style:** Intraday seasonality · **Evidence:** Grade A (Padyšák & Vojtko, *Seasonality, Trend-following and Mean Reversion in Bitcoin*, 2022; SSRN "The Seasonality of Bitcoin", 2023)

| Annualized return | Hold time | Volatility vs B&H | Worst hours | Data |
|---|---|---|---|---|
| ~33% | 2 hrs/day | Much lower | 03:00–04:00 UTC | Gemini hourly, 2015–2022 |

**Concept & edge.** Bitcoin's hourly returns are not uniform: the 21:00–23:00 UTC window — after every major equity market has closed — delivered the most economically and statistically significant positive returns of the day. Holding BTC only during those two hours captured ~33% annualized with a fraction of buy-and-hold's volatility and drawdown.

**Setup.** Hourly BTC data, UTC clock. No indicators.

**Entry rules.** Buy at 21:00 UTC (the published variant uses 22:00, both hours significant).

**Exit rules.** Sell at 23:00 UTC. Flat the other 22 hours.

**Risk management.** Long-only strategy — it dies in bear markets (crypto is the riskiest asset class in uncertainty). Use it as a *tilt*, not a portfolio. Position size as you would any BTC exposure.

**Backtest evidence.** Gemini hourly data, Oct 2015–Feb 2022: the 22:00 and 23:00 UTC hours were the most significant positive hours; 03:00–04:00 UTC the worst. The 2-hour strategy: ~33% annualized, much smaller max DD than passive holding. Cross-validated across seven exchanges in the turn-of-the-candle literature.

**Works / fails.** Works in neutral/bull regimes. Fails in bear markets (the authors state this plainly) and may decay as 24/7 institutional flow normalizes hourly patterns — re-verify annually.

**Backtesting notes.** 20 lines of code on free hourly data (Binance). Check exchange-robustness and post-2022 persistence — the honest test is whether the effect survived ETF-era market structure.

**Variations.** Long 21:00–23:00 + short/flat 03:00–04:00; combine with the weekend effect (S51); apply to ETH (weaker but present).

---

## S51 · Bitcoin Weekend Effect

**Market:** BTC (strongest), ETH · **Timeframe:** Friday close → Monday · **Style:** Calendar anomaly · **Evidence:** Grade A (QuantifiedStrategies 2014–2026; ACR Journal peer-reviewed study 2025)

| Win rate | Avg gain/trade | Annual return | Exposure | ETH version |
|---|---|---|---|---|
| 60% (BTC), 53% (ETH) | 2.6% (BTC), 2.2% (ETH) | 28% (BTC), 18% (ETH) | ~10% | Weaker but valid |

**Concept & edge.** Weekend returns significantly outpace weekday returns across crypto: for BTC, mean daily return rises from 0.12% (weekdays) to 0.23% (weekends), with higher Sharpe and lower drawdowns. Altcoins show an even stronger effect (DOGE: 0.52% vs 0.21%). Drivers: institutional absence, retail dominance, thin liquidity amplifying retail flows.

**Setup.** Daily closes, UTC. Entry Friday ~21:00–23:00 UTC (or Saturday open variants).

**Entry rules.** Long BTC late Friday / early Saturday UTC. Optional filter: only when the prior week was not deeply negative (bear-regime filter).

**Exit rules.** Sell late Sunday / early Monday UTC (before the Monday Asia ramp ideally — see S52).

**Risk management.** Weekends include the occasional liquidation cascade (Sunday-night wicks are famous). Size for a 5–10% adverse move; the documented max DD is 19% (BTC) and 30% (ETH).

**Backtest evidence.** BTC 2014–2026: 103 trades, 2.6% average gain, 60% WR, 28% annual at 10% exposure, max DD 19%. ETH 2018–2026: 64 trades, 2.2%/trade, 18% annual, 53% WR. Peer-reviewed confirmation (2020–2025, 7-day momentum): weekend > weekday at p < 0.05 for BTC, p < 0.001 for altcoins; effect stronger in bull markets, persisting after excluding 2021.

**Works / fails.** Works in bull/neutral regimes, on BTC and high-beta alts. Weakens in bear markets and as weekend institutional participation grows.

**Backtesting notes.** Define the weekend precisely (Fri 21:00 UTC → Mon 00:00 UTC variants) and test sensitivity. Watch for interaction with funding (weekend longs pay/receive funding).

**Variations.** Altcoin-basket version (higher beta, higher variance); Friday-dip-only entries (buy only red Fridays); combine with S50's hourly window.

---

## S52 · The Monday Asia Open Effect (BTC Trend Window)

**Market:** BTC · **Timeframe:** Sunday ~19:00 ET → Monday ~19:00 ET · **Style:** Intraday trend seasonality · **Evidence:** Grade A (Concretum Group research, 2026 — high-frequency trend benchmark)

| Window | Pattern | Mechanism | Best tactic | Counter-window |
|---|---|---|---|---|
| Sun 19:00 ET + 24h | Strong positive trend-benchmark returns | Asian cash-open liquidity sets weekly direction | Trend-following longs | US Sunday morning (chop/mean-revert) |

**Concept & edge.** A high-frequency trend-following benchmark on BTC shows strong intraweek seasonality: trend persistence is highest starting Sunday ~19:00 ET and lasting ~24 hours — aligning with the Monday open of Asian cash equity markets (Tokyo). Fresh weekly positioning creates persistent order flow; conversely, US Sunday morning is the choppiest, most mean-reverting window.

**Setup.** Intraweek clock (ET). Trend tools: 20-EMA on H1, or Donchian(20) on H1.

**Entry rules.** Trend playbook during the Sunday-19:00–Monday-19:00 window only: H1 trend-following entries (EMA pullbacks, channel breaks) with the week's initial direction. Mean-reversion playbook during US Sunday morning if you must trade it.

**Exit rules.** Standard trend exits (opposite channel, 2× ATR trail). Reduce activity sharply after Monday 19:00 ET.

**Risk management.** This is a *when-to-trade* edge, not a standalone system — gate your existing trend systems with it. Weekend liquidity is thin: size down, widen stops modestly.

**Backtest evidence.** Concretum's volatility-targeted long/short trend benchmark on BTC: strongly positive returns concentrated in the Sunday-evening→Monday window, negative benchmark performance US Sunday morning — consistent across their high-frequency dataset and robust to volatility targeting.

**Works / fails.** Works as an overlay on H1–H4 trend systems. Fails as a standalone prediction (it predicts *trendiness*, not direction) and on news-dominated Mondays.

**Backtesting notes.** Replicate with your own trend benchmark: run a simple H1 channel-breakout system and bucket returns by hour-of-week — theheatmap is the research deliverable.

**Variations.** Apply the same intraweek mapping to ETH (correlated); combine with S51 (weekend long bias into the Monday window); avoid initiating mean-reversion trades during the window.

---

## S53 · Funding-Rate Cash & Carry (Delta-Neutral)

**Market:** BTC/ETH/SOL perpetuals vs spot · **Timeframe:** 8-hour funding epochs · **Style:** Market-neutral arbitrage · **Evidence:** Grade A (ScienceDirect peer-reviewed 2025: up to 115.9% per 6 months, worst-case −1.92%; Presto Research; Binance/BitMEX data)

| Return range | Max loss (study) | Correlation to HODL | Leverage effect | Capacity |
|---|---|---|---|---|
| Up to 115.9%/6mo (best scenario) | −1.92% | ~0 (diversifying) | Non-linear, nuanced | Limited by funding regimes |

**Concept & edge.** Perpetuals pay funding every 8h: when perp trades above spot (bullish crowds), longs pay shorts. Buy spot + short the perp in equal size = price-neutral; collect funding as yield. Classic positive-funding regimes paid 10–50%+ annualized; academic evaluation of 60 scenarios found returns up to 115.9% over six months with worst-case losses of just 1.92%.

**Setup.** Spot account + perp account (same or cross exchange). Monitor funding rate and predicted funding.

**Entry rules.** When funding is materially positive (e.g., > 0.01%/8h baseline and rising): buy X of spot, short X of perp. Hold while funding stays positive.

**Exit rules.** Close both legs when funding compresses toward zero or flips negative. Immediate close both legs on exchange-risk events.

**Risk management.** Risks are real but non-directional: liquidation on the perp leg (keep leverage ≤ 2–3× with collateral buffer), basis moves at entry/exit, exchange counterparty risk, funding volatility. The study's key finding: the strategy has *no correlation with HODL* — a true diversification return stream.

**Backtest evidence.** Peer-reviewed (CEX + DEX, BTC/ETH/XRP/BNB/SOL, 60 scenarios): returns up to 115.9% per 6 months; max loss −1.92%; leverage improves efficiency non-linearly. Presto Research: immediately converting accrued funding improves risk-adjusted returns.

**Works / fails.** Works in bullish/leveraged-long regimes (funding positive). Fails (goes flat, not catastrophic) in bear regimes when funding flips; tail risk is exchange failure, not price.

**Backtesting notes.** Pull historical funding (Binance API) + spot/perp prices; model fees, borrow costs, and the basis at entry/exit. Without friction modeling the Sharpe looks unrealistically perfect — that's the warning sign.

**Variations.** Cross-exchange funding spread (short high-funding venue, long low-funding venue — capital efficient, works even when funding positive everywhere); altcoin high-funding rotation (higher yield, higher risk).

---

## S54 · Cross-Exchange Funding Spread

**Market:** Same perp, two exchanges · **Timeframe:** 8-hour epochs · **Style:** Market-neutral arbitrage · **Evidence:** Grade B/A (documented arbitrage literature; practitioner data)

| Typical spread | Yield mechanism | Capital efficiency | Key risk | Best condition |
|---|---|---|---|---|
| 0.03–0.10%/8h | Pocket the funding differential | High (both legs margined) | Venue/counterparty | Funding sign divergence |

**Concept & edge.** The same perpetual trades at different funding rates on different exchanges. Short the perp where funding is high, long it where funding is low (or negative): you collect the spread every epoch while the legs cancel price risk. The dream scenario: positive funding on venue A, negative on venue B — paid on both legs.

**Setup.** Accounts with margin on 2+ liquid venues; funding monitor (or API polling).

**Entry rules.** When the funding differential exceeds ~2× round-trip fees per epoch: short perp on the high-funding venue, long equal size on the low-funding venue.

**Exit rules.** Close both when the differential collapses below the cost threshold. Review collateral distribution weekly (P&L accrues asymmetrically across venues).

**Risk management.** Exchange insolvency/depeg risk is the real one (you're long exposure to two venues). Keep per-venue exposure capped; prefer top-tier venues. Funding can flip sign between epochs — monitor at each settlement.

**Backtest evidence.** Documented examples in arbitrage literature: differentials of 0.03–0.10% per 8h common in volatile regimes (annualizes to 30–100%+ on margin, before fees). More capital-efficient than cash-and-carry since no spot capital is tied up.

**Works / fails.** Works in volatile, trending regimes when venue user-bases diverge (retail-heavy venues run hotter funding). Fails in quiet markets (differentials < fees) and during withdrawal halts/depegs.

**Backtesting notes.** Collect multi-venue funding history (public APIs) and compute the differential time series; model transfer times between venues for collateral rebalancing.

**Variations.** Tri-venue rotation; funding + basis combined arb; DEX-vs-CEX funding spread (ApolloX/Drift studied academically — higher yield, smart-contract risk).

---

## S55 · Turn-of-the-Candle Effect (BTC Micro-Seasonality)

**Market:** BTC (all major exchanges) · **Timeframe:** Minute-level, :00/:15/:30/:45 marks · **Style:** HFT-style seasonality · **Evidence:** Grade A (peer-reviewed, PMC 2023 — t-stats > 9 across seven exchanges)

| t-statistic | Pattern | Net of fees | Exchanges verified | Era |
|---|---|---|---|---|
| > 9 (all 7 exchanges) | Positive returns concentrated at 15-min candle turns | Outperforms B&H after fees/spread from $5k capital | 7 | Appeared mid-late 2020 |

**Concept & edge.** Positive BTC returns are disproportionately concentrated in the *first minute* of each 15-minute candle (the :00/:15/:30/:45 marks) — the candles every bot and chart watches. Algorithmic order-flow synchronization at candle turns creates a measurable, exploitable micro-pattern.

**Setup.** Minute-level BTC data. Algos trigger at candle opens; you position *just before* the turn.

**Entry rules.** Long seconds before each 15-min candle turn; hold through the first minute(s) of the new candle; exit as the effect decays. (The paper's exploit strategy outperformed B&H net of fees and spreads with capital as low as $5,000.)

**Exit rules.** Time-based: exit within the opening minutes of the candle. Strict — this is a micro-hold strategy.

**Risk management.** Capacity-limited and decay-prone (the paper notes the effect *appeared* in 2020 — anomalies born from algo behavior can die from it too). Fee tier is existential: you need maker/low-taker fees.

**Backtest evidence.** Statistically significant on all seven sampled exchanges in 2021 (t > 9), robust to outliers and heavy tails; net-outperforms buy-and-hold after fees and bid-ask spreads at small capital sizes.

**Works / fails.** Works with fast execution and low fees on BTC. Fails with retail fee tiers (0.1% taker kills it), slow APIs, and possibly post-publication as the edge gets arbed.

**Backtesting notes.** Needs minute data with exact timestamps; verify the effect's persistence post-2021 before building. This is a quant playground, not a manual strategy.

**Variations.** Hour-candle turns (bigger window, weaker effect); altcoin versions; combine with imbalance signals (S46) at candle turns.

---

## S56 · Q-RSI Crypto Pullback System

**Market:** BTC · **Timeframe:** Daily (RSI extremes), swing hold · **Style:** Quant mean reversion · **Evidence:** Grade A (MenthorQ published backtest, late 2024–mid 2025)

| Result vs BTC | Rules | Stop | Hold | Sample |
|---|---|---|---|---|
| +18% vs BTC +10% (and avoided 2025 drawdowns) | RSI extreme + 5-SMA trigger | None (time exit) | Fixed 10 days | Multi-month published |

**Concept & edge.** Inverts classic RSI logic: instead of selling overbought, it *buys* volatility extremes with trend confirmation — RSI < 20 recently + close above the 5-SMA (confirmed reversal), or RSI > 90 recently + close below the 5-SMA (exhaustion retracement). Crypto's violent two-sided volatility makes extremes tradeable in *both* directions.

**Setup.** Daily BTC: RSI(14) and 5-day SMA.

**Entry rules.** Buy condition 1: RSI < 20 at least once in past 3 days AND today's close > 5-SMA. Buy condition 2: RSI > 90 at least once in past 3 days AND today's close < 5-SMA.

**Exit rules.** Time exit exactly 10 days after entry. No stop loss (documented design choice — position sizing carries the risk).

**Risk management.** No stops means sizing *is* the risk management — small fixed fractions (2–5% of equity per position). The 10-day hold rides out noise that stops would convert to losses.

**Backtest evidence.** Published multi-month backtest: +18% cumulative vs BTC's +10%, with the strategy sidestepping the deep drawdowns BTC suffered in early 2025 — consistent equity growth through choppy conditions.

**Works / fails.** Works on BTC (and likely ETH) in two-sided volatile regimes. Fails in smooth, low-volatility trends (few signals) and structurally falling markets (condition-1 buys keep catching knives — the 5-SMA filter mitigates but doesn't eliminate).

**Backtesting notes.** Test RSI thresholds (15/85, 20/90, 25/75), lookback windows (3 vs 5 days), and holds (5/10/15 days). No-stop systems need honest max-adverse-excursion analysis.

**Variations.** Add a loose 2× ATR disaster stop and compare; ETH/SOL versions; asymmetric sizing (larger on condition 1 than condition 2).

---

## S57 · Z-Score Momentum Basket (Crypto)

**Market:** Top-liquid crypto basket · **Timeframe:** Daily · **Style:** Cross-sectional momentum · **Evidence:** Grade A (published systematic study, Binance data 2017–2025)

| Sharpe | Best era | Enhancement | Combined-system Sharpe | Method |
|---|---|---|---|---|
| ~1.0 (raw), ~1.2 (vol-filtered) | Pre-2021 trends | Volatility filter | 1.71 (50/50 with S58) | Bayesian-optimized windows |

**Concept & edge.** Rank liquid coins by rolling return z-scores (short-window vs long-window); long the strongest, short the weakest. Cross-sectional momentum transferred well to crypto's early trending era; adding a volatility filter (trade only in stable vol regimes) improved the Sharpe from ~1.0 to ~1.2.

**Setup.** Daily returns for a liquid-coin universe; rolling z = (mean_short − mean_long)/std_long; rolling vol filter.

**Entry rules.** Rebalance periodically: long top-ranked coins, short bottom-ranked, normalized weights. Bayesian-optimize the short/long windows — then *freeze* them out-of-sample.

**Exit rules.** Signal-based rotation (positions exit when ranks change). Vol filter overrides: flat when aggregate volatility exceeds threshold.

**Risk management.** Diversified basket reduces single-coin blowup risk, but shorts in crypto carry squeeze risk — cap per-coin weight, prefer perps for the short leg. Watch borrow/funding costs on shorts.

**Backtest evidence.** 2017–2025 with out-of-sample testing, walk-forward, and cost modeling: Sharpe ~1.0 raw, ~1.2 vol-filtered; strong pre-2021, decaying as market structure matured. The 50/50 blend with mean reversion (S58): Sharpe 1.71, 56% annualized, t-stat 4.07.

**Works / fails.** Works in trending, retail-led regimes. Fails post-2021-style choppy correlation regimes (momentum crashes) — hence the vol filter and the blend.

**Backtesting notes.** Survivorship bias is the big one (delisted coins vanish from datasets, flattering results). Use a point-in-time universe. Report training vs test metrics separately, as the source does.

**Variations.** Long-only top-quintile (for spot-only traders); funding-adjusted ranking; combine with BTC regime filter.

---

## S58 · BTC-Neutral Residual Mean Reversion (Crypto)

**Market:** Liquid altcoins vs BTC · **Timeframe:** Daily · **Style:** Idiosyncratic mean reversion · **Evidence:** Grade A (same published study; strongest single result)

| Sharpe | Best era | Hedge | Combined Sharpe (with S57) | Complexity |
|---|---|---|---|---|
| ~2.3 | Post-2021 chop | Rolling beta to BTC | 1.71 | High (quant) |

**Concept & edge.** Strip each coin's beta to BTC via rolling regression; the residual (idiosyncratic) return mean-reverts: coins that outperformed *their own beta* snap back, and vice versa. Long residual losers, short residual winners, BTC-neutral by construction. Post-2021's choppy, BTC-dominated regime made this the strongest strategy in the study.

**Setup.** 180-day rolling regression of coin returns on BTC returns → residuals → z-score the residuals; balanced normalized portfolio.

**Entry rules.** Long coins with residual z < −2, short coins with residual z > +2, weights beta-neutralized so BTC exposure ≈ 0.

**Exit rules.** Exit at residual z crossing ±0.5, or time-stop 5–10 days. Rebalance on schedule.

**Risk management.** Residual models break on idiosyncratic news (hacks, delistings) — exclude coins with pending events; cap single-name weight; the beta estimate lags regime shifts.

**Backtest evidence.** Sharpe ~2.3, particularly strong post-2021 — the mirror-regime of momentum. 50/50 blended with z-score momentum: Sharpe 1.71, 56% annualized, t-stat 4.07, smoother across regimes than either alone. Methodology included out-of-sample, walk-forward, and realistic costs.

**Works / fails.** Works in correlation-heavy chop (most of modern crypto). Fails during altseason breakouts (residual shorts run away) and on thin coins.

**Backtesting notes.** Everything from S57 applies, plus: regression-window sensitivity (90/180/360) and the same survivorship-bias discipline. This is a genuine quant project — budget real time.

**Variations.** ETH-neutral instead of BTC-neutral; sector-neutral (DeFi vs L1s); intraday (4h) residual z-scores for faster rotation.

---

## S59 · ETH 5-Minute Optimized Scalping System

**Market:** ETH/USD · **Timeframe:** M5 · **Style:** Multi-filter momentum scalp · **Evidence:** Grade A (published open-code study, fees included, train/test split)

| Key finding | Params (winner) | Fees | Validation | Lesson |
|---|---|---|---|---|
| Unoptimized viral params lose after fees | EMA 20/100, BB(50,3), ATR(5)×3, RR 4 | 0.1% modeled | Train 60% / test 40% | Parameter search + OOS discipline |

**Concept & edge.** A viral EUR/USD scalping system (EMA cross + Bollinger + ATR stops) was ported to ETH 5-min: it *burned money* with 0.1% fees. Systematic parameter search with a stability score (fraction of positive rolling windows) produced configurations profitable *net of fees* in both training and test periods. The strategy itself is secondary — the workflow is the edge.

**Setup.** Fast/slow EMAs, Bollinger Bands, ATR stops, RSI filter, trend-MA threshold — all parameterized.

**Entry rules.** (Winning documented config: fast EMA 20, slow EMA 100, BB(50, 3σ), ATR(5) stop × 3, RR target 4.) Enter on fast/slow EMA alignment with BB breakout context; ATR-based stop; fixed 4R target.

**Exit rules.** ATR stop or 4R target; trend-MA exit.

**Risk management.** Fewer, bigger trades beat many small ones after fees — the optimization independently discovered this (RR 4, wide ATR). No leverage in the study; 0.1% fees modeled.

**Backtest evidence.** Baseline (viral params): negative after fees. Optimized configs: positive in both train (60%) and test (40%) windows — a rare published example of a retail-style crypto scalp surviving honest accounting.

**Works / fails.** Works when parameter search is regularized (stability scoring) rather than best-fit. Fails when you optimize net profit alone (classic overfit).

**Backtesting notes.** Copy the workflow: walk-forward splits, rolling-window stability score, fee-first modeling, parameter plateaus. That workflow is what Part XI's appendix formalizes.

**Variations.** BTC version (wider ATR multiples); maker-fee version (limit entries) — fees drop and the whole system improves; RR 2 variant for higher win rate.

---

## S60 · Crypto Bollinger Squeeze Breakout

**Market:** BTC, ETH, SOL · **Timeframe:** H1–H4 · **Style:** Volatility expansion · **Evidence:** Grade B (documented 3-month M5 ETH studies + volatility-cycle research)

| Win rate | Typical RR | Trigger | Failure | Style |
|---|---|---|---|---|
| 45–55% | 2–3:1 | Squeeze → expansion | Fakeout (common) | Compression breakout |

**Concept & edge.** Crypto alternates compression and expansion violently. When Bollinger Band width hits a multi-month percentile low, the subsequent break travels far enough that 45–55% accuracy at 2–3:1 pays well. Perp funding and liquidation cascades amplify the expansions beyond what equities deliver.

**Setup.** BB(20, 2); band-width percentile (6-month lookback); ATR; volume.

**Entry rules.** Band width < 10th percentile; enter on the first H1/H4 close outside the bands with volume > 150% of average. Direction-agnostic — take what the market gives.

**Exit rules.** Initial stop: opposite side of the squeeze range. Targets: 2R and 3R with ATR trail on the runner. Liquidation-cascade bonus: don't cap winners on high-funding extremes.

**Risk management.** Fakeouts are the tax (expect ~half your squeezes to fake). First break fails + immediate re-squeeze = stand down for the day. Risk 1%.

**Backtest evidence.** Documented 3-month 5-min ETH Bollinger studies show raw scalping versions are marginal, but H1/H4 compression-breakout versions with volume confirmation hold positive expectancy; volatility-clustering research explains why (low-vol predicts high-vol, not direction).

**Works / fails.** Works on majors after weekend/holiday compressions and pre-macro-event coils. Fails with late entries (chasing bar 3 of the expansion) and in repeated-fakeout regimes.

**Backtesting notes.** The edge is in the *filter* (compression percentile), not the entry candle. Test percentile thresholds 5/10/20 and require volume confirmation; compare with S61's Keltner-based squeeze detection.

**Variations.** Squeeze + funding-extreme bias (trade against crowded funding); multi-coin scanner (trade whichever major squeezes first); add S28 Supertrend as the trail.

---

## S61 · TTM-Style Squeeze (Bollinger-in-Keltner)

**Market:** All (futures, crypto, forex) · **Timeframe:** M15–H4 · **Style:** Compression-release momentum · **Evidence:** Grade B (John Carter's documented system; extensive practitioner backtests)

| Win rate | Typical RR | Signal quality | Best use | Edge |
|---|---|---|---|---|
| 45–55% | 2–3:1 | Few, high-quality signals | Pre-breakout positioning | Early compression detection |

**Concept & edge.** When Bollinger Bands contract *inside* Keltner Channels, volatility is abnormally compressed (BB measures deviation, KC measures ATR range). The "squeeze firing" — BB expanding back outside KC with momentum direction — times breakouts earlier and cleaner than band-width alone. The dots/momentum histogram make it fully mechanical.

**Setup.** BB(20,2), KC(20, 1.5 ATR), momentum oscillator (linear-regression momentum per Carter). Squeeze on = BB inside KC.

**Entry rules.** Enter when the squeeze fires (BB crosses back outside KC) in the direction of the momentum histogram, ideally after ≥ 6–8 bars of compression. Earlier entries: first momentum-histogram tick while still in squeeze (aggressive).

**Exit rules.** Initial stop: 1× ATR or opposite side of the squeeze box. Exit/trail when momentum histogram flips or two consecutive opposite bars print. Targets 2–3R.

**Risk management.** Fake fires cluster when the squeeze was short (< 5 bars) — require minimum compression length. Risk 0.75–1%; one fire per instrument per day.

**Backtest evidence.** Practitioner backtests across index futures and forex: 45–55% win rates at 2–3:1 with minimum-squeeze-length filters; the system's documented strength is signal *scarcity with quality* — a handful of trades per instrument per month.

**Works / fails.** Works on volatile instruments (NQ, BTC, GBP pairs) post-compression. Fails in instruments that fake out repeatedly (mean-reverting majors in tight macro ranges) and with premature entries before the fire.

**Backtesting notes.** Fully codable (squeeze on/off is boolean). Test momentum-histogram definitions and minimum squeeze bars 4/6/8/10. Compare against S60 on identical data — keep whichever your market respects.

**Variations.** Dual-timeframe squeeze (H4 squeeze, H1 fire); squeeze + ORB hybrid (morning squeeze fires into the opening range); histogram-divergence early exits.

---

# Part VI — Volatility & Range-Compression Strategies

Volatility clusters: quiet begets quiet, then expansion arrives violently. Compression patterns (NR7, inside bars, squeezes) don't predict direction — they predict *movement*, which is tradeable with the right structure. Toby Crabel's pattern research is the founding document of this family.

## S62 · NR7 Breakout (Crabel)

**Market:** Indices, forex, gold, crypto · **Timeframe:** Daily signal → intraday trade; or H1 for pure intraday · **Style:** Range-compression breakout · **Evidence:** Grade B (Crabel, 1990 pattern research; persistent practitioner replication)

| Win rate | Typical RR | Signal | Follow-through | Style |
|---|---|---|---|---|
| 45–55% | 1.5–2:1 | Narrowest range of 7 bars | Best with trend filter | Compression breakout |

**Concept & edge.** An NR7 day/bar has the narrowest high–low range of the last 7. Crabel's research found such compression days precede range expansion with above-random follow-through, especially when aligned with the prevailing trend. It's the atomic unit of compression trading.

**Setup.** Identify NR7 on daily bars (or H1 bars for intraday sessions). Optional trend filter (20-SMA) and volume.

**Entry rules.** Stop orders both sides of the NR7 bar (OCO); first break triggers. With trend filter: only the trend-direction side. Cancel if neither side triggers within 1–2 bars.

**Exit rules.** Stop: opposite side of the NR7 bar (it's narrow — risk is small by design). Targets: 1.5–2R, or trail; many pros exit at the session/day close (range expansions typically complete within 1–2 bars).

**Risk management.** The narrow range means tight stops — and therefore tempting oversize positions. Size by stop distance, cap at 1% risk. Watch for the double-fakeout (break, reverse, break again): max one re-entry.

**Backtest evidence.** Crabel's original futures research documented NR7 breaks outperforming random entries; practitioner replications: 45–55% win rates at 1.5–2:1, strongest when the NR7 appears inside a trend and after an already-quiet week. NR7 is usually taught *with* the inside-bar variant (S63) — together they outperform either alone in most published comparisons.

**Works / fails.** Works on volatile instruments after genuinely quiet stretches. Fails in choppy transition regimes (fakeout chains) and on thin instruments where narrow range = no interest, not stored energy.

**Backtesting notes.** Trivial to code (rolling range rank). Test with/without trend filter, entry at break vs break+retest, and exit at close vs 2R. Confirm the edge survives 1–2 ticks of slippage — tight stops amplify slippage sensitivity.

**Variations.** NR4 (faster); NR7 + inside day combo (the classic); NR7 in the direction of yesterday's close only.

---

## S63 · Inside Bar Breakout

**Market:** All liquid markets · **Timeframe:** H1–Daily · **Style:** Pattern breakout · **Evidence:** Grade B (price-action literature; practitioner backtests)

| Win rate | Typical RR | Best context | Failure | Style |
|---|---|---|---|---|
| 45–55% | 1.5–2:1 | Trend pullback pauses | Range chop | Pattern momentum |

**Concept & edge.** An inside bar (entire range within the prior bar) is a one-bar compression: the market pausing. Inside bars *within trends* (especially after a pullback leg) resolve with the trend more often than chance; inside bars in the middle of ranges are coin flips. Context is the strategy.

**Setup.** Inside bar detection; trend context (20-EMA slope or higher-high structure); mother-bar size relative to ATR.

**Entry rules.** Trend-aligned: after a pullback, enter on the break of the inside bar in the trend direction (stop order). Highest quality: mother bar is a strong trend bar, inside bar small (< 50% of mother).

**Exit rules.** Stop: opposite side of the inside bar (tight) or the mother bar (conservative). Targets 1.5–2R or trail with structure.

**Risk management.** Inside-bar chains (multiple consecutive) = deepening compression — the eventual break is often stronger; keep the OCO armed. Risk 0.75% per trade; skip inside bars whose mother bar is enormous (exhaustion, not pause).

**Backtest evidence.** Practitioner backtests: trend-filtered inside-bar breaks run 45–55% at 1.5–2:1; unfiltered inside bars are ~random after costs — the same story as every pattern in this family. Small-inside-bar (< 50% of mother) subsets outperform in published comparisons.

**Works / fails.** Works as a trend-continuation timer on H1–H4. Fails standalone in ranges and on M1–M5 (noise bars mimic inside bars constantly).

**Backtesting notes.** The trend-context definition is the variable that matters — test 3 mechanical definitions. Pattern-code is 10 lines; spend your effort on context filters.

**Variations.** Inside bar at S/R levels (reversal version); "ii" double-inside (compression²); H4 inside bar traded on H1 break (better entry price).

---

## S64 · NR4/ID Combo (The Classic Crabel Setup)

**Market:** Futures, forex · **Timeframe:** Daily → intraday execution · **Style:** Dual compression breakout · **Evidence:** Grade B (Crabel research lineage; this is the historically famous one)

| Win rate | Typical RR | Rarity | Historical status | Style |
|---|---|---|---|---|
| 50–58% (documented ranges) | 1.5–2.5:1 | ~1–3/month per market | Crabel's flagship | Premium compression |

**Concept & edge.** A day that is *both* an NR4 (narrowest of 4) *and* an inside day compresses volatility twice — the dual condition was Crabel's highest-conviction expansion signal. Rarer than NR7 (1–3 per market per month) but historically more reliable per signal.

**Setup.** Daily bars: today = inside day AND narrowest range of the last 4. Mark the day's high/low for tomorrow's triggers.

**Entry rules.** Next session: stop orders 1 tick beyond the combo day's high and low (OCO). Trade whichever side triggers; trend filter optional (documented as improving per-trade expectancy at some cost to frequency).

**Exit rules.** Stop: opposite side of the combo day. Target: 1.5–2.5R or the measured move (combo range projected). Time exit: end of the trigger day if neither target nor stop hits.

**Risk management.** Rare signals tempt forcing trades when they finally appear — stick to 1% risk. If the trigger day opens with a big gap beyond the trigger, skip (the expansion already happened).

**Backtest evidence.** Crabel's futures research ranked NR4/ID among his best opening-range patterns; practitioner replications across decades show 50–58% win rates at 1.5–2.5:1, with performance clustering in commodities and currencies (trend-prone) rather than equities.

**Works / fails.** Works on trend-prone futures (energies, metals, softs, currencies). Fails in equities (mean-reverting) and during regime transitions with chained fakeouts.

**Backtesting notes.** Compare NR4/ID vs NR7 vs plain inside day on the same data — know which your market pays for. As with all breakout pages here, slippage stress-test at 1/2/3 ticks.

**Variations.** NR7/ID (rarer, stronger); combo + prior-week trend alignment; intraday H1 version for gold/oil session trading.

---

## S65 · ATR Expansion Breakout (Larry Williams Style)

**Market:** Futures, crypto, forex · **Timeframe:** H1–Daily · **Style:** Volatility-breakout (range projection) · **Evidence:** Grade B (Williams' documented volatility-breakout work; practitioner replications)

| Win rate | Typical RR | Trigger | Key parameter | Style |
|---|---|---|---|---|
| 40–50% | 2–3:1 | Open + k × ATR projection | k ≈ 0.5–1.0 | Projection breakout |

**Concept & edge.** Williams' volatility breakout: tomorrow's likely move is entered by projecting a fraction of recent range (ATR) from the open — buy at open + 0.7×ATR, short at open − 0.7×ATR. The concept powers countless CTA systems: expansion tends to continue once a volatility threshold is crossed.

**Setup.** ATR(14) or yesterday's range; session open price; k multiplier.

**Entry rules.** At session open, place stops at open ± k×ATR (start k = 0.7, optimize 0.5–1.0). OCO; first trigger enters. Trend-filtered variant: only the 20-SMA side.

**Exit rules.** Stop: open (the pivot of the trade) or 1× ATR from entry. Target: 2–3× ATR, or close of session. Williams-style: exit next open (overnight version).

**Risk management.** Whipsaw days hit both stops — cap at one trigger per direction per session. k and the stop placement trade off frequency vs win rate; document the trade-off curve. Risk 1%.

**Backtest evidence.** Volatility-breakout systems are among the most replicated in futures: raw versions ~breakeven, trend/day-filtered versions 40–50% at 2–3:1. Williams documented the approach on bonds and indices; modern CTA variants remain live on commodities and crypto.

**Works / fails.** Works on wide-ranging instruments (gold, crude, NQ, BTC). Fails in mean-reverting quiet markets and with k set too tight (noise triggers).

**Backtesting notes.** Grid k from 0.4–1.2 in 0.1 steps; demand a plateau. Interaction between k and trend filter is the research question — publish your own surface plot before choosing.

**Variations.** Weekly ATR projection (Monday open ± k×weekly ATR); dual-side straddle with no filter (true straddle); OOPS pattern (open outside yesterday's range, fade — Williams' reversal cousin).

---

## S66 · Post-Trend-Day Narrow Range (Continuation Coil)

**Market:** Indices, futures, crypto · **Timeframe:** Daily context → H1 intraday · **Style:** Momentum continuation · **Evidence:** Grade C/B (practitioner pattern; consistent with momentum-persistence literature)

| Win rate | Typical RR | Setup rarity | Best vehicle | Style |
|---|---|---|---|---|
| 55–65% | 1.5–2:1 | ~few/month per market | Trending instruments | Continuation |

**Concept & edge.** A large-range trend day followed by a narrow inside-ish day = the market digesting, not reversing. Momentum-persistence research supports continuation: the coil after initiative activity resolves with the trend more often than not.

**Setup.** Day 1: range > 1.5× ATR(14) with directional close (in the day's top/bottom quartile). Day 2: range < 0.6× ATR, ideally inside day 1's range.

**Entry rules.** Day 3 (or intraday on day 2's H1): enter on break of day 2's range in day 1's direction. Stop at day 2's opposite edge.

**Exit rules.** Target: day-1 range projected, or 1.5–2R. Time exit: 2 days max — continuation coils fire fast or fizzle.

**Risk management.** If day 2's range isn't actually narrow (check the ATR ratio mechanically), there's no coil and no edge — don't force it. Risk 0.75–1%.

**Backtest evidence.** Practitioner tests of trend-day/narrow-day sequences: 55–65% continuation win rates on index futures and BTC; consistent with daily-horizon time-series momentum literature showing 1–3 day persistence after large directional moves.

**Works / fails.** Works in macro trend environments and breakout weeks. Fails in rotation regimes where every big day reverses (check your market's current character first).

**Backtesting notes.** Mechanically define day 1 (range percentile + close location) and day 2 (range ratio) — then just measure P(day-3 continuation). If base rate doesn't exceed ~55%, skip entry engineering.

**Variations.** Intraday version: H1 trend leg → H1 coil → H1 continuation; weekly version for position traders; add volume contraction on day 2 as quality filter.

---

## S67 · Volatility Contraction Pattern (Intraday VCP)

**Market:** Stocks, crypto · **Timeframe:** M15–H1 · **Style:** Progressive-compression breakout · **Evidence:** Grade C (Minervini's swing framework adapted intraday; practitioner replication)

| Win rate | Typical RR | Signature | Entry timing | Style |
|---|---|---|---|---|
| 50–60% | 2–3:1 | Successively smaller pullbacks | At the pivot | Precision breakout |

**Concept & edge.** VCP: each pullback within a consolidation is smaller than the last (e.g., 8% → 4% → 2%) as supply dries up. The final contraction, on shrinking volume, precedes expansion. Intraday adaptation: contracting M15 pullbacks under a clear level, volume drying into the apex.

**Setup.** M15/H1 chart; mark the consolidation's pullback depths and volume per pullback; define the pivot (resistance being pressed).

**Entry rules.** Enter on the break of the pivot *after* at least 2–3 progressively smaller contractions, with the last contraction < half the first and volume at its lowest of the pattern. Anticipation entry (small size at the apex) is the aggressive variant.

**Exit rules.** Stop: below the last contraction's low (tight — the pattern's gift). Targets 2–3R; trail if volume explodes on the break (real sponsorship).

**Risk management.** The tight stop under the apex is the whole RR story — but it also means stop-outs from wicks. Use a small buffer (0.2× ATR). Risk 0.75–1%.

**Backtest evidence.** Swing-timeframe VCP is extensively documented by Minervini (US Investing Championship record) for stocks; intraday adaptations are practitioner-verified rather than study-verified — 50–60% continuation rates on clean patterns. Validate on your market.

**Works / fails.** Works on momentum names and trending crypto majors. Fails in choppy indices and when the "contractions" are just random noise (require the volume-dryup signature).

**Backtesting notes.** Hard to fully mechanize (pattern recognition); semi-systematic approach: code contraction-ratio + volume-slope filters, then review signals manually before backtesting entries.

**Variations.** Apex-limit entries; VCP + RVOL filter (only on the day's active names); failed-VCP reversal trade (advanced).

---

## S68 · Range-Expansion Reversal (Exhaustion Bar)

**Market:** All · **Timeframe:** M15–H1 · **Style:** Climax fade · **Evidence:** Grade C/B (practitioner; consistent with short-term reversal literature)

| Win rate | Typical RR | Signature | Danger | Style |
|---|---|---|---|---|
| 55–65% | 1–1.5:1 | 2σ+ bar closing off extremes | Trend continuation | Exhaustion fade |

**Concept & edge.** After an extended run, a sudden huge range bar (≥ 2× ATR) that *closes well off its extreme* marks exhaustion — the last traders chased, and there's no one left. Short-term reversal is one of the most robust documented anomalies; the exhaustion bar is its candlestick expression.

**Setup.** ATR(14) context; prior run = 3+ same-direction bars or ≥ 2σ extension from the 20-EMA. The trigger bar: range ≥ 2× ATR, close in the opposite third of its range.

**Entry rules.** Short after an up-exhaustion bar: enter on the next bar's break of the trigger bar's low (or a 50% retrace of it). Long: mirror after down-exhaustion.

**Exit rules.** Target: the 20-EMA or the run's 38–50% retrace. Stop: beyond the trigger bar's extreme (with buffer). Time stop: 5–8 bars.

**Risk management.** Fading climaxes in *parabolic* regimes (blow-off tops, squeeze cascades) is suicide — require the close-off-extreme signature and a non-parabolic prior run. Risk 0.5–0.75%.

**Backtest evidence.** Short-term reversal after large-range bars is documented in equity and crypto reversal literature; practitioner exhaustion systems: 55–65% win rates to mean targets. The entry *trigger* (next-bar break vs immediate fade) shifts the WR/RR balance materially — test both.

**Works / fails.** Works after extended intraday runs in normal regimes. Fails in genuine breakouts (the exhaustion bar becomes bar 1 of a trend) and during news cascades.

**Backtesting notes.** Define "prior run" and "extended" mechanically (σ-distance from mean). Measure follow-through distributions after qualifying bars vs all bars — the delta is the edge.

**Variations.** Volume-climax requirement (highest volume of N bars); RSI(2) > 95/< 5 as the quantifier; two-bar exhaustion (engulfing reversal) version.

---

## S69 · First-15-Minute Range Fade (Open Reversion)

**Market:** ES, NQ, DAX · **Timeframe:** M1–M5 · **Style:** Opening-range mean reversion · **Evidence:** Grade C/B (practitioner; consistent with opening-overreaction research)

| Win rate | Typical RR | Window | Filter | Style |
|---|---|---|---|---|
| 55–65% | 0.8–1.2:1 | 09:45–10:30 ET | Wide first-15 vs ATR | Open fade |

**Concept & edge.** The complement of ORB: on *most* days (which are not trend days), the first 15 minutes' range holds for hours. Fading tests of the first-15 extremes back toward the midpoint exploits opening overreaction — the mirror image of S14, and the two can be run as one day-type-switching system.

**Setup.** First-15-min high/low; width filter: fade only when the range is *wide* relative to ATR (emotional open) — narrow ranges favor breakouts instead.

**Entry rules.** Fade the first test of the first-15 high/low after 09:45 with an M1/M5 rejection; enter toward the range midpoint. If price *accepts* outside (2 closes), flip to the ORB playbook.

**Exit rules.** Target: range midpoint, then opposite edge. Stop: 0.3–0.5× the range beyond the tested edge. Time stop: by 11:30 ET.

**Risk management.** The wide-range filter is critical: fading narrow openings means fading breakouts (donation). Risk 0.5%; max 2 fades per morning.

**Backtest evidence.** Practitioner statistics: wide-first-15 opens revert to midpoint ~55–65% of the time; the ORB mega-studies (S14) independently imply the same base rates (most opens don't trend). Running fade vs breakout as a width-switched system is documented on futures desks.

**Works / fails.** Works on emotional, gappy opens that lack follow-through volume. Fails on genuine trend days — hence the acceptance flip rule.

**Backtesting notes.** Test width thresholds (as % of 14-day ATR) for the fade/break switch. The two playbooks should be backtested *together* as one system — that's the honest design.

**Variations.** Fade only against the overnight gap; London-open version (first-15 of the cash session); midpoint-scaled exits (half at 50%, half at opposite edge).

---

# Part VII — News & Event-Driven Strategies

Events concentrate volatility into minutes. The honest literature is split: some event strategies have real edges (post-announcement drift), others are casino games with extra steps (straddling tier-1 releases with retail spreads). This section gives you both — with the evidence labeled.

## S70 · NFP Straddle (With Honest Caveats)

**Market:** EUR/USD, USD/JPY, gold · **Timeframe:** M1–M5 around 13:30 UTC, first Friday monthly · **Style:** Event volatility · **Evidence:** Grade B/A (NFP backtests published; spread/slippage warnings documented)

| Win rate | Typical RR | Spread reality | Verdict | Better alternative |
|---|---|---|---|---|
| 40–55% (retail-realistic) | 1.5–2:1 | 5–20× normal at release | Marginal after costs | S71 (fade) or S72 (drift) |

**Concept & edge.** NFP is the highest-impact scheduled release in forex. The straddle (OCO stop orders both sides pre-release) tries to catch the initial burst without predicting direction. The theory is clean; the execution reality is not.

**Setup.** Economic calendar; pre-release range marked; OCO orders 10–20 pips beyond the range, placed 1 minute before release.

**Entry rules.** Whichever stop triggers, cancel the other. Some pros *don't* enter on the first 1-minute spike (whipsaw zone) but on the first M1 close — fewer fills, better ones.

**Exit rules.** Target: 1.5–2× the pre-release range. Stop: the pre-release range's opposite side. Time stop: 30 minutes — NFP moves resolve fast or chop.

**Risk management.** Documented killers: spreads widen 5–20× at release, stop orders slip 10–50 pips on fast tape, both legs can trigger in the whipsaw. Half-size, hard caps, and ECN execution are mandatory. Risk 0.5% max — treat it as a lottery-ticket line item, not a core system.

**Backtest evidence.** Published NFP backtests (QuantifiedStrategies on post-NFP days) show the *directional* post-release edge is weak-to-negative for stocks/bonds — the money is in the volatility itself. Retail straddle tests: 40–55% win rates with extreme variance in fills. Broker data consistently shows NFP as a high-slippage event.

**Works / fails.** Works with institutional-grade execution on genuine surprise prints. Fails for most retail setups — the house edge is execution, and the house isn't you.

**Backtesting notes.** Backtesting straddles on OHLC data is meaningless (fills are the strategy). If you can't model the first-minute spread/slippage, don't trust any result.

**Variations.** Trade only when consensus dispersion is wide (uncertainty = bigger moves); post-release continuation entry (safer); gold-only version.

---

## S71 · NFP Aftermath Fade / Continuation

**Market:** EUR/USD, gold, indices · **Timeframe:** M5–M15, 15–90 min post-release · **Style:** Post-event flow · **Evidence:** Grade B (post-announcement drift + overreaction literature)

| Win rate | Window | Rule of thumb | Style | Risk |
|---|---|---|---|---|
| 50–60% | 15–90 min after | Surprise → trend; non-surprise → fade | Judgment-based | Medium-high |

**Concept & edge.** The tradable NFP edge starts *after* the chaos: (1) genuine surprise → initial direction persists (post-announcement drift, academically documented); (2) in-line print + big spike → retrace (the S47 fade). Classify first, trade second.

**Setup.** Actual vs consensus + revision; the first 15 minutes' range as the event's verdict.

**Entry rules.** Surprise case: enter with the initial direction on the first M5 pullback after 15 minutes. Non-surprise spike case: fade toward pre-release price with the same timing.

**Exit rules.** Drift: target 1.5–2R or the day's extension; trail M15 swings. Fade: target 50–100% of the spike; stop beyond the extreme.

**Risk management.** Revisions to prior months can reverse the initial verdict mid-trade — read the full release, not just the headline. Risk 0.5–0.75%; one NFP trade per month is plenty.

**Backtest evidence.** Post-earnings/macro announcement drift is one of the oldest documented anomalies; NFP-specific practitioner systems show 50–60% continuation win rates on true surprises. The fade variant aligns with documented announcement-overreaction retracements.

**Works / fails.** Works when you classify correctly — which requires reading the number in context (headline + revisions + wages + unemployment). Fails when traded mechanically on headline alone.

**Backtesting notes.** Build a surprise-z-score database ((actual − consensus)/dispersion) and bucket post-release returns by it — the relationship is your edge map.

**Variations.** Same framework for CPI (S73) and rate decisions (S74); currency-cross version (trade the cross least moved).

---

## S72 · FOMC Drift & Announcement-Day Pattern

**Market:** SPY/ES, TLT, DXY · **Timeframe:** Daily (pre/post FOMC) · **Style:** Calendar anomaly · **Evidence:** Grade A (Lucca & Moench, *The Pre-FOMC Announcement Drift*, published research)

| Edge size | Window | Win rate | Significance | Robustness |
|---|---|---|---|---|
| ~0.3–0.5% per event (historically) | 24h before announcement | ~60–70% of events | Highly significant academically | Decades, US-centric |

**Concept & edge.** One of the strongest documented calendar anomalies: the S&P 500 earns outsized returns in the 24 hours *before* scheduled FOMC announcements — historically accounting for a large share of total equity returns, with no corresponding rise in volatility. Theories: risk premium resolution, informed positioning.

**Setup.** FOMC calendar (8 scheduled meetings/year). ES/SPY.

**Entry rules.** Long ES/SPY ~24 hours before the announcement time (e.g., buy prior day 14:00 ET, or morning of). Exit shortly after the 14:00 ET statement (the drift is pre-announcement; post-statement is a different game).

**Exit rules.** Time exit at/just after the statement. Some hold through the press conference — historically flatter and wilder.

**Risk management.** Eight trades a year — variance dominates. Size as a small overlay (0.5–1% risk). Surprise policy shocks (2013 taper tantrum analogs) are the tail risk.

**Backtest evidence.** Lucca & Moench (NY Fed): large, statistically significant pre-announcement drift, ~0.3–0.5% per event historically, concentrated in the 24h window and unexplained by standard risk factors; robust across decades and absent around other macro releases.

**Works / fails.** Works as a persistent structural anomaly; small sample per year (8 events) means any decade can disappoint. Post-2022 hiking-cycle behavior was consistent with the pattern.

**Backtesting notes.** Simple to test: event dates + intraday data. Check whether the edge is in the overnight portion or the announcement-day morning in the current era.

**Variations.** "Don't fight the Fed" post-meeting trend-following (trade the first post-FOMC day's direction); ECB/BoJ analogs (weaker documentation); options straddle pre-statement (vol selling post-release).

---

## S73 · CPI Release Momentum

**Market:** ES/NQ, gold, DXY pairs · **Timeframe:** M1–M15, 13:30 UTC monthly · **Style:** Event momentum · **Evidence:** Grade B (inflation-release impact literature; practitioner systems)

| Win rate | Typical RR | Key variable | Style | Session |
|---|---|---|---|---|
| 50–60% (filtered) | 1.5–2:1 | Surprise magnitude | Post-release momentum | 13:30 UTC+ |

**Concept & edge.** CPI has rivaled NFP as the macro event of the current era. The momentum playbook: the 5–15 minute post-release direction on genuine surprises persists into the session — inflation surprises reprice rate expectations, and that repricing takes hours, not seconds.

**Setup.** CPI calendar; consensus core/headline; 10Y yield as confirmation gauge.

**Entry rules.** Wait for the first 5 minutes. If the surprise is genuine (core 0.1%+ off consensus) and the 5-min range direction aligns with the yield move, enter on the first pullback in that direction. No alignment = no trade.

**Exit rules.** Stop at the post-release range midpoint. Targets 1.5–2R; hold into the afternoon on strong repricing days. Flat by close.

**Risk management.** CPI day whipsaws (the "second move" at 14:00–15:00) stop out early entries — the 5-minute wait is the defense. Risk 0.5–0.75%.

**Backtest evidence.** Rate-expectation repricing research supports multi-hour post-CPI drift on surprises; practitioner filtered systems: 50–60% win rates at 1.5–2:1. Unfiltered first-minute entries show the same spread/slippage decay as NFP straddles.

**Works / fails.** Works on genuine surprises in rate-sensitive regimes (2022–2025-style). Fails in low-inflation-salience eras (CPI becomes a non-event) and on in-line prints.

**Backtesting notes.** Same surprise-database method as S71. Gold and DXY often give cleaner CPI signals than equities — test all three.

**Variations.** PPI variant; the "CPI week" drift (post-CPI direction persists 1–3 days in strong regimes); yield-confirmation-only filter.

---

## S74 · Rate-Decision Straddle-to-Trend (CB Events)

**Market:** EUR/USD (ECB), USD/JPY (BoJ), GBP/USD (BoE) · **Timeframe:** M5–H1, decision day · **Style:** Event straddle + presser trend · **Evidence:** Grade B (central-bank announcement literature)

| Win rate | Two phases | Key insight | Style | Risk |
|---|---|---|---|---|
| 45–60% | Decision spike + presser repricing | The presser is the real event | Two-stage | High |

**Concept & edge.** Rate decisions are two events: the statement (instant spike, often fake) and the press conference 30–45 min later (the real repricing, when guidance is parsed). The documented pattern: initial spikes reverse as often as they hold; presser-driven moves trend. Trade stage two, not stage one.

**Setup.** Decision calendar; statement text vs expectations; presser start time. M5 chart.

**Entry rules.** Stage one: stand down (or tiny straddle only with excellent execution). Stage two: as the presser establishes direction (first 10–15 min), enter with the developing M5/M15 trend on pullbacks.

**Exit rules.** Stage two: trail M15 swings; target 1.5–2R; hold into the session close on strong guidance shifts.

**Risk management.** BoJ decisions (lunch-time drops, intervention risk around them) are the wildest — halve size. ECB pressers reverse mid-sentence; hard stops always. Risk 0.5%.

**Backtest evidence.** Central-bank communication research documents that guidance (presser) content moves markets more than the rate decision itself in the modern era — supporting the stage-two focus. Practitioner two-stage systems: 45–60% win rates, with stage-one-only variants materially worse.

**Works / fails.** Works on guidance-shift meetings. Fails on fully-telegraphed meetings (nothing to reprice — chop) and with impatient stage-one entries.

**Backtesting notes.** Hard to backtest stage two mechanically (requires presser timestamps and NLP for full rigor); approximate with "direction established 45 min post-statement" and test.

**Variations.** "Central bank divergence" multi-day version (trade the pair whose banks are moving oppositely); FOMC-minutes day variant (milder same-structure).

---

## S75 · Earnings Gap Fade (Stocks)

**Market:** Liquid US stocks post-earnings · **Timeframe:** Daily open → intraday · **Style:** Event gap mean reversion · **Evidence:** Grade A (4-year, 5-stock systematic backtest 2022–2025; 476–666 trades/stock)

| Win rate | Profit factor | Return (4y) | Max DD | vs Buy-hold |
|---|---|---|---|---|
| 36–48% | 1.11–1.50 | +80% to +113% | 9–31% | Beat B&H on all 5 tested names |

**Concept & edge.** Earnings gaps are emotional overreactions that partially retrace during the session. The documented parameters: gap ≥ 1%, wait 3 candles after the open, trade the fill direction with 5% TP / 2% SL, forced close near session end. On COIN: +113% vs buy-and-hold −9% over four years.

**Setup.** Earnings calendar; gap filter ≥ 1%; 1-min execution chart; both directions.

**Entry rules.** After 3 one-minute candles post-open, enter in the fill direction (short gap-ups, long gap-downs). Liquid, gap-prone names only (the study: COIN, CCL, UPST, FCEL, OKTA).

**Exit rules.** TP 5%, SL 2%, or forced exit near the close. The wide TP/tight SL explains the low win rate — the system wins on asymmetry (2.5:1 RR).

**Risk management.** Earnings gaps can run 20–30% (UPST) — the stop is survival. Slippage on the open is real; the study itself flags execution speed as make-or-break. Risk 0.5–1%.

**Backtest evidence.** Jan 2022–Dec 2025: COIN 666 trades, 40.4% WR, PF 1.15, +113%; CCL 476 trades, 47.9% WR, PF 1.24, +100%; OKTA 165 trades, 41.8% WR, PF 1.50, +90.5%, DD only 9.4%; FCEL +79.9%; UPST +98%. All beat buy-and-hold, including on names whose B&H was −60 to −94%.

**Works / fails.** Works on high-beta, retail-heavy, gap-prone stocks. Fails on low-gap mega caps (no signals) and when the gap is a genuine re-rating (index inclusion, M&A).

**Backtesting notes.** The published parameters are illustrative, not optimal — re-optimize TP/SL per name. Include delisted names to dodge survivorship bias; model 200–500ms execution delay.

**Variations.** Fade only gaps > 3% (stronger overreaction); VWAP-confirmation entry; PEAD (post-earnings-announcement drift) is the *opposite* documented anomaly — test both directions per name and keep what's true.

---

## S76 · Earnings Gap-and-Go (Momentum Side)

**Market:** Large/mid-cap stocks · **Timeframe:** M5–M15, open + 2 hours · **Style:** Event momentum · **Evidence:** Grade B (PEAD literature — post-earnings drift is academically robust; intraday version practitioner-documented)

| Win rate | Typical RR | Filter | Horizon | Style |
|---|---|---|---|---|
| 45–55% | 1.5–2.5:1 | Surprise quality + guidance | Intraday → multi-day | Momentum |

**Concept & edge.** Post-earnings-announcement drift (PEAD) is one of academia's most replicated anomalies: stocks with genuine earnings surprises keep drifting in the surprise direction for days. The intraday version trades the first hours of that drift in the highest-quality gap-ups/downs.

**Setup.** Earnings reaction quality: surprise size, guidance, conference-call tone, RVOL, and — critically — the stock holding its gap through the first 30–60 minutes.

**Entry rules.** Long: gap up > 4% on beat-and-raise, first hour holds above VWAP, enter on the first M5/M15 consolidation break upward. Short: mirror on miss-and-cut.

**Exit rules.** Stop below the opening consolidation (or VWAP). Targets: prior all-time/swing levels, or trail M15 swings. The PEAD literature supports holding 1–5 days for the full drift.

**Risk management.** The gap that can't hold VWAP is not a gap-and-go — it's S75's fade. Let the first hour classify the event. Risk 0.75–1%.

**Backtest evidence.** PEAD is documented across decades and markets (surprise-sorted drift, significant for weeks post-event). Intraday continuation systems on beat-and-raise large-caps: 45–55% win rates at 1.5–2.5:1 in practitioner tests.

**Works / fails.** Works in earnings season on liquid names with clean stories. Fails in macro-panic tapes (stock-specific news drowns) and on crowded high-short-interest names (squeeze mechanics distort signals).

**Backtesting notes.** You need historical surprise/guidance data to filter honestly; price-only backtests of "all big gaps" mix S75 and S76 populations and teach you nothing.

**Variations.** Multi-day PEAD swing version (hold 3–10 days); sector-sympathy plays (trade the laggard peer); options-defined-risk version.

---

## S77 · Weekend Gap Monday Fade (Forex & Crypto)

**Market:** Forex majors (Sunday open), BTC/ETH · **Timeframe:** Sunday/Monday session · **Style:** Gap mean reversion · **Evidence:** Grade B (weekend-gap statistics; practitioner backtests)

| Win rate | Typical RR | Frequency | Best conditions | Style |
|---|---|---|---|---|
| 55–70% (small gaps) | 0.8–1.2:1 | ~weekly | Quiet weekends, small gaps | Gap fill |

**Concept & edge.** Forex closes Friday and reopens Sunday; weekend headlines gap the open. Like equity gaps (S06/S07), *small* forex weekend gaps fill at high rates while large gaps (real news) trend. Crypto never closes, but its Monday-morning "CME gap" (BTC futures close Friday) creates a famous analogous magnet.

**Setup.** Friday close vs Sunday open; gap-size classification (< 0.3% small, > 0.8% large for majors). For CME-gap: Friday CME close vs Sunday futures reopen level.

**Entry rules.** Small gap + no weekend-breaking news: enter toward the Friday close at the Sunday open (or after the first 15–30 minutes for confirmation). Large gaps: stand down or trade *with* them.

**Exit rules.** Target: gap fill (Friday close). Stop: 1× gap size beyond the open. Time stop: by Monday NY lunch.

**Risk management.** Weekend geopolitical shocks (wars, exchange hacks for crypto) gap *and keep going* — the news filter is not optional. Risk 0.5–0.75%.

**Backtest evidence.** Practitioner gap statistics: small forex weekend gaps fill ~55–70% of the time; CME-gap folklore has partial statistical support (gaps "fill" frequently simply because BTC revisits most levels eventually — be precise about causality in your own test).

**Works / fails.** Works on quiet weekends with positioning-driven gaps. Fails on genuine weekend news and in crisis regimes (Sunday opens gap repeatedly in one direction).

**Backtesting notes.** Bucket results by gap size and by weekend-news flag; the size threshold where fill rate collapses is your trading line. For CME gaps, define "fill" rigorously (touch within 48h, not eventually).

**Variations.** Trade the fill in two stages (half at open, half at midpoint); CME-gap + funding combo; Monday-Asia momentum instead (S52) when the gap is large.

---

# Part VIII — Seasonality & Calendar Strategies

Calendar effects are the oldest documented anomalies — and the most honest ones, because the rules are public and decades of data are free. Several (turn-of-month, Halloween) are among the statistically strongest edges in this book. They trade infrequently; treat them as overlays, not meal tickets.

## S78 · Turn of the Month Effect

**Market:** S&P 500 (global: 19 of 20 markets documented) · **Timeframe:** ~4 days/month · **Style:** Calendar anomaly · **Evidence:** Grade A (multiple academic studies; S&P futures 1980–2024 replication)

| Annual capture | Exposure | Max DD | Global robustness | Significance |
|---|---|---|---|---|
| ≈ B&H minus 0.89% | ~4 days/month (~16%) | ~20% | 19/20 countries | "Only calendar effect statistically & economically significant" (study conclusion) |

**Concept & edge.** Own the index only from the last trading day of the month through the first ~3–4 days of the new month. Fund flows (401k contributions, month-end rebalancing, salary cycles) concentrate buying at the month boundary. Historically, this ~16% exposure captured nearly the entire market return.

**Setup.** Trading calendar. Entry: close of the day before month-end (some variants: last trading day close).

**Entry rules.** Buy at the close before month-end.

**Exit rules.** Sell at the close of the 3rd trading day of the new month (variants: 4 days).

**Risk management.** Exposure is tiny; risk per window is a bad macro week at month-end. Size as an overlay; combine with other systems using the freed capital.

**Backtest evidence.** 1980–2024 S&P replication: the 4-day/month equity curve nearly matched all-other-days' total return, with max DD ~20%. The cited academic study found turn-of-month the *only* persistent, economically significant calendar effect in S&P futures; a 2014 study confirmed it in 19 of 20 countries.

**Works / fails.** Works on equity indices globally. Fails (mildly) in regimes where month-end flows turn negative (forced liquidations cluster at month-end too — 2008).

**Backtesting notes.** One of the easiest tests in this book (daily data, 10 lines). Test window variants (−1 to +3, −2 to +2, last day + first 4) and index variants (SPY, QQQ, IWM, international ETFs).

**Variations.** "Turn of month + RSI(2) oversold" (quality overlay); QQQ-only version; deploy freed capital into S53 funding arb for a combined return stream.

---

## S79 · Halloween Indicator (Sell in May)

**Market:** S&P 500, Russell 2000 · **Timeframe:** 6-month rotation · **Style:** Seasonal allocation · **Evidence:** Grade A (Dzhabarov & Ziemba, LSE Systemic Risk Centre; Fidelity/CFRA 1945–2026 data)

| S&P 500 result | Russell 2000 result | Nov–Apr avg | May–Oct avg | Period |
|---|---|---|---|---|
| SIM $9.28 vs B&H $6.71 (+38%) | SIM $12.61 vs B&H $6.67 (+84–89%) | ~7% | ~2% (negative since 1990 segment) | 1993–2019 study; 1945–2026 stats |

**Concept & edge.** November–April historically delivers ~7% average S&P gains vs ~2% for May–October. Going to cash (or defensive sectors) May–October beat buy-and-hold by ~38% (S&P) and ~84–89% (Russell 2000) in the 1993–2019 futures study — with *lower* volatility.

**Setup.** Calendar: exit on the first trading day of May; re-enter on the 6th trading day before the end of October.

**Entry/exit rules.** Long Nov 1st-ish → May 1st; flat (or defensive rotation) May → late October.

**Risk management.** This is allocation, not trading: the risk is opportunity cost in strong summers (2017–2019 showed SIM ≈ B&H, statistically indistinguishable in hot streaks). Election-year summers historically perform better.

**Backtest evidence.** Ziemba study (futures, 1993–2019, one-tail p ≈ 0.05 S&P, p = 0.03 Russell): SIM beat B&H by 0.5×–2× final wealth with lower risk. Fidelity/CFRA (1945–2026): Nov–Apr ~7% vs May–Oct ~2%; cyclicals outperform in the strong half, defensives in the weak half.

**Works / fails.** Works as a long-run tilt. Fails in strong-summer years and the effect weakens if over-crowded; best treated as a defensive rotation signal rather than all-cash.

**Backtesting notes.** Test sector-rotation variant (cyclical ↔ defensive swap) vs full cash. Note the study's election-year interaction.

**Variations.** Sell-in-May for crypto (untested rigorously — your research project); defensive-half = TLT/gold instead of cash; "Stay in May when above 200-SMA" hybrid.

---

## S80 · Day-of-Week Effects (Monday/Friday)

**Market:** S&P 500, forex, BTC · **Timeframe:** Daily · **Style:** Calendar tilt · **Evidence:** Grade A/B (classical calendar literature; QuantifiedStrategies monthly/day tables)

| Pattern | Strength | Best use | Status | Data |
|---|---|---|---|---|
| Monday weakest / Friday strong (classical); Wednesday–Friday best gap-fade days (documented) | Modest, regime-shifting | Overlay filter | Partially arbed, still useful | 1960+ daily data |

**Concept & edge.** Classical day-of-week effects (Monday weakness, Friday strength) have faded as standalone trades but remain useful as *conditional* filters: the documented gap-fade statistics (S06) show Wednesday–Friday systematically outperforming Monday–Tuesday, and the Turnaround Tuesday edge (S08) is the refined descendant of Monday weakness.

**Setup.** Day-of-week tagging on any daily dataset.

**Entry rules.** As overlay: bias mean-reversion longs to Monday-Wednesday weakness windows; bias momentum longs to Thursday–Friday; avoid initiating short mean-reversion trades on strong calendar days.

**Exit rules.** N/A (overlay).

**Risk management.** Day-of-week edges are second-order — never size up on calendar alone.

**Backtest evidence.** Documented S&P monthly/day tables (1960+): April/December strongest months (72–73% up), September worst (45% up, PF 0.66); gap-fade day-of-week table: Wednesday +22.7% cumulative vs Monday +12.1% over the study. Friday gap-fades: steadiest equity curve of the week.

**Works / fails.** Works as a Bayesian prior layered on other strategies. Fails as a standalone system (edges are small and unstable across regimes).

**Backtesting notes.** Always check day-of-week interaction when building any daily strategy — if your system's P&L concentrates in one weekday, you need to know why.

**Variations.** Monthly-effect overlay (avoid fresh longs in September; press in November/December); crypto day-of-week (S51's weekend effect is the crypto version).

---

## S81 · First Trading Day of the Month

**Market:** S&P 500 · **Timeframe:** Daily · **Style:** Calendar anomaly · **Evidence:** Grade B (calendar literature; related to turn-of-month flows)

| Pattern | Mechanism | Strength | Use | Data |
|---|---|---|---|---|
| First trading day historically strong | Monthly inflows hit on day 1 | Moderate | Overlay/day trade bias | Decades of daily data |

**Concept & edge.** New-month inflows (retirement contributions, fund deployments) hit on the first trading day, giving it a historically positive skew — the flip side of the turn-of-month window (S78). Day traders use it as a directional prior for the first session of the month.

**Setup.** Calendar; SPY/ES intraday chart on the first trading day.

**Entry rules.** Intraday: bias longs (ORB longs, VWAP-pullback longs) on the first trading day, especially after a weak month-end. Standalone: buy the open, sell the close (weak but positive historically).

**Exit rules.** Session close.

**Risk management.** First-day-of-month also carries ISM/PMI releases at 15:00 UTC — event risk embedded in the calendar edge. Normal sizing.

**Backtest evidence.** Calendar research documents the first trading day's positive skew (a component of the broader turn-of-month window's strength); day-trader replication shows the effect clearest in the morning session.

**Works / fails.** Works in normal flow regimes. Fails when month-start macro data shocks (the ISM window) or in distribution regimes.

**Backtesting notes.** Separate the first trading day's return from the full turn-of-month window to see what it contributes in the current era.

**Variations.** First-day + month-end-weakness combo (stronger prior); first Friday (NFP) excluded version.

---

## S82 · Power Hour Momentum (Final Hour)

**Market:** SPY, QQQ, ES · **Timeframe:** 15:00–16:00 ET · **Style:** Intraday session momentum · **Evidence:** Grade B/A (intraday momentum literature — S27's academic base covers this window)

| Win rate | Typical RR | Best days | Mechanism | Style |
|---|---|---|---|---|
| 55–62% (trend days) | 0.8–1.2:1 | Strong trend days | MOC flow + short covering | Final-hour continuation |

**Concept & edge.** The last hour concentrates closing flows: MOC orders, ETF rebalancing, day-trader flattening, short covering. On established trend days, the final hour continues the day's direction with documented predictability (the first-half-hour → last-half-hour academic link).

**Setup.** By 14:30 ET: classify the day (trend vs range — VWAP slope, % of bars above VWAP). M5 chart for execution.

**Entry rules.** Trend-day long: enter 15:00–15:30 ET on an M5 pullback hold above VWAP, in the day's direction. Target: close. Range days: stand down or play the return-to-VWAP version.

**Exit rules.** MOC exit (the point is the closing flow). Stop: M5 structure against the trade.

**Risk management.** The last hour also carries reversal risk on failed trend days (the 15:50 "reversal window") — if the day's leaders break VWAP at 15:00, flip bias fast. Risk 0.5%.

**Backtest evidence.** Academic intraday-momentum results (first half-hour predicts last, R² rising with volatility) cover the final window; practitioner power-hour systems: 55–62% continuation on classified trend days.

**Works / fails.** Works on high-conviction trend days, expiry Fridays (amplified flows). Fails on choppy days and when late news hits (Fed minutes at 14:00 ET days).

**Backtesting notes.** Condition everything on your day-type classifier; unconditioned last-hour returns are ~flat historically.

**Variations.** Closing-imbalance trading (NYSE publishes MOC imbalances ~15:50 — advanced); 15:50 reversal-scalp variant; options 0DTE version (defined risk).

---

## S83 · Overnight vs Intraday Split Trading

**Market:** SPY, QQQ, IWM · **Timeframe:** Daily decomposition · **Style:** Structural anomaly harvesting · **Evidence:** Grade A (academic overnight-return literature; multiple replications)

| Finding | Implication | Long-term result | Risk character | Style |
|---|---|---|---|---|
| ~All long-term S&P gains accrue overnight; intraday ≈ flat | Hold overnight, avoid intraday | Overnight-only ≈ B&H with ~⅓ exposure | Gap risk concentrated | Decomposition strategy |

**Concept & edge.** Decompose returns: buy-and-hold = overnight returns + intraday returns. Research across decades shows the overnight component delivers essentially all of the index's long-run gain while the intraday component nets near zero. Owning only the overnight session (S09) is the trading expression; this page is the portfolio-level version.

**Setup.** Daily open/close data; decompose: overnight = open_t/close_{t−1}, intraday = close_t/open_t.

**Entry rules.** Portfolio version: hold index exposure overnight only (buy close, sell open) for the premium-harvesting variant. Trading version: prefer entering mean-reversion longs at the close (capturing overnight) rather than midday.

**Exit rules.** Sell at the open (MOO).

**Risk management.** Concentrated gap risk: single overnight events (−5% opens) land entirely on you. Size accordingly; avoid event nights (CPI/FOMC/earnings for single names).

**Backtest evidence.** Multiple academic replications (US and international): cumulative overnight returns dominate cumulative intraday returns over long samples, in some periods exceeding total returns (intraday negative). QuantifiedStrategies' published overnight edges (S09 stats: 60–77% WR, PF 1.5–4.0) are the filtered trading versions.

**Works / fails.** Works on equity indices (US strongest). The effect is weak/reversed in many other asset classes — test before assuming.

**Backtesting notes.** Produce your own cumulative overnight-vs-intraday chart for your instrument — it's the single most instructive chart in index trading research.

**Variations.** Weekend-overnight (Friday close → Monday open) as a separate bucket; single-stock overnight premium around earnings (avoid — different beast); combined with S78 turn-of-month windows.

---

## S84 · Gold Session Rotation (Asia Accumulate / London-NY Distribute)

**Market:** XAU/USD · **Timeframe:** Session-based daily · **Style:** Session seasonality · **Evidence:** Grade B (gold market microstructure documentation; practitioner session statistics)

| Pattern | Asian session | London/NY session | Use | Style |
|---|---|---|---|---|
| Session-character split | Quieter, range-bound, accumulation character | Directional, volatile, distribution/breakout character | Session-appropriate tactics | Dual playbook |

**Concept & edge.** Gold's behavior splits by session more cleanly than most instruments: Asian hours (dominated by physical/jewelry demand flows) tend toward quiet accumulation ranges, while London/NY (COMEX dominance) drives the day's directional moves. Two different games — play each with its own rules.

**Setup.** Session clock (Asia 00:00–07:00 UTC, London 07:00–12:00, NY 13:00–21:00 UTC). Asian range marked for London reference.

**Entry rules.** Asia: range-fade tactics (S20 logic) at Asian-session extremes with RSI stretch. London/NY: breakout/continuation tactics (S19/S22 logic) using the Asian range and session VWAP as references.

**Exit rules.** Asia fades: midline, hard flat before London. London/NY breaks: 1.5R or session-close exits.

**Risk management.** Gold respects levels but wicks violently around US data (13:30 UTC) — flat or bracket-protected through releases. Risk 0.5–0.75% per tactic.

**Backtest evidence.** Practitioner session statistics consistently show gold's true range concentrating in London/NY hours, with Asian ranges forming meaningful reference levels for the later sessions (the same structural logic as S19's forex version, with COMEX open as the key catalyst window).

**Works / fails.** Works in normal macro regimes. Fails during Asian-hours shocks (PBoC gold policy, Middle East headlines at Asian open) and rate-decision days (all sessions trend).

**Backtesting notes.** Compute gold's range and directional bias by session over 2+ years; confirm the split exists in your data before deploying the dual playbook.

**Variations.** COMEX-open momentum (13:30 UTC) as a standalone; Asian-range breakout for London only when range < 0.5× daily ATR; gold/Silver relative session strength (S100 link).

---

## S85 · BTC Worst-Hours Short Window (03:00–04:00 UTC)

**Market:** BTC · **Timeframe:** Hourly · **Style:** Intraday seasonality (short side) · **Evidence:** Grade A (same Padyšák & Vojtko dataset as S50)

| Pattern | Hours | Counterpart | Use | Caution |
|---|---|---|---|---|
| Worst average hourly returns | 03:00–04:00 UTC | Long 21:00–23:00 (S50) | Short/hedge window | Weak in bulls, decay risk |

**Concept & edge.** The mirror of S50: the same peer-reviewed hourly analysis found BTC's *worst* (most negative/insignificant) returns concentrated in the 03:00–04:00 UTC window — late US evening, pre-Asia, the day's liquidity trough. A short-bias window completes the daily map.

**Setup.** Hourly UTC data; the twin windows: short-bias 03:00–04:00, long-bias 21:00–23:00.

**Entry rules.** Short BTC at 03:00 UTC, cover at 04:00–05:00 UTC. (Or use it defensively: never initiate spot longs during this window.)

**Exit rules.** Time exit. Strict.

**Risk management.** Shorting BTC in a structural bull market is fighting the tape: the edge is smaller than S50's and regime-dependent. Small size; better used as an execution-timing rule (avoid buying at 03:00–04:00) than an aggressive short.

**Backtest evidence.** Padyšák & Vojtko: 03:00 and 04:00 UTC were the worst-performing hours of the day in the 2015–2022 Gemini sample (no statistically *negative* hour, but these were closest); the paired long-window strategy delivered ~33% annualized — the short side is the weaker twin.

**Works / fails.** Works as a timing filter and in bear/neutral regimes as a short. Fails in bull runs (every hour is up) and as a primary system.

**Backtesting notes.** Same code as S50 with sign flipped — verify post-2022 persistence and exchange robustness before allocating real capital.

**Variations.** Paired daily rotation (long 21:00–23:00, short 03:00–04:00, flat otherwise); execution-timing-only usage (schedule your spot buys/sells around the windows).

---

# Part IX — Market-Neutral & Statistical Arbitrage

The most professional strategies in this book: edges that don't depend on market direction at all. They demand more infrastructure (two legs, hedge ratios, more data), but they're the closest thing to all-weather strategies — and the academic evidence base is strong.

## S86 · Pairs Trading (Cointegration)

**Market:** Stock pairs, ETF pairs · **Timeframe:** Daily (H1 possible) · **Style:** Statistical arbitrage · **Evidence:** Grade A (Gatev et al. lineage; Quantpedia-curated studies; Springer 2025 ETF study)

| Sharpe (documented) | Annual excess return | Beta | Key risk | Win profile |
|---|---|---|---|---|
| 0.8–1.4 (best studies) | Up to 16.4%/yr (Brazil study) | ≈ 0 (market neutral) | Pair breakdown | High WR, small gains |

**Concept & edge.** Two cointegrated assets share a long-run equilibrium; when the spread deviates > 2σ, short the outperformer / buy the underperformer and wait for reversion. Returns are uncorrelated with the market by construction — a true alternative return stream.

**Setup.** Screen pairs by cointegration (Engle-Granger/Johansen) on a *formation period*; estimate hedge ratio via OLS; compute spread z-score on a rolling 60-day window.

**Entry rules.** z > +2: short y, long hedge-ratio× x. z < −2: opposite. Only trade pairs validated out-of-sample.

**Exit rules.** Exit at z crossing ±0.5. Stop-loss at |z| > 4 (relationship breaking). Time stop 20–30 days.

**Risk management.** Documented killers: in-sample overfitting (formation/trading split is mandatory), transaction costs eating the small per-trade edge, borrow costs on the short leg, and permanent pair breakdown on corporate events (exit, don't average, on fundamental news).

**Backtest evidence.** Brazil 2005–2012 cointegration portfolio: 16.38%/yr excess, Sharpe 1.34, low market correlation. ETF study (2025): dynamic monthly selection + VIX regime overlay → Sharpe 0.81, beta −0.14, alpha 12.8%, vs static pairs mostly flat-to-negative — *selection and regime handling are the edge*, not the z-score trigger. UK study: returns largely explained after risk/liquidity controls — honest tempering.

**Works / fails.** Works on sector peers (HYG/JNK, BND/AGG documented stable), same-industry stocks. Fails on lookalike-but-unrelated pairs (QQQ/XLK documented: −10.3%, 21.8-yr DD recovery!) and in structural regime breaks.

**Backtesting notes.** Formation/trading split, rolling re-estimation, costs, borrow, delisting handling. The 860,000-pair persistence study found cointegration is *not* persistent year-to-year — re-select pairs periodically.

**Variations.** Partial cointegration (S87 — stronger); distance-method (Gatev original, simpler); intraday H1 pairs on sector ETFs.

---

## S87 · Partial Cointegration Pairs (PCI)

**Market:** Stock pairs (Italian market study; generalizable) · **Timeframe:** Daily · **Style:** Advanced stat-arb · **Evidence:** Grade A (LUISS thesis replicating Clegg-Krauss PCI; out-of-sample tested)

| Sharpe | Cumulative return | vs Classical cointegration | Trades | Max DD |
|---|---|---|---|---|
| 1.38 (portfolio OOS) | 53.15% (≈3 yrs) | Classical: ~0 Sharpe in same tests | ~10/yr | −8.2% |

**Concept & edge.** Classical cointegration assumes the spread is purely mean-reverting — false when a permanent random-walk component hides inside. PCI (Clegg-Krauss) uses a Kalman filter to separate the mean-reverting part from the random-walk part and trades only the former. Result in the published replication: Sharpe 1.38 vs ~0 for the classical approach on identical data.

**Setup.** Two-stage: estimate PCI parameters on training data; Kalman-filter the residual to isolate the mean-reverting component; z-score it.

**Entry rules.** Long the spread when the mean-reverting component < −1σ_M; short when > +1σ_M. Pair selection filters: AR coefficient 0.5–0.8, mean-reversion variance share > 50%, hedge ratio 0.75–1.25.

**Exit rules.** Close at ∓0.5σ_M crossing.

**Risk management.** The thesis itself warns: two-pair concentration was a weakness — run 5+ qualified pairs. Event-risk exit rule identical to S86.

**Backtest evidence.** Out-of-sample: SRG-TRN +23.6%, HER-TRN +85.7%; portfolio 53.15% cumulative vs benchmark 25.15%; Sharpe 1.38 vs 0.51; max DD −8.2%; Sortino 2.14. Simulated robustness: PCI Sharpe distribution centered ~1, classical ~0.

**Works / fails.** Works wherever classical pairs *almost* work (spreads with hidden permanent components — most real pairs). Fails with the same event-risk and selection fragility, plus model complexity risk.

**Backtesting notes.** This is a genuine quant build (Kalman filter, PAR model selection via AIC). The payoff: it's one of the few published upgrades that *dominates* its classical parent out-of-sample.

**Variations.** Sector-constrained pair universe; ETF-pair PCI; crypto-pair PCI (BTC/ETH-adjacent alts — your research frontier).

---

## S88 · Sector ETF Pairs (Documented Winners & Losers)

**Market:** US sector/bond ETFs · **Timeframe:** Daily · **Style:** ETF stat-arb · **Evidence:** Grade A (Springer 2025 study — unusually honest: publishes losers too)

| Best pairs | Worst pairs | Portfolio Sharpe | Overlay | Lesson |
|---|---|---|---|---|
| HYG/JNK (+1.6%, Sharpe 0.52, DD −0.08%), BND/AGG (Sharpe 0.19) | QQQ/XLK (−10.3%), XME/PICK (−11.4%), SLV/GLD (−0.1%) | 0.81 (dynamic + VIX overlay) | Volatility-regime switch | Stable pairs are boring pairs |

**Concept & edge.** The tradable pairs aren't the famous ones. High-yield-bond twins (HYG/JNK) and aggregate-bond twins (BND/AGG) are nearly identical instruments — tiny, reliable divergences. Famous "logical" pairs (gold/silver miners, QQQ/XLK) documented as portfolio poison. Add the study's killer feature: a VIX z-score > 2 overlay that *switches to momentum* during vol spikes, converting crash drawdowns into profit.

**Setup.** Monthly dynamic pair selection from the ETF universe; z-score 2 entry / 0.75 exit; VIX 5-day SMA z-score as the regime gate.

**Entry rules.** Equal-share (or beta-adjusted) spread entries at |z| > 2 on selected pairs; max 5 concurrent pairs.

**Exit rules.** |z| < 0.75 exit. Regime override: when VIX z > 2, flip from fade-the-spread to trade-the-divergence.

**Risk management.** Published DDs are tiny on the good pairs (−0.08%!) — the risk concentrates in selection turnover and the regime flip. Equal-weight across pairs; monthly re-selection.

**Backtest evidence.** Dynamic portfolio: Sharpe 0.81, alpha 12.8% (significant), beta −0.14, correlation −0.18 to SPY; the VIX overlay worked in 2015/2018/2020/2022 stress windows. Static famous pairs: mostly negative or flat — read the losers table before choosing yours.

**Works / fails.** Works on near-duplicate instruments (same index, different issuer) and genuinely-linked sectors. Fails on thematically-related-but-different pairs — the study's central warning.

**Backtesting notes.** Replicate the loser analysis first: if you understand *why* QQQ/XLK fails (drifting mega-cap weights), you'll never force a bad pair again.

**Variations.** Leveraged-ETF twins; cross-listing pairs (same company, two exchanges); the VIX-overlay concept ported to S86/S87.

---

## S89 · Perp–Spot Basis Trade (Term Structure)

**Market:** BTC/ETH dated futures vs spot, perps · **Timeframe:** Days–weeks holds · **Style:** Basis arbitrage · **Evidence:** Grade B/A (standard futures basis literature applied to crypto; exchange-published basis data)

| Typical annualized | Risk | Capacity | Best regime | Structure |
|---|---|---|---|---|
| 5–20% (calm) to 40%+ (euphoria) | Low (execution/counterparty) | Large (institutional) | Contango expansions | Cash & carry |

**Concept & edge.** Dated futures trade at a premium (contango) in bullish regimes. Buy spot, short the future, lock the basis as yield at convergence. Unlike funding arb (S53), the yield is *fixed at entry* — the most bond-like trade in crypto.

**Setup.** Spot + futures accounts; basis monitor (annualized premium = (F−S)/S × 365/days).

**Entry rules.** When annualized basis exceeds your threshold (e.g., > 10% after costs): buy spot, short equal-notional future. Hold to expiry (or roll).

**Exit rules.** Convergence at expiry closes naturally. Early exit if basis compresses early (take the yield early and recycle).

**Risk management.** Margin on the short leg through adverse mark-to-market (the basis can widen before converging — 2021 saw 40%+ premiums); exchange counterparty risk; liquidation discipline identical to S53.

**Backtest evidence.** Historical annualized bases: 5–15% in calm regimes, 20–40%+ in 2021/2024-style euphoria; basis harvest is a documented institutional strategy (it's why CME open interest explodes in bull markets).

**Works / fails.** Works in contango regimes (most bull markets). Fails in backwardation (the trade inverts: short spot is hard/expensive) and on counterparty failure.

**Backtesting notes.** Basis history is publicly available; model margin interest, fees, and the funding differential if substituting perps for dated futures.

**Variations.** Calendar spread (long near future, short far future); cross-venue basis; tri-trade: basis + funding + staking yield stacking on ETH.

---

## S90 · Lead-Lag Correlation Trade (Correlated Assets)

**Market:** BTC↔COIN/MSTR, NQ↔mega-caps, gold↔miners · **Timeframe:** M1–M15 · **Style:** Cross-asset microstructure · **Evidence:** Grade B (lead-lag microstructure literature; practitioner systems)

| Win rate | Horizon | Signal | Requirement | Style |
|---|---|---|---|---|
| 55–65% (documented practitioner) | Seconds–minutes | Leader moves, laggard hasn't | Fast data on both | Latency-sensitive |

**Concept & edge.** Strongly-coupled assets don't move simultaneously: BTC moves first, crypto-equities (COIN, MSTR) follow seconds later; index futures lead their heaviest components; gold leads miners. Trading the laggard after the leader's move is one of the oldest prop-desk edges.

**Setup.** Two live feeds (leader + laggard); rolling correlation/beta; the leader's short-window return as the signal.

**Entry rules.** Leader moves ≥ threshold (e.g., BTC +0.3% in 1 min) while laggard hasn't moved proportionally: trade the laggard in the leader's direction. Exit when the laggard "catches up" (beta-adjusted).

**Exit rules.** Target: the beta-implied catch-up move. Stop: leader reverses through its trigger level. Time stop: 5–15 minutes.

**Risk management.** Decay is brutal: everyone sees the same lag, and the window shrinks yearly (HFT arbs it). Your feed speed relative to the marginal arbiter decides viability. Risk 0.25–0.5%.

**Backtest evidence.** Lead-lag effects are well documented in market-microstructure literature (futures lead stocks; ADRs lead/lag home markets; ETF leads components at short horizons). Practitioner BTC→COIN systems: 55–65% short-horizon win rates with tight targets.

**Works / fails.** Works during high-volatility leader moves (news, liquidations). Fails in quiet tape (lag compresses below costs) and for slow feeds.

**Backtesting notes.** Measure the lag structure first (cross-correlation at multiple horizons) — if the lag is < your round-trip latency, you don't have a trade, you have a donation.

**Variations.** ETF-vs-components basket version; ADR/home-market overnight version (no speed needed — time zones create the lag); sector-ETF leader vs laggard stock.

---

## S91 · Index Futures–ETF Basis Scalp

**Market:** ES vs SPY, NQ vs QQQ · **Timeframe:** Seconds–minutes · **Style:** Basis microstructure · **Evidence:** Grade C (institutional practice; retail-viable only with premium tools)

| Edge size | Hold | Requirement | Retail viability | Style |
|---|---|---|---|---|
| Basis points per trade | Seconds | Fast dual feed + low fees | Low-marginal | Pure arbitrage |

**Concept & edge.** Futures and their ETF shadow track the same index; transient basis dislocations (beyond fair-value bands) revert within seconds-minutes. Institutions arb this continuously; retail can only nick the wider, slower dislocations (open/close, volatility bursts).

**Setup.** Compute fair value continuously (futures price adjusted for carry/rates/dividends); plot the basis spread vs its normal band.

**Entry rules.** When the basis exceeds the normal band by a threshold covering your full round-trip costs: long the cheap leg, short the rich leg, equal beta.

**Exit rules.** Exit both at band re-entry (basis normalizes). Time stop: minutes. Never hold inventory.

**Risk management.** Legging risk (one leg fills, other moves) — use spread orders where possible. This strategy's real lesson for retail: understanding the basis tells you *which instrument is expensive* when you trade directionally. Risk small; edge per trade is bp-scale.

**Backtest evidence.** Institutional literature documents basis mean reversion within fair-value bands; retail-scale published results are essentially absent — treat as Grade C and primarily educational.

**Works / fails.** Works at opens/closes and vol bursts with fast infrastructure. Fails as a retail day-in-day-out system.

**Backtesting notes.** Requires synchronized tick data for both legs — most retail data isn't timestamp-aligned. If you can't verify alignment, results are artifacts.

**Variations.** Triple-witching expiry-basis plays; cash-index arb via options replication; educational use only: basis as an execution-cost signal for S14/S33 systems.

---

## S92 · Triangular Arbitrage (Forex) — Reality Check

**Market:** Forex crosses (EUR/USD × USD/JPY vs EUR/JPY) · **Timeframe:** Milliseconds · **Style:** Pure arbitrage · **Evidence:** Grade C — *included as an honest negative*

| Edge today | Era | Retail viability | Why included | Lesson |
|---|---|---|---|---|
| ~None for retail | Pre-2010s: real | ~Zero | Most-requested "risk-free" strategy | Latency IS the strategy |

**Concept & edge.** If EUR/USD × USD/JPY ≠ EUR/JPY (beyond costs), a three-leg loop locks riskless profit. It existed; banks and HFTs killed it with co-location. Documented reality: deviations now last milliseconds and are smaller than retail spreads.

**Setup (academic).** Compute the synthetic cross continuously; compare to the quoted cross; the loop executes all three legs simultaneously when deviation > costs.

**Entry rules.** N/A for retail — included so you stop looking for it in the wrong place.

**Exit rules.** N/A.

**Risk management.** The risk isn't market risk, it's fantasy risk: weeks building a system that was dead before you started. If you want the *transferable* version, see S90 (lead-lag) and S54 (cross-exchange funding) — same instinct, live edges.

**Backtest evidence.** Market-efficiency literature: triangular parity holds within transaction costs essentially continuously in modern electronic forex; historical studies show the opportunity window collapsed as electronic trading spread.

**Works / fails.** Works only with bank-grade co-location and prime-broker spreads. Fails everywhere else.

**Backtesting notes.** If you must verify: you need synchronized tick quotes for all three legs with your *actual* spreads — you'll find the deviation smaller than your costs, which is the answer.

**Variations.** Crypto-venue triangular loops (slightly more alive due to fragmented venues — still latency-gated); DEX triangular/cyclic arbitrage (real but MEV-bot-dominated).

---

## S93 · Liquidation-Cascade Reversal (Crypto Perps)

**Market:** BTC/ETH perpetuals · **Timeframe:** M1–M15 · **Style:** Forced-flow fade · **Evidence:** Grade B (liquidation data publicly documented; practitioner systems)

| Win rate | Typical RR | Signature | Data | Style |
|---|---|---|---|---|
| 55–65% (documented ranges) | 1.5–2:1 | Cascade + funding extreme + OI flush | Liquidation feed, OI, funding | Capitulation fade |

**Concept & edge.** Perp liquidations are *forced* market orders — pure price-insensitive flow. Cascades (clusters > $100M+ in an hour on majors) mark local extremes with documented regularity: when forced sellers are exhausted, price reverts. Unlike pattern-based reversals, this one has a mechanical driver you can watch in real time.

**Setup.** Liquidation feed (Coinglass-style), open interest, funding rate. Context: price down 3–5%+ fast, long liquidations spiking, OI dropping sharply (leverage flushed).

**Entry rules.** Long after a long-liquidation cascade when: liquidation rate peaks and declines, price prints a stall/reversal M5 candle, and OI has dropped (leverage gone). Enter on the reversal confirmation. Short: mirror on short-cascades (rarer, faster).

**Exit rules.** Target: retrace to the cascade's origin (or 50%). Stop below the cascade low. Time stop: a few hours.

**Risk management.** Cascades chain (one triggers another at the next liquidation shelf) — never catch the *first* flush candle; wait for exhaustion evidence. Funding at extreme positive readings adds confirmation for long-fades. Risk 0.5–1%.

**Backtest evidence.** Liquidation-cascade dynamics are documented in crypto-microstructure research (forced-flow impact, OI-reset behavior); practitioner fade systems on majors report 55–65% win rates at 1.5–2:1 with the exhaustion filter.

**Works / fails.** Works on majors with deep liquidation data. Fails in deleveraging *regimes* (multiple cascade waves over days — fade the first wave, respect the second) and on thin alts (data lies, wicks lie more).

**Backtesting notes.** Historical liquidation data is available (exchange APIs, aggregators); align cascade timestamps with price and measure forward returns — a genuinely novel dataset most retail backtests ignore.

**Variations.** Cascade + S49 sweep confluence; funding-extreme-only entries; OI-reset momentum continuation (trade *with* the post-flush trend instead).

---

# Part X — Gold, Oil & Commodity Intraday

Commodities trend better than equities and respect technical levels more violently. Gold and crude are the most liquid non-financial intraday vehicles on earth — with their own event calendars (EIA inventories), session personalities, and macro drivers. The published evidence here includes one of the cleanest open-source 5-minute systems available.

## S94 · Gold Pullback-Window (5-Minute System)

**Market:** XAU/USD · **Timeframe:** M5 · **Style:** Volatility-expansion pullback · **Evidence:** Grade A (open-source Backtrader project, 5-year verified backtest 2020–2025)

| Total return | Win rate | Profit factor | Max DD | Sharpe |
|---|---|---|---|---|
| +44.75% (5 yrs) | 55.43% | 1.64 | 5.81% | 0.89 |

**Concept & edge.** A 4-phase state machine: volatility-expansion channel signals the trend, then the system *waits for the pullback window* and enters on the breakout of the pullback — never chasing. ATR-based dynamic risk throughout. One of the rare fully-documented, code-available gold intraday systems with 175 trades over 5 years.

**Setup.** M5 XAU/USD; volatility-expansion channel; ATR(14) for stops/targets; 4-phase state logic (idle → trend detected → pullback window → entry).

**Entry rules.** Trend signal fires → wait for pullback into the channel zone → enter on the breakout of the pullback bar in the trend direction. ~3 trades/month — patience is coded in.

**Exit rules.** ATR-dynamic stop (initial ~1× ATR beyond pullback extreme); ATR-scaled targets; average win $1,187 vs average loss $913 (1.3:1 documented).

**Risk management.** The documented max DD of 5.81% comes from strict ATR sizing and low frequency — ~3 trades/month means losing streaks are survivable by design. Expectancy $251/trade documented.

**Backtest evidence.** July 2020–July 2025, $100k start: +44.75% total, 175 trades (97W/78L), PF 1.64, Sharpe 0.89, max DD 5.81%, ~8.95%/yr — with full code and metrics published for verification.

**Works / fails.** Works on gold's trending M5 structure in normal-to-high volatility. Fails in dead ranges (few signals — fine) and during headline whipsaws (the pullback window offers some protection).

**Backtesting notes.** The repo is a template for professional backtesting practice: state machine, dynamic risk, full metrics documentation. Clone it, verify it, then modify one variable at a time.

**Variations.** Port to silver (higher beta, wider ATR); H15 version for fewer-noise signals; add session filter (London/NY only).

---

## S95 · Gold London/NY Breakout

**Market:** XAU/USD · **Timeframe:** M15–H1 · **Style:** Session breakout (gold-tuned) · **Evidence:** Grade B (session-structure documentation; practitioner backtests)

| Win rate | Typical RR | Key windows | Reference levels | Style |
|---|---|---|---|---|
| 48–58% | 1.5–2:1 | London 08:00, COMEX 13:30 UTC | Asian range, pre-London range | Dual-session breakout |

**Concept & edge.** Gold's two ignition windows: the London open (physical/LBMA flows) and the COMEX open + US data window (13:30 UTC). Range breaks at these windows, referenced against the Asian range (S84), carry gold's most reliable intraday momentum.

**Setup.** Mark the pre-London range (Asian session) and the pre-COMEX range (London morning). ATR context; US calendar flagged.

**Entry rules.** London play: break of the Asian range after 07:30 UTC with M15 close confirmation. COMEX play: break of the London-morning range after 13:30 UTC, direction confirmed by DXY/yields if possible.

**Exit rules.** Stop at the opposite side of the reference range. Targets: 1.5–2× range height; trail H1 swings on strong days. Flat by NY afternoon.

**Risk management.** Gold wicks: require *close-based* triggers, not wick touches. On US data mornings, either wait 15 min post-release or switch to the S73 CPI playbook. Risk 0.5–0.75%.

**Backtest evidence.** Gold session-breakout practitioner backtests: 48–58% win rates at 1.5–2:1, with COMEX-window breaks outperforming London-only entries in recent high-rate-volatility years. Structurally identical to the documented London-breakout family (S19) with gold-specific tuning.

**Works / fails.** Works in rate-uncertainty regimes (gold trends). Fails in dead summer tape and on fake-out-heavy FOMC days (stand down or use S72).

**Backtesting notes.** Test the two windows separately — they have different drivers and may deserve different parameters. DXY correlation filter: measure its standalone value.

**Variations.** Asian-range fade in London (when range is wide); COMEX + data-surprise combined entry; weekly-range projection (Monday range → week).

---

## S96 · Safe-Haven Spike Fade (Gold/Silver)

**Market:** XAU/USD, XAG/USD · **Timeframe:** M15–H1 · **Style:** Headline-overreaction fade · **Evidence:** Grade C/B (event-fade logic; geopolitical-premium decay literature)

| Win rate | Typical RR | Trigger | Danger | Style |
|---|---|---|---|---|
| 55–65% | 1–1.5:1 | 1%+ headline spike stalling | Escalation (real) | Event fade |

**Concept & edge.** Geopolitical headlines spike gold instantly; when the event doesn't actually escalate (most cases), the fear premium decays within hours. Fading the stalled spike sells insurance back to the panicked.

**Setup.** News feed; M15 chart; spike size (> 1% or > 1.5× ATR(H1)) and, critically, *no follow-through headlines* for 30–60 minutes.

**Entry rules.** After the spike stalls (M15 lower high / failure to make new highs for 3+ bars), short with stop above the spike high. Only when the headline is rhetorical/anticipated, not kinetic escalation.

**Exit rules.** Target: 50–100% of the spike retrace. Time stop: end of session. If escalation headlines resume — out instantly, regardless of price.

**Risk management.** This is judgment trading: misreading a genuine escalation (invasion, strike) as rhetoric is catastrophic. Hard stop always; half size; skip if you can't watch the news feed live. Risk 0.5% max.

**Backtest evidence.** Geopolitical-risk-premium research documents rapid decay of event premiums when events don't escalate; practitioner spike-fade systems on gold: 55–65% win rates with strict stall-confirmation.

**Works / fails.** Works on rhetorical escalations, drills, diplomatic spats. Fails on true kinetic events and structural regime breaks (those spikes trend for days).

**Backtesting notes.** Nearly impossible to backtest honestly (headline classification is human). Forward-test with a news log: record headline, classification, outcome — build your own dataset.

**Variations.** Silver version (amplified both ways); fade via DXY instead (cleaner sometimes); pairs version: short gold / long silver on fear-spikes (ratio normalization, see S100).

---

## S97 · Crude Oil EIA Inventory Trade

**Market:** WTI (CL), Brent · **Timeframe:** M1–M15, Wednesdays 15:30 UTC · **Style:** Scheduled-event volatility · **Evidence:** Grade B (EIA-impact documentation; practitioner systems)

| Win rate | Typical RR | Frequency | Key detail | Style |
|---|---|---|---|---|
| 50–60% (filtered) | 1.5–2:1 | Weekly | API vs EIA divergence as pre-signal | Event momentum/fade |

**Concept & edge.** The weekly EIA inventory report is crude's NFP. Playbook: (1) the prior evening's API report previews direction — big API/EIA divergences get faded; (2) genuine surprise → first-15-minute direction persists. Structured, scheduled, weekly repetition makes it ideal for systematic practice.

**Setup.** API (Tue evening) and EIA (Wed 15:30 UTC) expectations; CL M5/M15; prior day's range.

**Entry rules.** Momentum case (genuine surprise vs expectations): enter with the first-5-minute direction on the first pullback. Fade case (in-line EIA but big API-driven pre-move): fade back toward pre-API levels.

**Exit rules.** Targets 1.5–2R; stop at the post-release range midpoint/extreme. Flat within 2 hours — inventory effects are fast.

**Risk management.** OPEC headlines override inventory data entirely — check the calendar. CL ticks are $10/contract: slippage hurts; size accordingly. Risk 0.5–0.75%.

**Backtest evidence.** Practitioner EIA systems: 50–60% win rates on classified setups; inventory-surprise impact on WTI is well documented in energy-market literature. Unclassified "trade every report" versions degrade toward breakeven after costs.

**Works / fails.** Works in inventory-driven regimes (balanced markets). Fails when macro (dollar, rates, OPEC) dominates oil pricing and on report-day technical glitches/delayed prints.

**Backtesting notes.** Build the surprise database (API, EIA consensus, actual, 5/15/60-min forward returns) — 52 events/year accumulate fast into a real edge map.

**Variations.** Refined-products (RBOB/HO) relative play; the "Wednesday range" as reference for the rest of the week; options straddle for defined risk.

---

## S98 · Crude Opening Range Momentum (CL)

**Market:** WTI futures (CL) · **Timeframe:** M5, first 30–60 min of NY · **Style:** Commodity ORB · **Evidence:** Grade B (ORB family; commodity-session documentation)

| Win rate | Typical RR | Best days | Reference | Style |
|---|---|---|---|---|
| 45–55% | 1.5–2:1 | Post-EIA, OPEC weeks, macro trends | First 30-min range | ORB variant |

**Concept & edge.** Crude's NY floor hours concentrate commercial hedging flow; the opening 30 minutes set the day's value area. CL trends harder than equity indices on macro days — its ORB skews more trend-day-friendly than ES's.

**Setup.** First 30-min range of the NY session (14:00–14:30 UTC summer); daily ATR and macro calendar as context.

**Entry rules.** Break of the 30-min range on M5 close with volume; trend-aligned preferred (above/below daily pivot or 20-day SMA).

**Exit rules.** Stop: opposite range edge. Targets: 1.5R and 2.5R with trail; CL trend days travel 2–3× the opening range regularly.

**Risk management.** CL's tick value makes stops expensive — use the micro (MCL) for accounts under $25k. Avoid range entries on EIA mornings (merge with S97 instead). Risk 0.5–0.75%.

**Backtest evidence.** Commodity-session studies document CL's trend-day frequency exceeding equity indices in macro-active years; ORB-family statistics (S14–S18) transfer with wider ranges and faster follow-through.

**Works / fails.** Works in OPEC/active-macro regimes. Fails in storage-report-driven chop and thin summer rebalancing periods.

**Backtesting notes.** Compare CL ORB stats by macro-regime buckets (contango/backwardation, OPEC meeting proximity) — regime conditioning matters more in commodities than equities.

**Variations.** 60-min range for fewer/cleaner signals; Brent/WTI spread as confirmation; overnight (Globex) range as the reference instead.

---

## S99 · Commodity Trend-Day Continuation (Second-Day Momentum)

**Market:** Gold, crude, silver, copper · **Timeframe:** Daily context → intraday entry · **Style:** Multi-day momentum · **Evidence:** Grade B/A (time-series momentum literature is *strongest* in commodities)

| Win rate | Typical RR | Evidence base | Hold | Style |
|---|---|---|---|---|
| 50–58% | 1.5–2:1 | TSMOM literature (Moskowitz et al.) | 1–3 days | Continuation |

**Concept & edge.** Time-series momentum — assets continue in their recent direction — is academically documented as *most reliable in commodities* (supply/demand adjustments are slow; inventory cycles persist). The intraday expression: after a big commodity trend day, trade next-day continuation with session-level timing.

**Setup.** Day 1: commodity closes directionally with range > 1.5× ATR(14). Day 2: use session structure (ORB, VWAP pullback) for entry timing in day-1's direction.

**Entry rules.** Day-2 entry on the first session pullback/consolidation break in day-1's direction (combine S23/S33 mechanics). No entry if day 2 opens with a full reversal gap.

**Exit rules.** Stop at day-2 structure. Targets: 1.5–2R or day-1 range projected. Time stop: 2–3 days.

**Risk management.** Commodity gaps (overnight limit moves in ags/energy) can jump stops — size with gap assumptions, not just stop distance. Risk 0.75–1%.

**Backtest evidence.** Moskowitz-Ooi-Pedersen time-series momentum: significant continuation across 58 instruments with commodities among the strongest; 1–12-month horizon canonical, with documented short-horizon (daily) persistence in energy and metals.

**Works / fails.** Works in supply-shock and macro-trend regimes (the 2021–2022 commodity run was a golden era). Fails in mean-reverting inventory-balanced markets.

**Backtesting notes.** Test on a *basket* of commodities (the literature's edge is cross-sectional + time-series combined). Single-market versions are noisier.

**Variations.** Weekly continuation (position-trading version); sector-basket confirmation (energy complex agrees); combine with S66's daily coil.

---

## S100 · Gold–Silver Ratio Mean Reversion

**Market:** XAU/USD vs XAG/USD (or GC/SI futures) · **Timeframe:** H4–Daily · **Style:** Cross-commodity stat-arb · **Evidence:** Grade B (ratio's historical behavior documented; practitioner systems)

| Win rate | Typical RR | Ratio context | Structure | Style |
|---|---|---|---|---|
| 55–65% (extreme readings) | 1.5–2:1 | Trade extremes, not mid-range | Long cheap leg / short rich leg | Metals pair |

**Concept & edge.** The gold/silver ratio oscillates in long waves (historically ~50–100+). At extremes, the metals converge: silver's higher beta overcorrects in both metals rallies and panics. Trading the ratio's extremes = pairs trading (S86) applied to the oldest monetary pair on earth.

**Setup.** Ratio = gold price / silver price; 2–5-year context; z-score or percentile of the ratio. Both legs executed (futures or CFDs).

**Entry rules.** Ratio at > 90th percentile of its 2-year range: short gold / long silver (betting compression). < 10th percentile: opposite. Enter progressively (⅓ now, ⅓ deeper, ⅓ at historical extreme).

**Exit rules.** Target: ratio return to its 1-year median. Stop: ratio exceeding the 5-year extreme (regime break). Time horizon: weeks — this is the book's slowest "intraday-adjacent" strategy.

**Risk management.** Ratio trends can run for months (2020's spike to 120+) — progressive entries and the 5-year-extreme stop are survival gear. Leg sizing by volatility parity (silver moves ~1.5–2× gold daily). Risk 0.75% per tranche.

**Backtest evidence.** Practitioner ratio systems at documented extremes: 55–65% win rates over multi-week holds; the ratio's long-run range-bound-then-regime character is well documented (dozens of public long-run charts/analyses).

**Works / fails.** Works at true extremes with patience. Fails mid-range (no edge — most traders' mistake) and during monetary-regime breaks (silver demonetization narratives, CB gold buying waves).

**Backtesting notes.** Use ratio percentile, not absolute levels (the "normal" ratio has drifted across eras — 15 in 1900, ~60 in 2000s, 80+ in 2020s).

**Variations.** Miner-based version (GDX/GDXJ or gold-miner/silver-miner pairs); platinum/palladium ratio as a second pair; options-structured version (ratio call/put spreads).

---

# Part XI — Appendices

## Appendix A · The Backtesting Blueprint (Code-Ready Checklist)

Use this exact workflow for every strategy page in this book. Skipping steps is how fake edges are born.

**1. Translate rules to pseudo-code first.** If any rule contains "strong", "clean", "obvious" or "good volume" — stop. Mechanize it (e.g., "strong" → body > 0.6 × ATR(14)). Unmechanizable rules can't be validated.

**2. Data discipline.** Use the resolution the strategy trades (M1 systems need M1 or tick data). Include delisted instruments where relevant (survivorship bias). Verify timezone handling — session strategies break on DST bugs more than any other single cause.

**3. Cost modeling (non-negotiable).** Per-instrument spread (time-varying if possible), commission, slippage (1–3 ticks stress test), borrow/funding for shorts and perps. Published disasters to remember: 3 pts of slippage turned a winning DAX ORB negative; 0.1% fees killed a viral 5-min crypto system.

**4. Validation stack.** In-sample optimize → out-of-sample verify → walk-forward re-optimize → paper trade 30 sessions. Demand: parameter *plateaus* (neighbor parameters also profitable), not peaks.

**5. Metrics that matter.** Expectancy per trade in R (target > +0.2R after costs); profit factor (> 1.3 viable); max drawdown (size for 1.5× backtested); exposure-adjusted return (CAGR ÷ time-in-market); trade count (> 100 minimum, > 300 preferred); losing-streak distribution (can you survive the 95th-percentile streak psychologically and financially?).

**6. Kill criteria (decide in advance).** E.g., "retire if live expectancy < 50% of backtested for 100 trades" or "retire if drawdown exceeds 1.5× backtested max". Written kill criteria prevent zombie strategies.

**Minimal Python skeleton.** pandas for bars; vectorized signal column; event loop for fills (next-bar open, never same-bar close unless you model MOC); costs subtracted per trade; metrics via quantstats. Every strategy in this book fits this skeleton.

## Appendix B · Generating New Strategies (The Research Loop)

This book's pages are starting points. The loop that created them works for you:

**1. Start from an anomaly, not an indicator.** Every durable edge here traces to a *behavioral or structural* cause: forced flow (liquidations, MOC), hedging pressure (overnight premium), calendar flows (turn-of-month), incentive structures (VWAP benchmark), or psychology (3-day panic). Ask "who is forced to trade, and why?" — that's where edges live.

**2. Measure the base rate before building entries.** P(up day | 3 down days, above 200 SMA) vs unconditional P(up day). P(gap fill | gap < 0.2%) vs size distribution. If the conditional base rate doesn't beat the unconditional by a wide margin, no entry trick will save the idea.

**3. Condition on regime.** Most strategies here are regime-conditioned (ADX gates, day-type classifiers, volatility percentiles, session windows). When your system fails, the first research question is "which regime filter would have prevented those trades?" — this loop is documented throughout the book (S30, S34, S45).

**4. Combine orthogonal edges.** The documented blends outperform: momentum + mean reversion (Sharpe 1.71 vs 1.0/2.3 alone, crypto study), IBS + RSI (78% vs 68% WR), ORB + daily filter (0.04% → 0.27% per trade). Orthogonality test: do the two signals fire on the same days? If yes, you have one signal, not two.

**5. Publish to yourself.** Log every test — including failures (like S41's Stochastic autopsy). A documented negative result saves you from re-testing the same dead idea every six months and teaches more than another cherry-picked winner.

## Appendix C · Risk Management Constants

- **Risk per trade:** 0.25–0.5% (scalping/high frequency), 0.5–1% (intraday), 1% max (low frequency). Never more because a setup "looks certain" — certainty is not a variable in expectancy math.
- **Daily loss limit:** 2–3R. Hit it, stop. Chop days punish persistence more than they reward it.
- **Portfolio heat:** max 4–6% total open risk; correlated positions count double (3 gold-longs = 1 position).
- **Sizing formula:** Position size = (equity × risk%) ÷ stop distance. The stop is set by the chart (structure/ATR), never by the size you want to trade.
- **Drawdown protocol:** at −10% equity, halve size; at −15%, stop and re-validate every live strategy against fresh data. Edges decay; regimes change; the protocol survives both.
- **Leverage ceiling (crypto/perps):** ≤ 3× on directional systems, ≤ 2–3× with collateral buffer on delta-neutral. Liquidation is not a stop loss — it's a fee plus a stop loss plus a margin call.

## Appendix D · Honest Notes on Evidence

- **Grade A** pages cite named published backtests, peer-reviewed papers, or books (Connors & Alvarez 2008; Crabel 1990; Faith 2007; Lucca & Moench; Padyšák & Vojtko 2022; Gao-Han-Li-Zhou intraday momentum; ScienceDirect 2025 funding-arb study; PMC 2023 turn-of-candle; Dzhabarov & Ziemba 2019; the 1.17M-trade ORB Setups study; the 14-year DAX study; QuantifiedStrategies' public backtest archive; the 2020–2025 XAU/USD open-source backtest; the 2022–2025 five-stock gap-fill study). Figures are quoted as published, with their sample periods.
- **Grade B** pages report consensus ranges from multiple practitioner/documented sources; no single authoritative study exists, and your own validation is expected.
- **Grade C** pages are frameworks used professionally with sparse public statistics; the numbers shown are hypotheses to test, not results to trust.
- **Every** number in this book is historical. Markets compete away published edges — assume decay, re-validate annually, and never risk money on a page you haven't personally re-tested. This book is for education and research; it is not financial advice.
