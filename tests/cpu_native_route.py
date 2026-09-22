"""Closed-loop native keyboard movement for the CPU-only CI journey.

Read-only snapshots observe the result AFTER releasing input. Crossing a target
while a key is held is not arrival: slow rendering can defer the release event.
No browser clock, collision, state, save or input-hook mutation is used.
"""
import math
import sys
import time

ARRIVAL_EPSILON = .12
TIMEOUT_SECONDS = 30
MAX_PULSES = 256
COARSE_HOLD_MS = 250
OBSERVATION = """()=>({state:window.__CHRONO_TEST__.snapshot(),
  paused:window.__CHRONO_TEST__.paused()})"""


def native_pulse(page, keys, milliseconds):
    """Always release every attempted key, including a partially failed co-op chord."""
    attempted = []
    try:
        for key in keys:
            attempted.append(key)
            page.keyboard.down(key)
        if milliseconds:
            page.wait_for_timeout(milliseconds)
    finally:
        active_error = sys.exc_info()[1]
        errors = []
        for key in reversed(attempted):
            try:
                page.keyboard.up(key)
            except Exception as exc:
                errors.append(exc)
        if errors and active_error is None:
            raise errors[0]


def move_axis(page, axis, target, coop=False, evidence=None, clock=time.monotonic):
    """Converge within the ORIGINAL per-leg tick budget and 30-second ceiling.

    This corrects an overshoot with ordinary opposite-direction key presses;
    it never retries an entire journey or manufactures a successful position.
    """
    if axis not in ('x', 'z') or not math.isfinite(target):
        raise ValueError('invalid movement target')
    before = page.evaluate(OBSERVATION)
    initial = before['state']
    speed = 2.4 if initial['chapter'] == 'overworld1000' else 4
    budget = math.ceil((abs(target-initial['players'][0][axis])/speed+2)*60)
    deadline = clock()+TIMEOUT_SECONDS
    trace = {'axis': axis, 'target': target, 'coop': coop, 'status': 'moving',
             'epsilon': ARRIVAL_EPSILON, 'budget': budget, 'timeoutMs': 30000,
             'before': before, 'pulses': [],
             'policy': 'vq02h-distance-scaled-native-pulses', 'maxHoldMs': COARSE_HOLD_MS,
             'arrivalOwner': 0, 'chordPolicy': 'vq02i-coarse-preserving-precision-chord'}
    if evidence is not None:
        evidence.append(trace)
    current = before
    release_distance = 0.0
    previous_error = None
    precision_chord = False
    reversals = 0
    try:
        for _ in range(MAX_PULSES+1):
            state = current['state']
            trace['last'] = current
            elapsed = state['ticks']-initial['ticks']
            if (current['paused'] or state['mode'] != 'explore' or
                    state['chapter'] != initial['chapter'] or
                    elapsed < 0 or elapsed > budget or clock() > deadline):
                raise AssertionError({'reason': 'native route boundary/budget', 'route': trace})
            error = target-state['players'][0][axis]
            if abs(error) < ARRIVAL_EPSILON:
                trace.update(status='arrived', afterRelease=current)
                return state
            if len(trace['pulses']) >= MAX_PULSES:
                raise AssertionError({'reason': 'native pulse bound', 'route': trace})
            key = ('d' if error > 0 else 'a') if axis == 'x' else ('w' if error > 0 else 's')
            arrows = {'d': 'ArrowRight', 'a': 'ArrowLeft', 'w': 'ArrowUp', 's': 'ArrowDown'}
            # Keep H's efficient long-leg chord. Near arrival, put measured P1
            # INSIDE the chord: P2 down -> P1 down -> hold -> P1 up -> P2 up.
            # P1 otherwise moves during both P2 calls even with a 0ms hold
            # (CI50: 8-9 ticks), which can oscillate across the .12 tolerance.
            # Once in precision order, keep it; its release cost is different,
            # so learn it afresh rather than subtracting the outer-key drift.
            if (coop and not precision_chord and
                    abs(error) <= speed*COARSE_HOLD_MS/1000+release_distance):
                precision_chord = True
                release_distance = 0.0
            keys = ([arrows[key], key] if precision_chord else [key, arrows[key]]) if coop else [key]
            # Long legs amortize real key-up/snapshot cost with a bounded coarse
            # hold. A 100ms cap spent CI49's original budget on 29 observations.
            # Still shorten at the target and account for observed release drift.
            # All unheld observation ticks remain charged to the SAME leg budget.
            milliseconds = min(COARSE_HOLD_MS, max(0, int((abs(error)-release_distance)/speed*1000)))
            reversals = reversals+1 if previous_error is not None and error*previous_error < 0 else 0
            if reversals >= 2:
                # A minimum native release interval can straddle a narrow target.
                # Vary one real hold by a tick-sized interval instead of oscillating.
                milliseconds = min(COARSE_HOLD_MS, milliseconds+17)
                reversals = 0
            previous_error = error
            pulse = {'keys': keys, 'releaseKeys': list(reversed(keys)),
                     'chordOrder': ('primary-inner' if precision_chord else 'primary-outer') if coop else 'single-owner',
                     'holdMs': milliseconds, 'before': current}
            trace['pulses'].append(pulse)
            native_pulse(page, keys, milliseconds)
            current = page.evaluate(OBSERVATION)
            pulse['afterRelease'] = current
            moved = abs(current['state']['players'][0][axis]-state['players'][0][axis])
            release_distance = max(0.0, min(1.0, moved-speed*milliseconds/1000))
        raise AssertionError('unreachable native route bound')
    except Exception as exc:
        trace.update(status='failed', errorType=type(exc).__name__)
        raise
