"""
Pytest configuration and shared fixtures for Project APEX.
"""

import pytest
from pathlib import Path
import yaml

@pytest.fixture
def project_root() -> Path:
    return Path(__file__).parent.parent

@pytest.fixture
def system_config(project_root: Path) -> dict:
    config_path = project_root / "config" / "system.yaml"
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

@pytest.fixture
def universe_config(project_root: Path) -> dict:
    config_path = project_root / "config" / "universe.yaml"
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

@pytest.fixture
def risk_config(project_root: Path) -> dict:
    config_path = project_root / "config" / "risk.yaml"
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)
