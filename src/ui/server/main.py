"""QUANT EDGE Institutional Server Application Entrypoint."""

import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.ui.server.config import settings
from src.ui.server.routers.overview import router as overview_router
from src.ui.server.routers.research import router as research_router
from src.ui.server.routers.edge import router as edge_router
from src.ui.server.routers.validation import router as validation_router
from src.ui.server.routers.misc_routers import (
    analysis_router,
    trader_dev_router,
    intelligence_router,
    system_router,
)

logger = logging.getLogger("quant_edge_server")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(
    title="QUANT EDGE Institutional API",
    description="Research, Backtest, Discover Edge & Execution Command Center API",
    version="2.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global API Health Endpoint
@app.get("/api/health")
def api_health():
    return {
        "status": "ONLINE",
        "service": "QUANT EDGE Server",
        "version": "2.0.0",
        "duckdb": str(settings.db_path),
    }

# Register API Routers
app.include_router(overview_router)
app.include_router(research_router)
app.include_router(edge_router)
app.include_router(validation_router)
app.include_router(analysis_router)
app.include_router(trader_dev_router)
app.include_router(intelligence_router)
app.include_router(system_router)

# Mount Frontend static files at the very end
frontend_dist_dir = settings.frontend_dist
if frontend_dist_dir.exists() and (frontend_dist_dir / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist_dir), html=True), name="frontend")
    logger.info("Serving compiled React frontend from %s", frontend_dist_dir)


def start():
    """CLI launcher for QUANT EDGE backend server."""
    import uvicorn
    uvicorn.run("src.ui.server.main:app", host=settings.host, port=settings.port, reload=settings.reload)


if __name__ == "__main__":
    start()
