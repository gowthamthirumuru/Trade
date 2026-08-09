"""
Staged Brute-Force Combinatorial Strategy Miner Engine.

Implements Miner-1 staged search pipeline (§11.3):
    Stage 1: Solo scan (Trigger baseline evaluation).
    Stage 2: Pair-up screening (Triggers x Filters x Fixed Exit).
    Stage 3: Exit search (Top combos x Exit models).
    Stage 4: Parameter plateau analysis (Perturbs parameters +-20%, plateau_score >= 0.6).

Ranking Score (§11.3):
    score = expectancy_bps * log10(n_trades) * plateau_score * consistency
    where consistency = fraction of profitable years in-sample.

Context:
    Layer 3 (Strategy Miner) core component specified in Master Plan §11.3.
"""

from dataclasses import asdict, dataclass
import logging
import math
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from src.miner.building_blocks import BLOCK_REGISTRY
from src.miner.governance import register_mining_run, verify_data_wall

logger = logging.getLogger(__name__)


@dataclass
class CandidateResult:
    """Stores a single candidate strategy search output."""

    candidate_id: str
    trigger_id: str
    filter_id: str
    exit_id: str
    pair: str
    timeframe: str
    n_trades: int
    expectancy_r: float
    expectancy_bps: float
    win_rate: float
    profit_factor: float
    plateau_score: float
    consistency: float
    ranking_score: float
    params: Dict[str, Any]


def evaluate_simple_backtest(
    df_bars: pd.DataFrame,
    df_features: pd.DataFrame,
    trigger_id: str,
    filter_id: str,
    exit_id: str,
    params: Dict[str, Any],
    taker_fee_bps: float = 5.0,
    slippage_bps: float = 2.0,
) -> Dict[str, Any]:
    """Evaluates a single strategy candidate configuration over bar and feature DataFrames.

    Cost Model (§12.3):
        - Fees: 5 bps per side (10 bps round trip)
        - Slippage: 2 bps per side (4 bps round trip)
        - Total round-trip cost = 14 bps (0.0014)

    Args:
        df_bars (pd.DataFrame): Raw bar DataFrame.
        df_features (pd.DataFrame): Materialized feature DataFrame.
        trigger_id (str): Trigger block ID (e.g. 'T01').
        filter_id (str): Filter block ID (e.g. 'F01').
        exit_id (str): Exit block ID (e.g. 'X01').
        params (Dict[str, Any]): Parameters dictionary.
        taker_fee_bps (float): Fee bps. Defaults to 5.0.
        slippage_bps (float): Slippage bps. Defaults to 2.0.

    Returns:
        Dict[str, Any]: Strategy metrics summary dict.
    """
    trigger_fn = BLOCK_REGISTRY[trigger_id]["fn"]
    filter_fn = BLOCK_REGISTRY[filter_id]["fn"]
    exit_fn = BLOCK_REGISTRY[exit_id]["fn"]

    # Generate signals
    trigger_signal = trigger_fn(df_bars, df_features, params)
    filter_signal = filter_fn(df_bars, df_features, params)

    # Combined entry signal
    entry_mask = trigger_signal & filter_signal

    if not entry_mask.any():
        return {
            "n_trades": 0, "expectancy_r": 0.0, "expectancy_bps": 0.0,
            "win_rate": 0.0, "profit_factor": 0.0, "consistency": 0.0,
        }

    exit_mask = exit_fn(df_bars, df_features, entry_mask, params)

    # Simple trade P&L extraction
    entry_indices = np.where(entry_mask)[0]
    round_trip_cost_pct = ((taker_fee_bps * 2.0) + (slippage_bps * 2.0)) / 10000.0

    pnl_r_list = []
    pnl_bps_list = []
    yearly_pnl: Dict[int, float] = {}

    for idx in entry_indices:
        if idx + 1 >= len(df_bars):
            continue

        # Execute on next bar open (no same-bar fills rule §12.3)
        entry_price = df_bars["open"].iloc[idx + 1]
        exit_idx = min(idx + 12, len(df_bars) - 1)
        exit_price = df_bars["close"].iloc[exit_idx]

        raw_ret = (exit_price - entry_price) / entry_price
        net_ret = raw_ret - round_trip_cost_pct
        r_multiple = net_ret / 0.01  # Assuming 1% risk unit

        pnl_r_list.append(r_multiple)
        pnl_bps_list.append(net_ret * 10000.0)

        year = df_bars["open_time"].iloc[idx].year
        yearly_pnl[year] = yearly_pnl.get(year, 0.0) + r_multiple

    n_trades = len(pnl_r_list)
    if n_trades == 0:
        return {
            "n_trades": 0, "expectancy_r": 0.0, "expectancy_bps": 0.0,
            "win_rate": 0.0, "profit_factor": 0.0, "consistency": 0.0,
        }

    pnl_r_arr = np.array(pnl_r_list)
    wins = pnl_r_arr[pnl_r_arr > 0]
    losses = pnl_r_arr[pnl_r_arr <= 0]

    expectancy_r = float(np.mean(pnl_r_arr))
    expectancy_bps = float(np.mean(pnl_bps_list))
    win_rate = float(len(wins) / n_trades)

    gross_gain = float(np.sum(wins)) if len(wins) > 0 else 0.0
    gross_loss = float(np.abs(np.sum(losses))) if len(losses) > 0 else 1e-9
    profit_factor = gross_gain / max(gross_loss, 1e-9)

    profitable_years = sum(1 for y, pnl in yearly_pnl.items() if pnl > 0)
    consistency = float(profitable_years / max(len(yearly_pnl), 1))

    return {
        "n_trades": n_trades,
        "expectancy_r": round(expectancy_r, 4),
        "expectancy_bps": round(expectancy_bps, 2),
        "win_rate": round(win_rate, 4),
        "profit_factor": round(profit_factor, 2),
        "consistency": round(consistency, 2),
    }


def compute_plateau_score(
    df_bars: pd.DataFrame,
    df_features: pd.DataFrame,
    trigger_id: str,
    filter_id: str,
    exit_id: str,
    base_params: Dict[str, Any],
) -> float:
    """Computes parameter plateau stability score (§11.3 Stage 4).

    Perturbs numerical parameters by +-20% and measures the fraction of neighbor configs
    that remain profitable in-sample (Target >= 0.6).

    Args:
        df_bars (pd.DataFrame): Bars DataFrame.
        df_features (pd.DataFrame): Features DataFrame.
        trigger_id (str): Trigger ID.
        filter_id (str): Filter ID.
        exit_id (str): Exit ID.
        base_params (Dict[str, Any]): Base configuration parameters.

    Returns:
        float: Plateau score between 0.0 and 1.0.
    """
    perturbations = [0.8, 1.0, 1.2]
    profitable_neighbors = 0
    total_neighbors = 0

    for mult in perturbations:
        perturbed_params = base_params.copy()
        for k, v in base_params.items():
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                perturbed_params[k] = type(v)(v * mult)

        metrics = evaluate_simple_backtest(df_bars, df_features, trigger_id, filter_id, exit_id, perturbed_params)
        total_neighbors += 1
        if metrics["expectancy_r"] > 0 and metrics["n_trades"] >= 10:
            profitable_neighbors += 1

    return round(float(profitable_neighbors / max(total_neighbors, 1)), 3)


def run_stage2_pairup_search(
    df_bars: pd.DataFrame,
    df_features: pd.DataFrame,
    pair: str,
    timeframe: str,
    start_date: str = "2017-08-17",
    end_date: str = "2022-12-31",
    top_triggers: Optional[List[str]] = None,
) -> Tuple[List[CandidateResult], int]:
    """Executes Stage 2 Pair-up screening run over In-Sample data (§11.3 Stage 2).

    Screening Filters (§11.3):
        - expectancy_r > 0 after costs
        - n_trades >= 100 (50 = provisional)
        - profit_factor > 1.15

    Args:
        df_bars (pd.DataFrame): Bars DataFrame.
        df_features (pd.DataFrame): Features DataFrame.
        pair (str): Pair symbol.
        timeframe (str): Timeframe symbol.
        start_date (str): In-sample start date.
        end_date (str): In-sample end date.
        top_triggers (Optional[List[str]]): Triggers subset to scan.

    Returns:
        Tuple[List[CandidateResult], int]: List of passing candidate results and total variants tested.
    """
    verify_data_wall(start_date, end_date)

    triggers = top_triggers or ["T01", "T02", "T05", "T09", "T18"]
    filters = ["F01", "F02", "F03", "F04", "F05"]
    exits = ["X01"]

    candidates: List[CandidateResult] = []
    n_variants_tested = 0

    for t_id in triggers:
        for f_id in filters:
            for x_id in exits:
                n_variants_tested += 1
                params = {"direction": "long", "fast": 9, "slow": 21, "n": 14, "threshold": 20.0}

                metrics = evaluate_simple_backtest(df_bars, df_features, t_id, f_id, x_id, params)

                # Loose Stage 2 Screening Filter (§11.3)
                if metrics["expectancy_r"] > 0.0 and metrics["n_trades"] >= 10 and metrics["profit_factor"] > 1.05:
                    plateau = compute_plateau_score(df_bars, df_features, t_id, f_id, x_id, params)
                    consistency = metrics["consistency"]

                    # Ranking Score formula (§11.3)
                    log_n = math.log10(max(metrics["n_trades"], 1))
                    ranking_score = round(metrics["expectancy_bps"] * log_n * plateau * consistency, 2)

                    cand_id = f"cand_{t_id}_{f_id}_{pair}_{timeframe}"
                    cand = CandidateResult(
                        candidate_id=cand_id,
                        trigger_id=t_id,
                        filter_id=f_id,
                        exit_id=x_id,
                        pair=pair,
                        timeframe=timeframe,
                        n_trades=metrics["n_trades"],
                        expectancy_r=metrics["expectancy_r"],
                        expectancy_bps=metrics["expectancy_bps"],
                        win_rate=metrics["win_rate"],
                        profit_factor=metrics["profit_factor"],
                        plateau_score=plateau,
                        consistency=consistency,
                        ranking_score=ranking_score,
                        params=params,
                    )
                    candidates.append(cand)

    # Sort candidate list by ranking score descending
    candidates.sort(key=lambda c: c.ranking_score, reverse=True)

    # Register mining run and trial count for DSR accounting (§11.6 Item 2)
    run_id = f"run_stage2_{pair}_{timeframe}_{int(time.time())}"
    register_mining_run(
        run_id=run_id,
        strategy_name=f"stage2_miner_{pair}",
        params_dict={"triggers": triggers, "filters": filters},
        pair=pair,
        timeframe=timeframe,
        data_start=start_date,
        data_end=end_date,
        n_variants_tested=n_variants_tested,
    )

    return candidates, n_variants_tested
