from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


def _utcnow_iso() -> str:
    """Return an ISO-8601 timestamp with Z suffix."""
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


@dataclass
class RankingEntry:
    """
    Normalized row extracted from a ranking.

    Example:
        entry = RankingEntry(rank=1, school_name="HEC Paris", country="France")
        entry.validate()
    """

    rank: int
    school_name: str
    program_name: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    score: Optional[float] = None
    notes: Optional[str] = None
    link: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def validate(self) -> None:
        """Validate required fields and types."""
        if self.rank < 1:
            raise ValueError("rank must be >= 1")
        if not self.school_name.strip():
            raise ValueError("school_name is required")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to a JSON-serializable dict."""
        return asdict(self)


@dataclass
class LeaderboardPayload:
    """
    Normalized leaderboard content ready to be ingested.

    Example:
        payload = LeaderboardPayload(
            master_type="mim",
            source="Financial Times",
            category="Master in Management",
            year=2025,
            source_url="https://rankings.ft.com",
            entries=[RankingEntry(rank=1, school_name="HEC Paris")],
        )
        payload.validate()
    """

    master_type: str
    source: str
    category: str
    year: int
    source_url: str
    region: Optional[str] = None
    entries: List[RankingEntry] = field(default_factory=list)
    scraped_at: str = field(default_factory=_utcnow_iso)

    def validate(self) -> None:
        """Validate the leaderboard and nested entries."""
        if self.year < 1900:
            raise ValueError("year must be >= 1900")
        if not self.master_type.strip():
            raise ValueError("master_type is required")
        if not self.source.strip():
            raise ValueError("source is required")
        if not self.category.strip():
            raise ValueError("category is required")
        if not self.source_url.strip():
            raise ValueError("source_url is required")
        if not self.entries:
            raise ValueError("entries must not be empty")

        for entry in self.entries:
            entry.validate()

    def to_dict(self) -> Dict[str, Any]:
        """Convert payload to a JSON-serializable dict."""
        return {
            "master_type": self.master_type,
            "source": self.source,
            "category": self.category,
            "year": self.year,
            "source_url": self.source_url,
            "region": self.region,
            "entries": [entry.to_dict() for entry in self.entries],
            "scraped_at": self.scraped_at,
        }


