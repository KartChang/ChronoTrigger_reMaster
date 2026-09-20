"""Keep public Playwright FileChooser interception subscribed for a page lifetime.

Playwright 1.51 sends first/last listener updates without awaiting their reply.
Arm once on about:blank, before navigation/interaction, rather than toggling the
subscription in the same turn as the first Enter or removing it after every
selection. The normal expect_file_chooser and real input event are still required.
No CDP/private API, DOM event dispatch, file selection, retries or sleeps here.
"""
from copy import deepcopy
from typing import Any
from weakref import WeakKeyDictionary

_OBSERVERS: WeakKeyDictionary = WeakKeyDictionary()


def arm_native_chooser(page: Any) -> None:
    if page in _OBSERVERS:
        return
    if page.url != 'about:blank':
        raise AssertionError('Arm native chooser on the new blank page before its first navigation')
    record = {'armedUrl': page.url, 'scope': 'page-lifetime', 'eventsSeen': 0}
    def observed(_chooser):
        # Deliberately no remote reads or set_files in an event callback.
        record['eventsSeen'] += 1
    page.on('filechooser', observed)
    _OBSERVERS[page] = record
    page.once('close', lambda *_: _OBSERVERS.pop(page, None))


def chooser_observation(page: Any) -> dict:
    record = _OBSERVERS.get(page)
    if record is None:
        raise AssertionError('Native chooser was not armed before page navigation')
    return deepcopy(record)


def assert_one_chooser(page: Any, before: dict) -> dict:
    after = chooser_observation(page)
    assert after['eventsSeen'] == before['eventsSeen'] + 1, {'before': before, 'after': after}
    return after
