"""Reverse the explicitly declared O helper additions for original-I preservation.

This is a unit-only comparison; it never rewrites executable/browser code.
Original semantic/numeric changes outside these wires still fail the old hash.
"""
REPLACEMENTS = [['from cpu_native_precision import PrecisionStall, native_driver_pulse\n', ''], ['    resolution = PrecisionStall(ARRIVAL_EPSILON)\n', ''], ["            pulse['precisionResolution'] = resolution.receipt()\n            pulse['transport'] = 'driver-press' if resolution.active else 'split-calls'\n            if resolution.active:\n                pulse['driverOperations'] = []\n                native_driver_pulse(page, keys, milliseconds, pulse['driverOperations'])\n            else:\n                native_pulse(page, keys, milliseconds)\n", '            native_pulse(page, keys, milliseconds)\n'], ["            was_active = resolution.active\n            resolution.observe(error, target-current['state']['players'][0][axis], milliseconds)\n            # The compact driver call has a different cost. Relearn it from\n            # real released positions, not the old split-call movement floor.\n            release_distance = (0.0 if resolution.active and not was_active else\n                                max(0.0, min(1.0, moved-speed*milliseconds/1000)))\n", '            release_distance = max(0.0, min(1.0, moved-speed*milliseconds/1000))\n']]


def restore_i_route(source):
    for new, old in REPLACEMENTS:
        if not new or source.count(new) != 1:
            raise AssertionError('precision preservation wire changed')
        source = source.replace(new, old, 1)
    return source
