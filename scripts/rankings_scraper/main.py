from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Mapping, Optional, Type

from .html_adapter import HtmlTableAdapter
from .models import LeaderboardPayload

ADAPTERS: Dict[str, Type[HtmlTableAdapter]] = {
    "html-table": HtmlTableAdapter,
}


@dataclass
class ScrapeConfig:
    """
    Single ranking scrape configuration.

    Example:
        cfg = ScrapeConfig(
            url="https://example.com/ranking",
            master_type="mim",
            year=2024,
            source="Financial Times",
            category="Master in Management",
            region=None,
            adapter="html-table",
            output_path="ranking.json",
        )
    """

    url: str
    master_type: str
    year: int
    source: str
    category: str
    region: Optional[str] = None
    adapter: str = "html-table"
    output_path: str = "ranking.json"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Scrape master rankings into a normalized JSON payload.",
    )
    parser.add_argument(
        "--input",
        default="-",
        help="Path to JSON config. Use '-' to read from stdin (default).",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=10.0,
        help="HTTP timeout in seconds (default: 10).",
    )
    return parser


def _load_config(path: str) -> Mapping[str, Any]:
    if path == "-":
        raw = sys.stdin.read()
    else:
        raw = Path(path).read_text(encoding="utf-8")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON config: {exc}") from exc
    if not isinstance(data, Mapping):
        raise ValueError("Config must be a JSON object")
    return data


def _normalize_config(data: Mapping[str, Any]) -> ScrapeConfig:
    required = ["url", "master_type", "year", "source", "category"]
    missing = [key for key in required if not data.get(key)]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    year_raw = data.get("year")
    try:
        year_int = int(year_raw)
    except (TypeError, ValueError) as exc:
        raise ValueError("year must be an integer") from exc
    if year_int < 1900:
        raise ValueError("year must be >= 1900")

    adapter = (data.get("adapter") or "html-table").strip()
    output_path = (data.get("output_path") or "ranking.json").strip() or "ranking.json"

    return ScrapeConfig(
        url=str(data["url"]).strip(),
        master_type=str(data["master_type"]).strip(),
        year=year_int,
        source=str(data["source"]).strip(),
        category=str(data["category"]).strip(),
        region=str(data["region"]).strip() if data.get("region") else None,
        adapter=adapter,
        output_path=output_path,
    )


def scrape_from_config(config: ScrapeConfig, *, timeout: float) -> LeaderboardPayload:
    adapter_cls = ADAPTERS.get(config.adapter)
    if adapter_cls is None:
        raise ValueError(f"Unknown adapter '{config.adapter}'. Available: {', '.join(ADAPTERS)}")

    adapter = adapter_cls(timeout=timeout)
    payload: LeaderboardPayload = adapter.scrape(
        master_type=config.master_type,
        year=config.year,
        source=config.source,
        url=config.url,
        category=config.category,
        region=config.region,
    )
    return payload


def run() -> None:
    parser = build_parser()
    args = parser.parse_args()

    config_raw = _load_config(args.input)
    config = _normalize_config(config_raw)

    payload = scrape_from_config(config, timeout=args.timeout)

    output_path = Path(config.output_path)
    output_path.write_text(json.dumps(payload.to_dict(), indent=2, ensure_ascii=False))
    print(f"Wrote normalized ranking to {output_path}")


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:  # noqa: BLE001
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)

