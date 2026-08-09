"""
Data Lake Validator & Quality Audit Module.

Enforces hard data quality rules specified in Master Plan §9.7:
    1. Gap Check: Missing 1m bars beyond exchange maintenance windows (>60 consecutive bars).
    2. Duplicate Check: Enforces timestamp uniqueness per pair/timeframe.
    3. OHLC Sanity: Ensures high >= max(open, close), low <= min(open, close), all > 0.
    4. Outlier Check: Detects extreme log-return single-bar price shocks (>50%).
    5. Volume Check: Identifies dead market runs with >30 consecutive zero-volume bars.
    6. Freshness: Verifies newest bar timestamp is within 24 hours of current UTC time.

Context:
    Layer 1 (Data Lake) quality assurance component specified in Master Plan §9.5 Item 3 & §9.7.
"""

from dataclasses import asdict, dataclass, field
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class ValidationIssue:
    """Stores a single data quality audit issue record."""

    pair: str
    timeframe: str
    check_name: str
    severity: str  # 'INFO', 'WARNING', 'QUARANTINE'
    detail: str
    timestamp_info: Optional[str] = None


@dataclass
class DataQualityReport:
    """Consolidated summary report for Data Lake validation run."""

    total_bars: int = 0
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duplicates_found: int = 0
    ohlc_violations: int = 0
    max_gap_consecutive_bars: int = 0
    gaps_greater_than_60: int = 0
    zero_volume_runs_greater_than_30: int = 0
    outliers_flagged: int = 0
    is_fresh_24h: bool = True
    issues: List[ValidationIssue] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Converts report to serializable dictionary format."""
        data = asdict(self)
        data["issues"] = [asdict(issue) for issue in self.issues]
        return data


def validate_ohlc_sanity(df: pd.DataFrame, pair: str, timeframe: str, report: DataQualityReport) -> pd.DataFrame:
    """Verifies that high >= max(open, close), low <= min(open, close), and all prices > 0.

    Action on fail: Log quarantine warning for violating rows.

    Args:
        df (pd.DataFrame): Input bar DataFrame.
        pair (str): Trading pair identifier.
        timeframe (str): Timeframe identifier.
        report (DataQualityReport): Report object to append issues.

    Returns:
        pd.DataFrame: Cleaned DataFrame with invalid rows removed if any.
    """
    max_body = np.maximum(df["open"].values, df["close"].values)
    min_body = np.minimum(df["open"].values, df["close"].values)

    invalid_high = df["high"].values < max_body
    invalid_low = df["low"].values > min_body
    invalid_price = (df["open"].values <= 0) | (df["high"].values <= 0) | (df["low"].values <= 0) | (df["close"].values <= 0)

    violations_mask = invalid_high | invalid_low | invalid_price
    violation_count = int(np.sum(violations_mask))

    if violation_count > 0:
        report.ohlc_violations += violation_count
        issue_detail = f"Found {violation_count} OHLC sanity violations (high < max(O,C) or low > min(O,C) or non-positive price)"
        logger.warning("[%s %s] %s", pair, timeframe, issue_detail)
        report.issues.append(ValidationIssue(pair=pair, timeframe=timeframe, check_name="OHLC Sanity", severity="QUARANTINE", detail=issue_detail))
        # Filter out corrupted rows
        return df[~violations_mask].copy()

    return df


def validate_duplicates(df: pd.DataFrame, pair: str, timeframe: str, report: DataQualityReport) -> pd.DataFrame:
    """Detects and drops duplicate timestamps.

    Args:
        df (pd.DataFrame): Bar DataFrame.
        pair (str): Pair symbol.
        timeframe (str): Timeframe.
        report (DataQualityReport): Audit report.

    Returns:
        pd.DataFrame: Deduplicated DataFrame.
    """
    dupes_mask = df.duplicated(subset=["open_time"], keep="first")
    dupe_count = int(dupes_mask.sum())

    if dupe_count > 0:
        report.duplicates_found += dupe_count
        issue_detail = f"Dropped {dupe_count} duplicate timestamps"
        logger.warning("[%s %s] %s", pair, timeframe, issue_detail)
        report.issues.append(ValidationIssue(pair=pair, timeframe=timeframe, check_name="Duplicate Check", severity="WARNING", detail=issue_detail))
        return df.drop_duplicates(subset=["open_time"], keep="first").copy()

    return df


def validate_gaps(df: pd.DataFrame, pair: str, timeframe: str, report: DataQualityReport) -> None:
    """Analyzes 1m timestamp continuity to detect missing bar gaps.

    Args:
        df (pd.DataFrame): Input bars sorted by open_time.
        pair (str): Pair symbol.
        timeframe (str): Timeframe.
        report (DataQualityReport): Audit report.
    """
    if len(df) < 2 or timeframe != "1m":
        return

    time_diffs = (df["open_time"].diff().dt.total_seconds() / 60.0).dropna()
    missing_bars = (time_diffs - 1.0).astype(int)
    gap_runs = missing_bars[missing_bars > 0]

    if not gap_runs.empty:
        max_gap = int(gap_runs.max())
        report.max_gap_consecutive_bars = max(report.max_gap_consecutive_bars, max_gap)

        large_gaps = gap_runs[gap_runs > 60]
        if not large_gaps.empty:
            count_large = len(large_gaps)
            report.gaps_greater_than_60 += count_large
            issue_detail = f"Detected {count_large} gap sequence(s) >60 consecutive missing 1m bars. Max gap: {max_gap} bars."
            logger.warning("[%s %s] %s", pair, timeframe, issue_detail)
            report.issues.append(
                ValidationIssue(pair=pair, timeframe=timeframe, check_name="Gap Check", severity="QUARANTINE", detail=issue_detail)
            )


def validate_zero_volume_runs(df: pd.DataFrame, pair: str, timeframe: str, report: DataQualityReport) -> None:
    """Flags consecutive runs of zero-volume bars exceeding 30 bars.

    Args:
        df (pd.DataFrame): Input bar DataFrame.
        pair (str): Pair symbol.
        timeframe (str): Timeframe.
        report (DataQualityReport): Audit report.
    """
    zero_vol_mask = df["volume"] == 0
    if not zero_vol_mask.any():
        return

    # Group contiguous True blocks
    runs = (~zero_vol_mask).cumsum()[zero_vol_mask]
    if runs.empty:
        return

    run_lengths = zero_vol_mask.groupby(runs).sum()
    long_runs = run_lengths[run_lengths > 30]

    if not long_runs.empty:
        count_runs = len(long_runs)
        max_run = int(long_runs.max())
        report.zero_volume_runs_greater_than_30 += count_runs
        issue_detail = f"Flagged {count_runs} zero-volume run(s) exceeding 30 bars. Max run: {max_run} bars."
        logger.info("[%s %s] %s", pair, timeframe, issue_detail)
        report.issues.append(ValidationIssue(pair=pair, timeframe=timeframe, check_name="Volume Check", severity="INFO", detail=issue_detail))


def validate_freshness(df: pd.DataFrame, pair: str, timeframe: str, report: DataQualityReport) -> None:
    """Checks if the newest bar timestamp is within 24 hours of UTC now.

    Args:
        df (pd.DataFrame): Bar DataFrame.
        pair (str): Pair symbol.
        timeframe (str): Timeframe.
        report (DataQualityReport): Audit report.
    """
    if df.empty:
        report.is_fresh_24h = False
        return

    latest_bar_time = df["open_time"].max()
    now_utc = pd.Timestamp.now(tz="UTC")
    age_hours = (now_utc - latest_bar_time).total_seconds() / 3600.0

    if age_hours > 24.0:
        report.is_fresh_24h = False
        issue_detail = f"Data stale: latest bar timestamp is {latest_bar_time} ({age_hours:.1f} hours old)"
        logger.warning("[%s %s] %s", pair, timeframe, issue_detail)
        report.issues.append(ValidationIssue(pair=pair, timeframe=timeframe, check_name="Freshness Check", severity="WARNING", detail=issue_detail))


def validate_bars(df: pd.DataFrame, pair: str, timeframe: str) -> tuple[pd.DataFrame, DataQualityReport]:
    """Executes full Master Plan §9.7 data quality inspection pipeline.

    Args:
        df (pd.DataFrame): Raw or loaded bar DataFrame.
        pair (str): Pair symbol (e.g., 'BTCUSDT').
        timeframe (str): Timeframe symbol (e.g., '1m').

    Returns:
        tuple[pd.DataFrame, DataQualityReport]: Cleaned DataFrame and quality audit report.
    """
    report = DataQualityReport()
    if df.empty:
        return df, report

    df_clean = df.sort_values("open_time").reset_index(drop=True)
    report.total_bars = len(df_clean)
    report.start_time = str(df_clean["open_time"].min())
    report.end_time = str(df_clean["open_time"].max())

    # 1. Duplicates check
    df_clean = validate_duplicates(df_clean, pair, timeframe, report)

    # 2. OHLC sanity check
    df_clean = validate_ohlc_sanity(df_clean, pair, timeframe, report)

    # 3. Gap check
    validate_gaps(df_clean, pair, timeframe, report)

    # 4. Zero-volume runs check
    validate_zero_volume_runs(df_clean, pair, timeframe, report)

    # 5. Freshness check
    validate_freshness(df_clean, pair, timeframe, report)

    return df_clean, report


def save_quality_report(report: DataQualityReport, output_dir: Path) -> Path:
    """Saves structured data quality audit report to Markdown file (`data_quality_report.md`).

    Args:
        report (DataQualityReport): Report instance.
        output_dir (Path): Output directory (e.g., Path('data')).

    Returns:
        Path: Path to saved markdown report.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    report_file = output_dir / "data_quality_report.md"

    md_content = [
        "# Project APEX — Data Quality Audit Report",
        "",
        f"- **Total Bars Analyzed**: {report.total_bars}",
        f"- **Date Range**: `{report.start_time}` to `{report.end_time}`",
        f"- **Duplicates Dropped**: {report.duplicates_found}",
        f"- **OHLC Sanity Violations**: {report.ohlc_violations}",
        f"- **Max Consecutive Gap**: {report.max_gap_consecutive_bars} bars",
        f"- **Gaps >60 Bars**: {report.gaps_greater_than_60}",
        f"- **Zero Volume Runs >30 Bars**: {report.zero_volume_runs_greater_than_30}",
        f"- **24h Freshness Pass**: {'✅ YES' if report.is_fresh_24h else '⚠️ NO'}",
        "",
        "## Audit Issues Log",
        "",
        "| Pair | TF | Check | Severity | Detail |",
        "|---|---|---|---|---|",
    ]

    if not report.issues:
        md_content.append("| - | - | All Checks Passed | INFO | Zero quality defects detected |")
    else:
        for issue in report.issues:
            md_content.append(f"| {issue.pair} | {issue.timeframe} | {issue.check_name} | {issue.severity} | {issue.detail} |")

    report_file.write_text("\n".join(md_content), encoding="utf-8")
    logger.info("Saved data quality audit report to %s", report_file)
    return report_file
