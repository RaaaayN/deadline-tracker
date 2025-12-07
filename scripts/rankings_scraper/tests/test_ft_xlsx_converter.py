from __future__ import annotations

import json
from pathlib import Path
from tempfile import NamedTemporaryFile, TemporaryDirectory
from typing import List

from openpyxl import Workbook

from scripts.rankings_scraper.ft_xlsx_converter import (
    _infer_meta_from_filename,
    _parse_rows,
    convert_file,
)
from scripts.rankings_scraper.models import RankingEntry


def _make_workbook(headers: List[str], rows: List[List[object]]) -> Path:
    wb = Workbook()
    ws = wb.active
    ws.append(headers)
    for row in rows:
        ws.append(row)
    tmp = NamedTemporaryFile(suffix=".xlsx", delete=False)
    wb.save(tmp.name)
    return Path(tmp.name)


def test_infer_meta_from_filename_mim() -> None:
    meta = _infer_meta_from_filename(Path("export-ranking-masters-in-management-2024-foo.xlsx"))
    assert meta.master_type == "mim"
    assert meta.category == "Master in Management"
    assert meta.year == 2024
    assert meta.source_url.startswith("https://rankings.ft.com")


def test_parse_rows_and_convert(tmp_path: Path) -> None:
    headers = ["Rank", "School", "Program", "Country", "Score"]
    rows = [
        [1, "HEC Paris", "MiM", "France", "97.3"],
        [2, "ESCP", "MiM", "France", "95,1"],
    ]
    xlsx_path = _make_workbook(headers, rows)

    output_dir = tmp_path / "out"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = convert_file(
        xlsx_path.rename(tmp_path / "export-ranking-masters-in-management-2024-test.xlsx"),
        output_dir,
    )

    data = json.loads(output_file.read_text(encoding="utf-8"))
    assert data["master_type"] == "mim"
    assert data["category"] == "Master in Management"
    assert data["year"] == 2024
    assert len(data["entries"]) == 2
    assert data["entries"][0]["rank"] == 1
    assert data["entries"][0]["school_name"] == "HEC Paris"
    assert abs(data["entries"][1]["score"] - 95.1) < 1e-6


def test_parse_rows_handles_ties() -> None:
    headers = ["Position", "Institution"]
    rows = [["1 (tie)", "School A"], ["2", "School B"]]
    wb = Workbook()
    ws = wb.active
    ws.append(headers)
    for row in rows:
        ws.append(row)
    entries = _parse_rows(ws, header_row_idx=1, header_map={0: "rank", 1: "school_name"})
    assert isinstance(entries[0], RankingEntry)
    assert entries[0].rank == 1
    assert entries[1].rank == 2

