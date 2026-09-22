"""CI operator for a measured native pulse-resolution stall, not a game hook.

Playwright keyboard.press runs down/delay/up in its driver, without a Python
round trip for the held interval. It does not guarantee sub-frame movement.
Every result must still pass the caller's unchanged snapshot/budget checks.
"""
import math
import sys

POLICY = 'vq02o-driver-press-on-quantized-reversal'


class PrecisionStall:
    """Recognize two short, reversing misses wider than the arrival interval."""
    def __init__(self, epsilon):
        self.epsilon = epsilon
        self.misses = 0
        self.active = False
        self.minimum_step = 0.0

    def observe(self, before_error, after_error, hold_ms):
        moved = abs(after_error-before_error)
        missed = (before_error*after_error < 0 and
                  abs(before_error) >= self.epsilon and abs(after_error) >= self.epsilon and
                  hold_ms <= 34 and moved >= 2*self.epsilon)
        self.misses = self.misses+1 if missed else 0
        if missed:
            self.minimum_step = moved if not self.minimum_step else min(self.minimum_step, moved)
        if self.misses >= 2:
            self.active = True
        return self.active

    def receipt(self):
        return {'policy': POLICY, 'active': self.active,
                'reversingMisses': self.misses, 'observedStep': self.minimum_step}


def native_driver_pulse(page, keys, milliseconds, operations=None):
    """Same down/up chord order; only the innermost key uses driver press.

    Public native keyboard API only. On ANY partially dispatched press failure
    release every attempted key, preserving the original exception. Successful
    press already released its key, so do not delay the outer key with a second
    redundant inner key-up. No JS events, CDP, writable hooks or clock control.
    """
    if (not isinstance(keys, (list, tuple)) or not keys or len(keys) > 2 or len(set(keys)) != len(keys) or
            any(k not in ('w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight') for k in keys) or
            isinstance(milliseconds, bool) or not isinstance(milliseconds, (int, float)) or
            not math.isfinite(milliseconds) or not 0 <= milliseconds <= 250):
        raise ValueError('invalid native driver pulse')
    ops = operations if operations is not None else []
    attempted = []
    released = set()

    def command(method, key, delay=None):
        receipt = {'method': method, 'key': key, 'status': 'attempted'}
        if delay is not None:
            receipt['delayMs'] = delay
        ops.append(receipt)
        try:
            if method == 'press':
                page.keyboard.press(key, delay=delay)
            else:
                getattr(page.keyboard, method)(key)
            receipt['status'] = 'completed'
        except Exception as exc:
            receipt.update(status='failed', errorType=type(exc).__name__)
            raise

    try:
        for key in keys[:-1]:
            attempted.append(key)
            command('down', key)
        inner = keys[-1]
        attempted.append(inner)
        command('press', inner, milliseconds)
        released.add(inner)
    finally:
        active_error = sys.exc_info()[1]
        errors = []
        for key in reversed(attempted):
            if key in released:
                continue
            try:
                command('up', key)
            except Exception as exc:
                errors.append(exc)
        if errors and active_error is None:
            raise errors[0]
