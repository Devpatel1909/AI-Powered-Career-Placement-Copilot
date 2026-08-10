import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List

import requests

from app.connectors.base import BaseJobConnector

logger = logging.getLogger(__name__)

GREENHOUSE_API = "https://boards-api.greenhouse.io/v1/boards"


class GreenhouseConnector(BaseJobConnector):
    """Fetches jobs from Greenhouse public job boards API."""

    source_name = "greenhouse"

    def __init__(self, board_tokens: List[str], timeout: int = 20, max_workers: int = 5):
        self.board_tokens = board_tokens
        self.timeout = timeout
        self.max_workers = max_workers

    def _fetch_board(self, token: str) -> List[Dict[str, Any]]:
        """Fetch jobs from a single board (no full HTML content — much faster)."""
        response = requests.get(
            f"{GREENHOUSE_API}/{token}/jobs",
            params={"content": "false"},
            timeout=self.timeout,
        )
        response.raise_for_status()
        payload = response.json()
        jobs = payload.get("jobs", [])
        logger.info("Greenhouse: fetched %s jobs from board '%s'", len(jobs), token)
        return [{"board_token": token, "job": job} for job in jobs]

    def fetch_jobs(self) -> List[Dict[str, Any]]:
        raw_jobs: List[Dict[str, Any]] = []

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {executor.submit(self._fetch_board, token): token for token in self.board_tokens}
            for future in as_completed(futures):
                token = futures[future]
                try:
                    raw_jobs.extend(future.result())
                except Exception as exc:
                    logger.warning("Greenhouse fetch failed for board '%s': %s", token, exc)

        return raw_jobs
