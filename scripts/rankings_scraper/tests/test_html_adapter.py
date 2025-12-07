from __future__ import annotations

import unittest

from scripts.rankings_scraper.html_adapter import HtmlTableAdapter


SAMPLE_HTML = """
<html>
  <body>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>School</th>
          <th>Program</th>
          <th>Country</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><a href="https://www.hec.edu">HEC Paris</a></td>
          <td>MiM</td>
          <td>France</td>
          <td>97.3</td>
        </tr>
        <tr>
          <td>2</td>
          <td>ESCP Business School</td>
          <td>Master in Management</td>
          <td>France</td>
          <td>95,1</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
"""


MISSING_TABLE_HTML = "<html><body><p>No table</p></body></html>"

EMPTY_BODY_HTML = """
<html>
  <body>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>School</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </body>
</html>
"""

TIE_AND_LINK_HTML = """
<html>
  <body>
    <table>
      <thead>
        <tr>
          <th>Position</th>
          <th>Institution</th>
          <th>Program</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1 (tie)</td>
          <td><a href="https://www.hec.edu/mim">HEC Paris</a></td>
          <td>MiM</td>
        </tr>
        <tr>
          <td>2</td>
          <td><a href="https://www.escp.eu">ESCP</a></td>
          <td>MiM</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
"""


class HtmlTableAdapterTest(unittest.TestCase):
    def setUp(self) -> None:
        self.adapter = HtmlTableAdapter()

    def test_parse_valid_table(self) -> None:
        payload = self.adapter.scrape(
            master_type="mim",
            year=2025,
            source="Demo Source",
            url="https://example.com/ranking",
            category="Master in Management",
            html_override=SAMPLE_HTML,
        )

        self.assertEqual(payload.master_type, "mim")
        self.assertEqual(payload.year, 2025)
        self.assertEqual(len(payload.entries), 2)
        first = payload.entries[0]
        self.assertEqual(first.rank, 1)
        self.assertEqual(first.school_name, "HEC Paris")
        self.assertEqual(first.program_name, "MiM")
        self.assertEqual(first.country, "France")
        self.assertAlmostEqual(first.score or 0.0, 97.3, places=1)

        second = payload.entries[1]
        self.assertEqual(second.rank, 2)
        self.assertEqual(second.score, 95.1)

    def test_missing_table_raises(self) -> None:
        with self.assertRaises(ValueError):
            self.adapter.scrape(
                master_type="mim",
                year=2025,
                source="Demo Source",
                url="https://example.com/ranking",
                category="Master in Management",
                html_override=MISSING_TABLE_HTML,
            )

    def test_empty_table_raises(self) -> None:
        with self.assertRaises(ValueError):
            self.adapter.scrape(
                master_type="mim",
                year=2025,
                source="Demo Source",
                url="https://example.com/ranking",
                category="Master in Management",
                html_override=EMPTY_BODY_HTML,
            )

    def test_rank_parsing_and_link_capture(self) -> None:
        payload = self.adapter.scrape(
            master_type="mim",
            year=2025,
            source="Demo Source",
            url="https://example.com/ranking",
            category="Master in Management",
            html_override=TIE_AND_LINK_HTML,
        )

        self.assertEqual(len(payload.entries), 2)
        first = payload.entries[0]
        self.assertEqual(first.rank, 1)
        self.assertEqual(first.school_name, "HEC Paris")
        self.assertEqual(first.link, "https://www.hec.edu/mim")

        second = payload.entries[1]
        self.assertEqual(second.rank, 2)
        self.assertEqual(second.link, "https://www.escp.eu")


if __name__ == "__main__":
    unittest.main()


