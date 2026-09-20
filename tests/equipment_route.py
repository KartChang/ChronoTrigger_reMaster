"""Test-only keyboard route. The game, collision and clock remain untouched.

Exit the cloth stall into the centre aisle before turning south. Crossing the
entire fair at the old z=-3.4 threshold can hit the candy stall after one delayed
observation. These legs leave room for sampled/keyup overshoot instead.
"""
from pathlib import Path
import json
import math

ROUTE = json.loads(Path(__file__).with_name('equipment-route.json').read_text(encoding='utf-8'))


def input_context(page):
    return page.evaluate('''() => ({focused:document.activeElement?.id ?? null,
        paused:window.__CHRONO_TEST__.paused(),
        dialogOpen:!document.querySelector('#dialog')?.hidden,
        inventoryOpen:!document.querySelector('#inventory-screen')?.hidden,
        hint:document.querySelector('#interact-hint')?.textContent ?? '',
        hintHidden:document.querySelector('#interact-hint')?.hidden ?? true})''')


def assert_route_context(state, ui, joined, start_tick):
    assert state['chapter'] == ROUTE['chapter'] and state['mode'] == 'explore', state
    assert state['prologue']['stage'] == ROUTE['stage'] and state['joined'] == joined, state
    assert ui['focused'] == 'world' and not any(ui[k] for k in ('paused', 'dialogOpen', 'inventoryOpen')), ui
    assert math.isfinite(state['ticks']) and state['ticks'] >= start_tick, state
    assert all(math.isfinite(state['players'][0][axis]) for axis in ('x', 'z')), state


def walk_equipment_route(page, move, snapshot, evidence, route_name):
    """Use the journey's unchanged real-key driver; retain state after keyup.

    No retries, synthetic key dispatch, state writes, force clicks or clock
    acceleration. The caller still observes canopy occlusion and opens/trades
    through the original inventory UI. A failed leg never starts the next leg.
    """
    if route_name not in ROUTE['routes']:
        raise ValueError('Unknown equipment route')
    before = snapshot(page)
    trace = {'name': 'equipment-aisle-route', 'route': route_name, 'status': 'started',
             'physicalDevice': False, 'artApproved': False, 'before': before, 'legs': []}
    evidence.append(trace)
    try:
        assert_route_context(before, input_context(page), False, before['ticks'])
        for waypoint in ROUTE['routes'][route_name]:
            start = snapshot(page)
            record = {**waypoint, 'before': start, 'inputBefore': input_context(page)}
            trace['legs'].append(record)
            assert_route_context(start, record['inputBefore'], before['joined'], before['ticks'])
            # move() guarantees a real keyup in its own finally block.
            try:
                move(page, waypoint['axis'], waypoint['target'])
            finally:
                # Diagnostic failure must not mask the driver's original error.
                try:
                    record.update(afterRelease=snapshot(page), inputAfter=input_context(page))
                except Exception as capture:
                    record['captureError'] = str(capture)
            assert not record.get('captureError'), record
            after, ui = record['afterRelease'], record['inputAfter']
            assert_route_context(after, ui, before['joined'], start['ticks'])
            lo, hi = waypoint['releaseBand']
            assert lo <= after['players'][0][waypoint['axis']] <= hi, record
        after = snapshot(page)
        if route_name in ('to-merchant', 'to-gato'):
            point = ROUTE['merchant' if route_name == 'to-merchant' else 'gato']
            distance = math.hypot(after['players'][0]['x'] - point['x'], after['players'][0]['z'] - point['z'])
            trace['distance'] = distance
            assert distance < point['radius'], trace
        trace.update(status='reached', after=after, inputAfter=input_context(page))
        return trace
    except Exception as exc:
        trace.update(status='failed', failure=str(exc))
        try:
            trace.update(afterFailure=snapshot(page), inputAfterFailure=input_context(page))
        except Exception as capture:
            trace['captureError'] = str(capture)
        raise
