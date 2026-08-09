# Module 1 — Data Lake Quality Inspection Checklist Evidence

| Check ID | Description | Status | Evidence File |
|---|---|---|---|
| **A1.1** | All 20 pairs x 6 TFs queryable; 1y 15m query < 2s | PASS ✅ | [A1.1_timing_log.txt](file:///a:/Trade/docs/qa/module1/A1.1_timing_log.txt) |
| **A1.2** | Spot-check 5 random bars against Binance UI | PASS ✅ | [A1.2_spot_check.md](file:///a:/Trade/docs/qa/module1/A1.2_spot_check.md) |
| **A1.3** | Gap report per pair; total gap fraction < 0.5% | PASS ✅ | [A1.3_gap_report.md](file:///a:/Trade/docs/qa/module1/A1.3_gap_report.md) |
| **A1.4** | Resample unit test passes (hand-verified 5m/1h) | PASS ✅ | [A1.4_pytest_output.txt](file:///a:/Trade/docs/qa/module1/A1.4_pytest_output.txt) |
| **A1.5** | Nightly updater dry-run completes; 0 dupes (idempotent) | PASS ✅ | [A1.5_updater_job.log](file:///a:/Trade/docs/qa/module1/A1.5_updater_job.log) |
| **A1.6** | Validator runs with 0 hard failures | PASS ✅ | [A1.6_validation.json](file:///a:/Trade/docs/qa/module1/A1.6_validation.json) |
| **A1.7** | DuckDB views respond (`v_bars_1h` grouping) | PASS ✅ | [A1.7_duckdb_views_output.txt](file:///a:/Trade/docs/qa/module1/A1.7_duckdb_views_output.txt) |
| **A1.8** | Disk budget documented and recorded | PASS ✅ | [A1.8_disk_budget.md](file:///a:/Trade/docs/qa/module1/A1.8_disk_budget.md) |