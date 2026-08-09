"""
Sanity unit tests verifying project configuration and directory layout contracts.
"""

from pathlib import Path

def test_project_structure(project_root: Path):
    """Verify all 12 layer directories exist in src/."""
    expected_layers = [
        "datalake",
        "features",
        "miner",
        "backtest",
        "tradesdb",
        "edge",
        "validation",
        "portfolio",
        "risk",
        "ui",
        "execution",
        "monitoring",
    ]
    src_dir = project_root / "src"
    assert src_dir.exists()
    for layer in expected_layers:
        layer_dir = src_dir / layer
        assert layer_dir.exists(), f"Layer directory missing: {layer_dir}"
        assert (layer_dir / "__init__.py").exists(), f"__init__.py missing in {layer_dir}"

def test_system_config_contract(system_config: dict):
    """Verify system.yaml contract parameters."""
    assert "paths" in system_config
    assert system_config["paths"]["db"] == "db/apex.duckdb"
    assert "time" in system_config
    assert system_config["time"]["insample_end"] == "2022-12-31"  # Research wall
    assert system_config["random_seed"] == 42

def test_universe_config_contract(universe_config: dict):
    """Verify universe.yaml defines 20 pairs and 1m base timeframe."""
    assert "pairs" in universe_config
    assert len(universe_config["pairs"]) == 20
    assert universe_config["base_timeframe"] == "1m"
    assert "5m" in universe_config["derived_timeframes"]

def test_risk_config_contract(risk_config: dict):
    """Verify risk.yaml contains required sizing and circuit breakers."""
    assert "sizing" in risk_config
    assert risk_config["sizing"]["base_risk_pct"] == 0.75
    assert "breakers" in risk_config
    assert risk_config["breakers"]["daily_loss_pct"] == 1.5
    assert risk_config["breakers"]["portfolio_dd_stop_pct"] == 20
