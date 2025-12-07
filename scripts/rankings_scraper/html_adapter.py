from __future__ import annotations

import re
from typing import Dict, List, Optional

import requests
from bs4 import BeautifulSoup

from .models import LeaderboardPayload, RankingEntry

HEADER_ALIASES: Dict[str, List[str]] = {
    "rank": ["rank", "position", "#"],
    "school_name": ["school", "university", "institution", "business school"],
    "program_name": ["program", "programme", "degree", "master", "course"],
    "country": ["country", "location"],
    "city": ["city", "campus"],
    "score": ["score", "points", "index"],
    "notes": ["notes", "comment", "remarks"],
    "link": ["link", "url", "website"],
}


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _normalize_header(value: str) -> str:
    lowered = value.lower()
    cleaned = re.sub(r"[^a-z0-9#]+", " ", lowered)
    return _clean_text(cleaned)


def _match_header(header: str) -> Optional[str]:
    normalized = _normalize_header(header)
    for canonical, aliases in HEADER_ALIASES.items():
        for alias in aliases:
            alias_norm = _normalize_header(alias)
            if normalized == alias_norm or normalized.startswith(alias_norm):
                return canonical
    return None


def _parse_rank_value(raw: Optional[str]) -> Optional[int]:
    if raw is None:
        return None
    match = re.search(r"\d+(?:[.,]\d+)?", str(raw))
    if not match:
        return None
    number_str = match.group(0).replace(",", ".")
    try:
        return int(float(number_str))
    except ValueError:
        return None


class HtmlTableAdapter:
    """
    Adapter parsing simple HTML tables into normalized leaderboard entries.

    Designed for quick reuse across ranking sources that expose tabular data.
    """

    def __init__(self, timeout: float = 10.0) -> None:
        self.timeout = timeout

    def scrape(
        self,
        *,
        master_type: str,
        year: int,
        source: str,
        url: str,
        category: str,
        region: Optional[str] = None,
        html_override: Optional[str] = None,
    ) -> LeaderboardPayload:
        """
        Fetch and parse an HTML table ranking into a normalized payload.

        Args:
            master_type: Type of master (e.g., mim, mif, msc_finance).
            year: Ranking year.
            source: Source name.
            url: Source URL to fetch.
            category: Category label (e.g., "Master in Management").
            region: Optional region.
            html_override: Raw HTML to parse instead of fetching (useful for tests).
        """
        html = html_override or self._fetch_html(url)
        entries = self._parse_table(html)
        payload = LeaderboardPayload(
            master_type=master_type,
            source=source,
            category=category,
            year=year,
            source_url=url,
            region=region,
            entries=entries,
        )
        payload.validate()
        return payload

    def _fetch_html(self, url: str) -> str:
        headers = {
            "User-Agent": "deadline-tracker-scraper/1.0 (+https://github.com)",
            "Accept": "text/html,application/xhtml+xml",
        }
        response = requests.get(url, headers=headers, timeout=self.timeout)
        response.raise_for_status()
        return response.text

    def _parse_table(self, html: str) -> List[RankingEntry]:
        soup = BeautifulSoup(html, "html.parser")
        tables = soup.find_all("table")
        if not tables:
            raise ValueError("No table found in HTML content; page may be dynamic (html-table adapter insufficient)")

        table = None
        headers: List[str] = []
        for candidate in tables:
            headers = [self._cell_text(th) for th in candidate.find_all("th")]
            if headers:
                table = candidate
                break

        if table is None or not headers:
            raise ValueError("Table must have header cells (<th>); page may be dynamic (html-table adapter insufficient)")

        header_map = self._build_header_map(headers)
        if "rank" not in header_map.values() or "school_name" not in header_map.values():
            raise ValueError("Table must contain rank and school columns")

        has_link_column = "link" in header_map.values()

        entries: List[RankingEntry] = []
        for row in table.find_all("tr"):
            cells = row.find_all(["td", "th"])
            if len(cells) < 2 or cells[0].name == "th":
                continue

            normalized = {key: None for key in header_map.keys()}
            school_link: Optional[str] = None
            for idx, cell in enumerate(cells):
                canonical = header_map.get(idx)
                if canonical is None:
                    continue
                if canonical == "school_name":
                    school_link = self._extract_link(cell)
                normalized[canonical] = self._extract_cell_value(cell, canonical)

            rank_int = _parse_rank_value(normalized.get("rank"))
            school_value = normalized.get("school_name")
            if rank_int is None or school_value is None:
                continue

            link_value = normalized.get("link") or (school_link if not has_link_column else None)
            entry = RankingEntry(
                rank=rank_int,
                school_name=_clean_text(school_value),
                program_name=_clean_text(normalized["program_name"]) if normalized.get("program_name") else None,
                country=_clean_text(normalized["country"]) if normalized.get("country") else None,
                city=_clean_text(normalized["city"]) if normalized.get("city") else None,
                score=self._parse_score(normalized.get("score")),
                notes=_clean_text(normalized["notes"]) if normalized.get("notes") else None,
                link=link_value,
                metadata={},
            )
            entries.append(entry)

        if not entries:
            raise ValueError("No entries parsed from table")
        return entries

    def _build_header_map(self, headers: List[str]) -> Dict[int, str]:
        mapping: Dict[int, str] = {}
        for idx, header in enumerate(headers):
            canonical = _match_header(header)
            if canonical:
                mapping[idx] = canonical
        return mapping

    def _extract_cell_value(self, cell, canonical: str) -> Optional[str]:
        link = cell.find("a")
        if canonical == "link" and link and link.get("href"):
            return link.get("href")
        if canonical == "school_name" and link and link.get("href"):
            return link.text or link.get("href")
        return self._cell_text(cell)

    def _extract_link(self, cell) -> Optional[str]:
        link = cell.find("a")
        if link and link.get("href"):
            return link.get("href")
        return None

    def _cell_text(self, element) -> str:
        text = element.get_text(separator=" ", strip=True)
        return _clean_text(text)

    def _parse_score(self, raw: Optional[str]) -> Optional[float]:
        if raw is None:
            return None
        cleaned = raw.replace(",", ".")
        try:
            return float(cleaned)
        except ValueError:
            return None

