"""Bind current native checks to checked-out producer source, never to a report.

Legacy checker defaults and every behavioral assertion stay untouched. A stale
or malformed producer declaration fails before a journey starts. This module
cannot alter a browser, tick, event, observation, capture, or assertion.
"""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
_PATTERN = re.compile(r"^const buildInfo=\{version:'(0\.9\.[0-9]+)',batch:'(VQ[0-9]{2}[A-Z])',sourceSha:process\.env\.GITHUB_SHA\?\?null\};$", re.MULTILINE)

def expected_build_from_source(source: str) -> tuple[str, str]:
    matches = _PATTERN.findall(source)
    if len(matches) != 1 or source.count('const buildInfo=') != 1:
        raise ValueError('Exactly one canonical build identity declaration required')
    return matches[0]

EXPECTED_BUILD = expected_build_from_source((ROOT/'scripts/build.mjs').read_text(encoding='utf-8'))
