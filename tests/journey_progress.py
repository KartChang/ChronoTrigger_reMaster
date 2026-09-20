"""Crash-safe, read-only diagnostic progress; never an acceptance report or game save."""
import json
from datetime import datetime, timezone
from pathlib import Path


def write_progress(path: Path, checks: list, waits: list, *, phase: str) -> None:
    last = waits[-1] if waits else None
    record = {
        'schema': 'chrono-journey-progress-v1',
        'status': 'incomplete',
        'phase': phase,
        'recordedUtc': datetime.now(timezone.utc).isoformat(),
        'passedChecks': list(checks),
        'lastWait': last,
        'acceptance': False,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(record, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary.replace(path)
