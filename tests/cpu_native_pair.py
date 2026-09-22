"""CI-only dual-owner convergence; ordinary I/single-player drivers stay intact.

Both actors use native keys and unmodified snapshots. The original PRIMARY
leg distance still owns ONE tick budget/deadline, including peer corrections.
This is a test operator, never a gameplay movement/teleport/follow hook.
"""
import math
import time
from cpu_native_precision import PrecisionStall, native_driver_pulse
from cpu_native_route import (ARRIVAL_EPSILON, TIMEOUT_SECONDS, MAX_PULSES,
                              COARSE_HOLD_MS, OBSERVATION, native_pulse)

POLICY = 'vq02n-independent-paired-arrival'


def peer_present(state):
    return state['joined'] and (state['trial']['stage'] == 'none' or state['trial']['luccaJoined'])


def move_pair_axis(page, axis, target, evidence=None, clock=time.monotonic):
    if axis not in ('x', 'z') or isinstance(target, bool) or not math.isfinite(target):
        raise ValueError('invalid paired movement target')
    before = page.evaluate(OBSERVATION)
    initial = before['state']
    speed = 2.4 if initial['chapter'] == 'overworld1000' else 4
    budget = math.ceil((abs(target-initial['players'][0][axis])/speed+2)*60)
    deadline = clock()+TIMEOUT_SECONDS
    trace = {'axis': axis, 'target': target, 'coop': True, 'status': 'moving',
             'epsilon': ARRIVAL_EPSILON, 'budget': budget, 'timeoutMs': 30000,
             'before': before, 'pulses': [], 'policy': POLICY,
             'maxHoldMs': COARSE_HOLD_MS, 'arrivalOwner': 0, 'arrivalOwners': [0, 1]}
    if evidence is not None:
        evidence.append(trace)
    current = before
    drift = [0., 0.]
    pair_drift = [0., 0.]  # observed outer/inner command cost, not game time
    previous_error = [None, None]
    reversals = [0, 0]
    resolution = [PrecisionStall(ARRIVAL_EPSILON) for _ in range(2)]
    try:
        for _ in range(MAX_PULSES+1):
            state = current['state']
            trace['last'] = current
            elapsed = state['ticks']-initial['ticks']
            if (current['paused'] or state['mode'] != 'explore' or
                    state['chapter'] != initial['chapter'] or not peer_present(state) or
                    elapsed < 0 or elapsed > budget or clock() > deadline):
                raise AssertionError({'reason': 'paired route boundary/budget', 'route': trace})
            errors = [target-p[axis] for p in state['players']]
            if len(errors) != 2 or not all(math.isfinite(e) for e in errors):
                raise AssertionError('invalid paired coordinates')
            if all(abs(e) < ARRIVAL_EPSILON for e in errors):
                trace.update(status='arrived', afterRelease=current)
                return state
            if len(trace['pulses']) >= MAX_PULSES:
                raise AssertionError({'reason': 'paired pulse bound', 'route': trace})
            # Shared travel amortizes native latency; put the farther owner on
            # the outside of the chord instead of accumulating peer lag.
            # Once either arrives, only the remaining owner receives input.
            order = sorted(range(2), key=lambda i: (-abs(errors[i]), i))
            paired_ms = min(COARSE_HOLD_MS, max(0, int(min(
                abs(errors[i])-pair_drift[j] for j, i in enumerate(order))/speed*1000)))
            coarse = (errors[0]*errors[1] > 0 and
                      all(abs(e) >= ARRIVAL_EPSILON for e in errors) and
                      (paired_ms >= 50 or all(abs(errors[i])-pair_drift[j] > -ARRIVAL_EPSILON
                                             for j, i in enumerate(order))))
            owners = order if coarse else [max(range(2), key=lambda i: abs(errors[i]))]
            keys = []
            for owner in owners:
                e = errors[owner]
                key = ('d' if e > 0 else 'a') if axis == 'x' else ('w' if e > 0 else 's')
                keys.append(key if owner == 0 else {'d':'ArrowRight','a':'ArrowLeft','w':'ArrowUp','s':'ArrowDown'}[key])
            if not coarse and previous_error[owners[0]] is None:
                drift[owners[0]] = pair_drift[1]
            milliseconds = paired_ms if coarse else min(COARSE_HOLD_MS,
                max(0, int((abs(errors[owners[0]])-drift[owners[0]])/speed*1000)))
            if not coarse:
                i = owners[0]
                reversals[i] = reversals[i]+1 if previous_error[i] is not None and errors[i]*previous_error[i] < 0 else 0
                if reversals[i] >= 2:
                    milliseconds = min(COARSE_HOLD_MS, milliseconds+17)
                    reversals[i] = 0
                previous_error[i] = errors[i]
            pulse = {'keys': keys, 'releaseKeys': list(reversed(keys)), 'owners': owners,
                     'chordOrder': 'paired-coarse' if coarse else 'independent-precision',
                     'holdMs': milliseconds, 'before': current}
            trace['pulses'].append(pulse)
            compact = not coarse and resolution[owners[0]].active
            pulse['transport'] = 'driver-press' if compact else 'split-calls'
            pulse['precisionResolution'] = [item.receipt() for item in resolution]
            if compact:
                pulse['driverOperations'] = []
                native_driver_pulse(page, keys, milliseconds, pulse['driverOperations'])
            else:
                native_pulse(page, keys, milliseconds)
            current = page.evaluate(OBSERVATION)
            pulse['afterRelease'] = current
            for j, i in enumerate(owners):
                moved = abs(current['state']['players'][i][axis]-state['players'][i][axis])
                # Shared and precision commands have different costs; retain
                # separate observed estimates without modifying the game clock.
                cost = max(0., min(1., moved-speed*milliseconds/1000))
                if coarse:
                    pair_drift[j] = cost
                else:
                    was_active = resolution[i].active
                    resolution[i].observe(errors[i], target-current['state']['players'][i][axis], milliseconds)
                    drift[i] = 0. if resolution[i].active and not was_active else cost
        raise AssertionError('unreachable paired route bound')
    except Exception as exc:
        trace.update(status='failed', errorType=type(exc).__name__)
        raise
