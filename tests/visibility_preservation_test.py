"""Offline source hashes and mutations only, not new native/visual acceptance."""
import hashlib
from pathlib import Path
import unittest
from visibility_preservation import SPEC, restore_visibility_source, restore_visibility_if_declared
ROOT = Path(__file__).resolve().parents[1]

class VisibilityPreservationTests(unittest.TestCase):
    def test_exact_c_hashes(self):
        for name in SPEC['files']:
            with self.subTest(name=name):
                value = restore_visibility_source(name, (ROOT/name).read_text())
                self.assertEqual(hashlib.sha256(value.encode()).hexdigest(), SPEC['originalSha256'][name])
                self.assertEqual(restore_visibility_if_declared(name, value), value)

    def test_missing_or_duplicated_hunks_fail(self):
        for name, edits in SPEC['files'].items():
            source = (ROOT/name).read_text()
            for edit in edits:
                for value in [source + edit['after'], source.replace(edit['after'], '', 1)]:
                    with self.subTest(name=name), self.assertRaises(AssertionError):
                        restore_visibility_source(name, value)

    def test_unrelated_bytes_are_never_erased(self):
        for name in SPEC['files']:
            value = restore_visibility_source(name, (ROOT/name).read_text() + '\n# UNRELATED\n')
            self.assertTrue(value.endswith('\n# UNRELATED\n'))
            self.assertNotEqual(hashlib.sha256(value.encode()).hexdigest(), SPEC['originalSha256'][name])

    def test_held_rules_and_native_routes_cannot_be_inverted(self):
        for name in ['src/core.ts','src/main.ts','src/prologue-render.ts','src/kingdom-render.ts','tests/cpu_era_journey.py','.github/workflows/ci.yml']:
            with self.subTest(name=name), self.assertRaises(ValueError):
                restore_visibility_source(name, 'changed')

if __name__ == '__main__':
    unittest.main()
