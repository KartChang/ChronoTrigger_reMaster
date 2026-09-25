from scenery_h_preservation import restore_scenery_h_if_declared
"""Source-only inverse regression; synthetic text mutations, no native evidence."""
import hashlib,unittest
from pathlib import Path
from audio_g_preservation import SPEC,restore_audio_g_source,restore_audio_g_if_declared
from fair_trial_preservation import SPEC as FAIR,restore_fair_trial_source
ROOT=Path(__file__).resolve().parents[1]
sha=lambda text:hashlib.sha256(text.encode()).hexdigest()
class AudioGPreservationTests(unittest.TestCase):
    def test_exact_ci76_and_legacy_f_pins(self):
        for name in SPEC['files']:
            with self.subTest(name=name):
                raw=restore_scenery_h_if_declared(name,(ROOT/name).read_text());base=restore_audio_g_source(name,raw)
                self.assertEqual(sha(base),SPEC['originalSha256'][name])
                self.assertEqual(restore_audio_g_if_declared(name,base),base)
                self.assertEqual(sha(restore_fair_trial_source(name,raw)),FAIR['originalSha256'][name])
    def test_every_missing_duplicate_or_altered_fragment_is_rejected(self):
        for name,edits in SPEC['files'].items():
            raw=restore_scenery_h_if_declared(name,(ROOT/name).read_text())
            for e in edits:
                with self.subTest(name=name):
                    self.assertEqual(raw.count(e['after']),1)
                    for modified in [raw.replace(e['after'],''),raw+e['after'],raw.replace(e['after'],e['after'][:-1]+'?')]:
                        with self.assertRaises(AssertionError):restore_audio_g_source(name,modified)
    def test_unrelated_text_is_never_erased(self):
        for name in SPEC['files']:
            raw=restore_scenery_h_if_declared(name,(ROOT/name).read_text())+'\n# unrelated'
            value=restore_audio_g_source(name,raw)
            self.assertTrue(value.endswith('\n# unrelated'))
            self.assertNotEqual(sha(value),SPEC['originalSha256'][name])
    def test_undeclared_runtime_is_not_invertible(self):
        with self.assertRaises(ValueError):restore_audio_g_source('src/main.ts','no')
        self.assertEqual(restore_audio_g_if_declared('src/main.ts','no'),'no')
if __name__=='__main__':unittest.main()
