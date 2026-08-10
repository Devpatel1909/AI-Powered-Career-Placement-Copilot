import logging
import os
from typing import List

from app.connectors.greenhouse import GreenhouseConnector
from app.schemas.jobs import NormalizedJob
from app.services.job_normalizer import normalize_greenhouse_job

logger = logging.getLogger(__name__)

DEFAULT_BOARDS = ["stripe", "figma", "discord"]


def get_configured_boards() -> List[str]:
    raw = os.getenv("GREENHOUSE_BOARDS", "")
    if raw.strip():
        return [b.strip() for b in raw.split(",") if b.strip()]
    return DEFAULT_BOARDS


def fetch_all_jobs() -> List[NormalizedJob]:
    """Fetch and normalize jobs from all configured connectors."""
    boards = get_configured_boards()
    connector = GreenhouseConnector(board_tokens=boards)
    raw_jobs = connector.fetch_jobs()

    normalized: List[NormalizedJob] = []
    for raw in raw_jobs:
        try:
            job = normalize_greenhouse_job(raw)
            if job:
                normalized.append(job)
        except Exception as exc:
            logger.warning("Failed to normalize job: %s", exc)

    logger.info("Fetched %s normalized jobs from %s boards", len(normalized), len(boards))
    return normalized
