"""Observe the existing first-meeting boundary; never set game state or retry a key."""
from pathlib import Path
import math

PROBE = (Path(__file__).with_name('meeting-approach-probe.js')).read_text(encoding='utf-8')


def approach_first_meeting(page, evidence):
    trace = {'route': 'first-meeting', 'status': 'started', 'legs': []}
    evidence.append(trace)
    snapshot = lambda: page.evaluate('window.__CHRONO_TEST__.snapshot()')
    before = snapshot()
    trace['before'] = before
    assert before['chapter'] == 'fair' and before['prologue']['stage'] == 'fair', before
    try:
        for axis, target in [('z', -3.1), ('x', -3.5), ('z', -2.2)]:
            state = snapshot()
            delta = target - state['players'][0][axis]
            direction = 1 if delta >= 0 else -1
            args = dict(axis=axis, target=target, direction=direction,
                        startTick=state['ticks'], budget=math.ceil((abs(delta) / 4 + 2) * 60),
                        joined=before['joined'])
            observation = page.evaluate(PROBE, args)
            record = {'axis': axis, 'target': target, 'before': observation, 'budget': args['budget']}
            trace['legs'].append(record)
            assert observation['ok'], observation
            if not observation['reached']:
                key = ('d' if direction > 0 else 'a') if axis == 'x' else ('w' if direction > 0 else 's')
                record['key'] = key
                try:
                    page.keyboard.down(key)
                    handle = page.wait_for_function(PROBE, arg={**args, 'wait': True}, polling=100, timeout=120000)
                    try:
                        observation = handle.json_value()
                    finally:
                        handle.dispose()
                    record['observed'] = observation
                    assert observation['ok'] and observation['reached'], observation
                finally:
                    page.keyboard.up(key)
            after = page.evaluate(PROBE, args)
            record['afterRelease'] = after
            assert after['ok'] and after['reached'], after
            if after['collision']:
                trace.update(status='collision-observed', after=after)
                return
        raise AssertionError('First collision did not occur on the complete approach')
    except Exception as exc:
        trace.update(status='failed', failure=str(exc), afterFailure=snapshot())
        raise
