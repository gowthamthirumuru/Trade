"""QUANT EDGE Server Configuration."""

from pathlib import Path
from typing import List
from pydantic import BaseModel


class ServerConfig(BaseModel):
    """Server configuration parameters."""
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False
    cors_origins: List[str] = ["*"]
    db_path: Path = Path(__file__).parent.parent.parent.parent / "db" / "apex.duckdb"
    datalake_path: Path = Path(__file__).parent.parent.parent.parent / "data" / "datalake"
    frontend_dist: Path = Path(__file__).parent.parent / "frontend" / "dist"


settings = ServerConfig()
