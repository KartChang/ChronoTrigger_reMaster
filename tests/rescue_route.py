"""Real-input approaches for solid rescue props; observations never mutate the game."""
from pathlib import Path
import json
import math

HERE = Path(__file__).resolve().parent
ROUTE = json.loads((HERE / 'rescue-route.json').read_text(encoding='utf-8'))
ORGAN_ROUTE = json.loads((HERE / 'organ-route.json').read_text(encoding='utf-8'))
PROBE = (HERE / 'rescue-approach-probe.js').read_text(encoding='utf-8')


def input_context(page):
    """Retain focus and UI ownership beside the read-only game snapshot."""
    return page.evaluate('''() => ({
        focused: document.activeElement?.id || null,
        tag: document.activeElement?.tagName || null,
        hint: document.querySelector('#interact-hint')?.textContent || '',
        hintHidden: document.querySelector('#interact-hint')?.hidden,
        dialogOpen: !document.querySelector('#dialog')?.hidden,
        paused: window.__CHRONO_TEST__.paused()
    })''')


def approach_interaction(page, move, snapshot, evidence, route, route_name, timeout_ms=120000):
    """Walk an aisle, then stop at the actual in-range prompt before interacting.

    Intermediate legs use the journey's original keyboard driver. The final leg
    uses the same keys and original distance-based simulation budget, but awaits
    the correct prompt rather than insisting on a precise prop-centre coordinate.
    The caller still sends E and verifies the real event/stock/save result.
    """
    if type(timeout_ms) is not int or not 0 < timeout_ms <= 120000:
        raise ValueError('invalid approach wall timeout')
    before = snapshot(page)
    trace = {'route': route_name, 'interaction': route['interaction']['id'],
             'before': before, 'waypoints': []}
    evidence.append(trace)  # A failed first key press must also leave a trace.
    try:
        assert before['chapter'] == route['chapter'] and before['mode'] == 'explore', before
        for waypoint in route['waypoints'][:-1]:
            record = {**waypoint, 'before': snapshot(page), 'inputBefore': input_context(page)}
            trace['waypoints'].append(record)
            try:
                move(page, waypoint['axis'], waypoint['target'])
            finally:
                record.update(afterRelease=snapshot(page), inputAfter=input_context(page))

        final = route['waypoints'][-1]
        state = snapshot(page)
        delta = final['target'] - state['players'][0][final['axis']]
        args = {'chapter': route['chapter'], 'point': route['interaction'],
                'startTick': state['ticks'], 'budget': math.ceil((abs(delta) / 4 + 2) * 60),
                'joined': before['joined'], 'wait': False}
        observation = page.evaluate(PROBE, args)
        record = {**final, 'stop': 'visible-in-range-prompt', 'before': state,
                  'inputBefore': input_context(page), 'probeBefore': observation,
                  'budget': args['budget'], 'keys': []}
        trace['waypoints'].append(record)
        assert observation['ok'], observation
        if not observation['ready']:
            assert abs(delta) > .025, {'reason': 'at-target-without-prompt', 'observation': observation}
            pairs = {'x': ('d', 'ArrowRight') if delta > 0 else ('a', 'ArrowLeft'),
                     'z': ('w', 'ArrowUp') if delta > 0 else ('s', 'ArrowDown')}
            keys = pairs[final['axis']][:2 if before['joined'] else 1]
            attempted = []
            try:
                for key in keys:
                    attempted.append(key)
                    record['keys'].append(key)
                    page.keyboard.down(key)
                handle = page.wait_for_function(PROBE, arg={**args, 'wait': True},
                                                polling=100, timeout=timeout_ms)
                try:
                    observation = handle.json_value()
                finally:
                    handle.dispose()
                record['observedBeforeRelease'] = observation
                assert observation['ok'] and observation['ready'], observation
            finally:
                # Release every attempted key, even if one release itself fails.
                release_errors = []
                for key in reversed(attempted):
                    try:
                        page.keyboard.up(key)
                    except Exception as exc:
                        release_errors.append({'key': key, 'error': str(exc)})
                if release_errors:
                    record['releaseErrors'] = release_errors
        after = page.evaluate(PROBE, args)
        record.update(afterRelease=after['state'], inputAfter=after['ui'], probeAfter=after)
        assert not record.get('releaseErrors'), record
        assert after['ok'] and after['ready'], after
        trace.update(status='reached', distance=after['distance'], after=after['state'], inputAfter=after['ui'])
    except Exception as exc:
        trace.update(status='failed', failure=str(exc))
        try:
            trace.update(afterFailure=snapshot(page), inputAfterFailure=input_context(page))
        except Exception as observation_error:
            trace['observationError'] = str(observation_error)
        raise


def approach_supply_chest(page, move, snapshot, evidence, timeout_ms=120000):
    return approach_interaction(page, move, snapshot, evidence, ROUTE, 'rescue-route.json', timeout_ms=timeout_ms)


def approach_organ(page, move, snapshot, evidence, timeout_ms=120000):
    return approach_interaction(page, move, snapshot, evidence, ORGAN_ROUTE, 'organ-route.json', timeout_ms=timeout_ms)
