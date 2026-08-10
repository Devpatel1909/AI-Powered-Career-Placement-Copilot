from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseJobConnector(ABC):
    """Interface for public job board connectors."""

    source_name: str = "unknown"

    @abstractmethod
    def fetch_jobs(self) -> List[Dict[str, Any]]:
        """Fetch raw job records from the external source."""
        raise NotImplementedError
