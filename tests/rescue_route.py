"""Shared real-input approach to the supply chest; never writes game state."""
from pathlib import Path
import json
import math

ROUTE = json.loads(Path(__file__).with_name('rescue-route.json').read_text(encoding='utf-8'))


def input_context(page):
    """Retain browser focus and UI ownership beside the read-only game snapshot."""
    return page.evaluate('''() => ({
        focused: document.activeElement?.id || null,
        tag: document.activeElement?.tagName || null,
        hint: document.querySelector('#interact-hint')?.textContent || '',
        hintHidden: document.querySelector('#interact-hint')?.hidden,
        dialogOpen: !document.querySelector('#dialog')?.hidden,
        paused: window.__CHRONO_TEST__.paused()
    })''')


def approach_supply_chest(page, move, snapshot, evidence):
    """Walk the existing entrance aisle, then assert the actual chest prompt.

    ``move`` is each journey's existing keyboard driver. The trace is registered
    before the first key press, so a failed movement still retains its context.
    There is no teleport, synthetic save, automatic retry or enlarged wait budget.
    """
    trace = {'route': 'rescue-route.json', 'before': snapshot(page), 'waypoints': []}
    evidence.append(trace)
    assert trace['before']['chapter'] == ROUTE['chapter'], trace
    assert trace['before']['mode'] == 'explore', trace
    try:
        for waypoint in ROUTE['waypoints']:
            record = {**waypoint, 'before': snapshot(page), 'inputBefore': input_context(page)}
            trace['waypoints'].append(record)
            try:
                move(page, waypoint['axis'], waypoint['target'])
            finally:
                record['afterRelease'] = snapshot(page)
                record['inputAfter'] = input_context(page)
        state = snapshot(page)
        point = ROUTE['interaction']
        distance = math.hypot(state['players'][0]['x'] - point['x'], state['players'][0]['z'] - point['z'])
        assert state['chapter'] == ROUTE['chapter'] and state['mode'] == 'explore', state
        assert distance < point['radius'], {'distance': distance, 'state': state}
        page.wait_for_function('''label => {
            const hint = document.querySelector('#interact-hint');
            return hint && !hint.hidden && hint.textContent.includes(label);
        }''', arg=point['label'], timeout=30000)
        trace.update(distance=distance, after=state, inputAfter=input_context(page), status='reached')
    except Exception as exc:
        trace.update(status='failed', failure=str(exc))
        raise
