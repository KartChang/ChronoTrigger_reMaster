"""Native import driver shared by the real browser journeys.

Only filechooser.set_files supplies a selection, after the normal button action
has produced an actual FileChooser event. Positive cases use unmodified files
already exported by a journey. File payloads are reserved for explicit rejection
cases. This helper never edits the DOM, game snapshot, clocks or storage.
"""
from pathlib import Path
import hashlib
import json
import os
from typing import Any

_ATTEMPTS: dict[Path, list[dict[str, Any]]] = {}
_TERMINALS = ('imported', 'read-error', 'empty-selection', 'cancelled', 'activation-error', 'unavailable')


def import_context(page: Any) -> dict[str, Any]:
    return page.evaluate("""() => {const t=window.__CHRONO_TEST__,s=t.snapshot(),i=document.querySelector('#save-file');
      return {focused:document.activeElement?.id,picker:i.dataset.picker??'closed',
        importDisabled:document.querySelector('#import').disabled,paused:t.paused(),
        message:document.querySelector('#message').textContent,chapter:s.chapter,ticks:s.ticks,
        lifecycle:t.importStatus()};}""")


def import_save(page: Any, files: Any, out: Path, *, activation: str = 'click',
                expected: str = 'imported', label: str | None = None) -> dict[str, Any]:
    """One request/one event/one selection, with a durable receipt even on failure.

    Enter/Space require the caller's existing keyboard navigation to focus the
    visible import button. Tap remains actual Playwright touch input. Empty
    selection is not claimed to exercise the native OS Cancel button.
    """
    if activation not in ('click', 'tap', 'Enter', 'Space'):
        raise ValueError('Unsupported native activation')
    if expected not in ('imported', 'rejected', 'empty'):
        raise ValueError('Unsupported expected outcome')
    if isinstance(files, (str, Path)):
        path = Path(files).resolve(strict=True)
        raw = path.read_bytes()
        selection: Any = str(path)
        receipt = {'file': path.name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}
    elif isinstance(files, dict) and expected == 'rejected':
        # Negative fixtures cannot be promoted to successful story evidence.
        selection = files
        raw = files['buffer']
        receipt = {'negativeFixture': True, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}
    elif files == [] and expected == 'empty':
        selection = []
        receipt = {'emptySelection': True, 'nativeCancelCertified': False}
    else:
        raise ValueError('Success requires an existing exported file; payloads are rejection-only')

    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    attempts = _ATTEMPTS.setdefault(out.resolve(), [])
    attempt: dict[str, Any] = {'label': label or receipt.get('file', expected), 'activation': activation,
        'expected': expected, 'status': 'started', 'selection': receipt, 'stage': 'before-activation'}
    attempts.append(attempt)
    try:
        before = import_context(page)
        attempt['before'] = before
        assert not before['paused'] and not before['importDisabled'], before
        assert before['lifecycle']['phase'] not in ('open', 'reading'), before
        if activation in ('Enter', 'Space'):
            assert before['focused'] == 'import', before
        sequence = max((e['sequence'] for e in before['lifecycle']['events']), default=0)
        # Register interception BEFORE activation; otherwise headless chooser
        # handling can end the request before a later direct input assignment.
        with page.expect_file_chooser(timeout=30000) as event:
            if activation == 'click':
                page.locator('#import').click()
            elif activation == 'tap':
                page.locator('#import').tap()
            else:
                page.keyboard.press(activation)
        chooser = event.value
        assert chooser.element.get_attribute('id') == 'save-file'
        assert chooser.element.get_attribute('type') == 'file'
        assert not chooser.is_multiple()
        attempt['stage'] = 'chooser-observed'
        opened = import_context(page)
        attempt['chooserOpen'] = opened
        assert opened['picker'] == 'open' and opened['paused'], opened
        requested = [e for e in opened['lifecycle']['events'] if e['sequence'] > sequence and e['event'] == 'requested']
        assert len(requested) == 1, opened
        # These are read-only snapshots while the real request is waiting.
        frozen = page.evaluate('window.__CHRONO_TEST__.snapshot()')
        frame = page.evaluate('window.__CHRONO_TEST__.view().frame')
        page.wait_for_function('window.__CHRONO_TEST__.view().frame >= '+str(frame+2), timeout=15000)
        assert page.evaluate('window.__CHRONO_TEST__.snapshot()') == frozen
        attempt['frozenWhileSelecting'] = True
        attempt['stage'] = 'selection-supplied'
        chooser.set_files(selection)
        # Correlate to this request, not an old success message from a prior load.
        handle = page.wait_for_function("""({sequence,terminals}) => {
          const status=window.__CHRONO_TEST__.importStatus();
          return status.events.find(e=>e.sequence>sequence&&terminals.includes(e.event)) || false;
        }""", arg={'sequence': sequence, 'terminals': list(_TERMINALS)}, timeout=30000)
        terminal = handle.json_value()
        handle.dispose()
        attempt['terminal'] = terminal
        wanted = {'imported': ('imported',), 'rejected': ('read-error',), 'empty': ('empty-selection', 'cancelled')}[expected]
        assert terminal['event'] in wanted, {'wanted': wanted, 'actual': terminal}
        page.wait_for_function('document.activeElement?.id==="world" && !window.__CHRONO_TEST__.paused()', timeout=30000)
        after = import_context(page)
        assert after['picker'] == ('error' if expected == 'rejected' else 'closed'), after
        text = {'imported': '存檔已匯入', 'rejected': '匯入失敗', 'empty': '已取消匯入'}[expected]
        assert text in after['message'], after
        assert page.locator('#save-file').input_value() == ''
        if isinstance(files, (str, Path)):
            assert path.read_bytes() == raw, 'The original exported file was changed'
        attempt.update(status='passed', stage='completed')
        return attempt
    except Exception as exc:
        attempt.update(status='failed', failure=str(exc))
        raise
    finally:
        try:
            attempt['after'] = import_context(page)
        except Exception as diagnostic:
            attempt['observationError'] = str(diagnostic)
        report = {'schema': 'chrono-native-import-evidence-v1', 'sourceSha': os.environ.get('GITHUB_SHA'),
            'status': 'passed' if all(a['status'] == 'passed' for a in attempts) else 'failed',
            'physicalDeviceApproved': False, 'attempts': attempts}
        (out/'native-import-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
