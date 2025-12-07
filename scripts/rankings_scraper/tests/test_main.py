from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path
from typing import Dict
from unittest import TestCase, mock

from scripts.rankings_scraper.html_adapter import HtmlTableAdapter
from scripts.rankings_scraper.main import _normalize_config, run, scrape_from_config


SAMPLE_HTML: str = """
<html>
  <body>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>School</th>
          <th>Program</th>
          <th>Country</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>HEC Paris</td>
          <td>MiM</td>
          <td>France</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
"""


class MainCliTest(TestCase):
    def _base_config(self, output_path: Path) -> Dict[str, object]:
        return {
            "url": "https://example.com/ranking",
            "master_type": "mim",
            "year": 2025,
            "source": "Demo Source",
            "category": "Master in Management",
            "output_path": str(output_path),
        }

    def test_scrape_from_config_returns_payload(self) -> None:
        cfg = _normalize_config(self._base_config(Path("ranking.json")))
        with mock.patch.object(HtmlTableAdapter, "_fetch_html", return_value=SAMPLE_HTML):
            payload = scrape_from_config(cfg, timeout=5.0)
        self.assertEqual(payload.master_type, "mim")
        self.assertEqual(len(payload.entries), 1)
        self.assertEqual(payload.entries[0].rank, 1)
        self.assertEqual(payload.entries[0].school_name, "HEC Paris")

    def test_run_writes_output_file(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "out.json"
            cfg_path = Path(tmpdir) / "config.json"
            cfg_path.write_text(json.dumps(self._base_config(output)), encoding="utf-8")

            argv_backup = sys.argv
            sys.argv = ["prog", "--input", str(cfg_path), "--timeout", "2"]
            try:
                with mock.patch.object(HtmlTableAdapter, "_fetch_html", return_value=SAMPLE_HTML):
                    run()
            finally:
                sys.argv = argv_backup

            content = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(content["master_type"], "mim")
            self.assertEqual(content["source"], "Demo Source")
            self.assertEqual(len(content["entries"]), 1)
            self.assertEqual(content["entries"][0]["rank"], 1)
            self.assertEqual(content["entries"][0]["school_name"], "HEC Paris")


